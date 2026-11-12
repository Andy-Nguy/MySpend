import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/server';

import { PasskeysRepository } from './repository/passkeys.repository';
import { ProfilesRepository } from '../profiles/repository/profiles.repository';
import { AuthService } from './auth.service';

@Injectable()
export class PasskeysService {
  private readonly logger = new Logger(PasskeysService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly passkeysRepository: PasskeysRepository,
    private readonly profilesRepository: ProfilesRepository,
    private readonly authService: AuthService,
  ) {}

  private getRpConfig() {
    const rpName = this.config.get<string>('passkey.rpName') || 'MySpend';
    const rpId = this.config.get<string>('passkey.rpId') || 'localhost';
    const primaryOrigin =
      this.config.get<string>('passkey.origin') ||
      this.config.get<string>('corsOrigin') ||
      'http://localhost:4200';

    const origins = Array.from(
      new Set([primaryOrigin, 'http://localhost:4200', 'http://127.0.0.1:4200']),
    );

    return { rpName, rpId, origins };
  }

  async getRegistrationOptions(userId: string) {
    const profile = await this.profilesRepository.findById(userId);
    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    const userPasskeys = await this.passkeysRepository.findUserPasskeys(userId);
    const { rpName, rpId } = this.getRpConfig();

    const options = await generateRegistrationOptions({
      rpName,
      rpID: rpId,
      userID: new Uint8Array(Buffer.from(userId)),
      userName: profile.email,
      userDisplayName:
        profile.displayName ||
        `${profile.firstName || ''} ${profile.lastName || ''}`.trim() ||
        profile.email,
      attestationType: 'none',
      excludeCredentials: userPasskeys.map((pk) => ({
        id: pk.credentialId,
        transports: (pk.transports as any) || undefined,
      })),
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await this.passkeysRepository.saveChallenge({
      userId,
      challenge: options.challenge,
      type: 'registration',
      expiresAt,
    });

    return options;
  }

  async verifyRegistration(
    userId: string,
    response: RegistrationResponseJSON,
    deviceName?: string,
  ) {
    let clientChallenge: string | undefined;
    try {
      const clientData = JSON.parse(
        Buffer.from(response.response.clientDataJSON, 'base64url').toString('utf8'),
      );
      clientChallenge = clientData?.challenge;
    } catch {
      throw new BadRequestException('Malformed clientDataJSON');
    }

    if (!clientChallenge) {
      throw new BadRequestException('Missing challenge in clientDataJSON');
    }

    const challengeRecord = await this.passkeysRepository.findValidChallenge(
      clientChallenge,
      'registration',
    );

    if (!challengeRecord || challengeRecord.userId !== userId) {
      throw new UnauthorizedException('Registration challenge expired or invalid');
    }

    const { rpId, origins } = this.getRpConfig();

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: challengeRecord.challenge,
        expectedOrigin: origins,
        expectedRPID: rpId,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration verification failed';
      this.logger.error(`[Passkeys] Registration verification error: ${msg}`);
      throw new BadRequestException(msg);
    }

    if (!verification.verified || !verification.registrationInfo) {
      throw new BadRequestException('Passkey verification failed');
    }

    const { credential, credentialDeviceType, credentialBackedUp } =
      verification.registrationInfo;

    const saved = await this.passkeysRepository.savePasskey({
      userId,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString('base64url'),
      counter: credential.counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: (credential.transports as any) || undefined,
      deviceName: deviceName || 'FaceID / Passkey Device',
    });

    await this.passkeysRepository.deleteChallenge(challengeRecord.id);

    this.logger.log(
      `[Passkeys] Registered passkey ${saved.id} for user ${userId} (${saved.deviceName})`,
    );

    return { verified: true, passkeyId: saved.id };
  }

  async getAuthenticationOptions(email?: string) {
    const { rpId } = this.getRpConfig();
    let allowCredentials: any[] | undefined = undefined;

    if (email) {
      const profile = await this.profilesRepository.findByEmail(email);
      if (profile) {
        const userPasskeys = await this.passkeysRepository.findUserPasskeys(profile.id);
        if (userPasskeys.length > 0) {
          allowCredentials = userPasskeys.map((pk) => ({
            id: pk.credentialId,
            transports: pk.transports || undefined,
          }));
        }
      }
    }

    const options = await generateAuthenticationOptions({
      rpID: rpId,
      allowCredentials,
      userVerification: 'preferred',
    });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await this.passkeysRepository.saveChallenge({
      challenge: options.challenge,
      type: 'authentication',
      expiresAt,
    });

    return options;
  }

  async verifyAuthentication(response: AuthenticationResponseJSON) {
    let clientChallenge: string | undefined;
    try {
      const clientData = JSON.parse(
        Buffer.from(response.response.clientDataJSON, 'base64url').toString('utf8'),
      );
      clientChallenge = clientData?.challenge;
    } catch {
      throw new BadRequestException('Malformed clientDataJSON');
    }

    if (!clientChallenge) {
      throw new UnauthorizedException('Missing client challenge');
    }

    const challengeRecord = await this.passkeysRepository.findValidChallenge(
      clientChallenge,
      'authentication',
    );
    if (!challengeRecord) {
      throw new UnauthorizedException('Authentication challenge expired or invalid');
    }

    const passkey = await this.passkeysRepository.findByCredentialId(response.id);
    if (!passkey || !passkey.user) {
      throw new UnauthorizedException('Passkey credential not recognized');
    }

    const { rpId, origins } = this.getRpConfig();

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: challengeRecord.challenge,
        expectedOrigin: origins,
        expectedRPID: rpId,
        credential: {
          id: passkey.credentialId,
          publicKey: new Uint8Array(Buffer.from(passkey.publicKey, 'base64url')),
          counter: Number(passkey.counter),
          transports: (passkey.transports as any) || undefined,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication verification failed';
      this.logger.error(`[Passkeys] Authentication verification error: ${msg}`);
      throw new UnauthorizedException(msg);
    }

    if (!verification.verified) {
      throw new UnauthorizedException('Biometric authentication failed');
    }

    await this.passkeysRepository.updateCounter(
      passkey.id,
      verification.authenticationInfo.newCounter,
    );
    await this.passkeysRepository.deleteChallenge(challengeRecord.id);

    this.logger.log(
      `[Passkeys] Successfully authenticated user: ${passkey.user.email} via Passkey`,
    );

    return this.authService.createSession(passkey.user);
  }

  async getUserPasskeys(userId: string) {
    const list = await this.passkeysRepository.findUserPasskeys(userId);
    return list.map((pk) => ({
      id: pk.id,
      credentialId: pk.credentialId,
      deviceName: pk.deviceName || 'FaceID Device',
      deviceType: pk.deviceType,
      backedUp: pk.backedUp,
      createdAt: pk.createdAt,
    }));
  }

  async deletePasskey(userId: string, id: string) {
    const success = await this.passkeysRepository.deletePasskey(userId, id);
    if (!success) {
      throw new NotFoundException('Passkey not found');
    }
    return { success: true };
  }
}
