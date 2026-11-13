import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PasskeyChallengeTypeEnum } from '@myspend/libs';
import {
  AuthenticationResponseJSON,
  AuthenticatorTransport,
  PublicKeyCredentialDescriptorJSON,
  RegistrationResponseJSON,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
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

  private getRpConfig(requestOrigin?: string) {
    const rpName = this.config.get<string>('passkey.rpName') || 'MySpend';
    const rawOrigins =
      this.config.get<string>('passkey.origin') ||
      this.config.get<string>('corsOrigin') ||
      'http://localhost:4200';

    const parsedOrigins = rawOrigins
      .split(',')
      .map((origin) => origin.trim().replace(/\/+$/, ''))
      .filter(Boolean);

    const origins = Array.from(
      new Set([...parsedOrigins, 'http://localhost:4200', 'http://127.0.0.1:4200']),
    );

    const normalizedRequestOrigin = requestOrigin?.trim().replace(/\/+$/, '');
    const activeOrigin =
      normalizedRequestOrigin && origins.includes(normalizedRequestOrigin)
        ? normalizedRequestOrigin
        : parsedOrigins[0] || 'http://localhost:4200';

    let rpId = this.config.get<string>('passkey.rpId');
    if (!rpId) {
      try {
        rpId = new URL(activeOrigin).hostname;
      } catch {
        rpId = 'localhost';
      }
    }

    return { rpName, rpId, origins };
  }

  private extractChallenge(clientDataJSON: string): string {
    let clientChallenge: string | undefined;
    try {
      const clientData = JSON.parse(
        Buffer.from(clientDataJSON, 'base64url').toString('utf8'),
      );
      clientChallenge = clientData?.challenge;
    } catch {
      throw new BadRequestException('Malformed clientDataJSON');
    }

    if (!clientChallenge) {
      throw new BadRequestException('Missing challenge in clientDataJSON');
    }

    return clientChallenge;
  }

  private toTransports(
    transports?: string[] | null,
  ): AuthenticatorTransport[] | undefined {
    if (!transports || transports.length === 0) {
      return undefined;
    }
    return transports as AuthenticatorTransport[];
  }

  async getRegistrationOptions(userId: string, requestOrigin?: string) {
    const profile = await this.profilesRepository.findById(userId);
    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    const userPasskeys = await this.passkeysRepository.findUserPasskeys(userId);
    const { rpName, rpId } = this.getRpConfig(requestOrigin);

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
        transports: this.toTransports(pk.transports),
      })),
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        userVerification: 'required',
      },
    });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await this.passkeysRepository.saveChallenge({
      userId,
      challenge: options.challenge,
      type: PasskeyChallengeTypeEnum.REGISTRATION,
      expiresAt,
    });

    return options;
  }

  async verifyRegistration(
    userId: string,
    response: RegistrationResponseJSON,
    deviceName?: string,
    requestOrigin?: string,
  ) {
    const clientChallenge = this.extractChallenge(
      response.response.clientDataJSON,
    );

    const challengeRecord = await this.passkeysRepository.consumeValidChallenge(
      clientChallenge,
      PasskeyChallengeTypeEnum.REGISTRATION,
    );

    if (!challengeRecord || challengeRecord.userId !== userId) {
      throw new UnauthorizedException('Registration challenge expired or invalid');
    }

    const { rpId, origins } = this.getRpConfig(requestOrigin);

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response,
        expectedChallenge: challengeRecord.challenge,
        expectedOrigin: origins,
        expectedRPID: rpId,
        requireUserVerification: true,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Registration verification failed';
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
      transports: credential.transports ?? null,
      deviceName: deviceName || 'FaceID / Passkey Device',
    });

    this.logger.log(
      `[Passkeys] Registered passkey ${saved.id} for user ${userId} (${saved.deviceName})`,
    );

    return { verified: true, passkeyId: saved.id };
  }

  async getAuthenticationOptions(email?: string, requestOrigin?: string) {
    const { rpId } = this.getRpConfig(requestOrigin);
    let allowCredentials: PublicKeyCredentialDescriptorJSON[] | undefined =
      undefined;
    let targetUserId: string | null = null;
    let shouldPersistChallenge = true;

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      const profile = await this.profilesRepository.findByEmail(normalizedEmail);
      if (profile) {
        targetUserId = profile.id;
        const userPasskeys = await this.passkeysRepository.findUserPasskeys(
          profile.id,
        );
        if (userPasskeys.length > 0) {
          allowCredentials = userPasskeys.map((pk) => ({
            id: pk.credentialId,
            type: 'public-key',
            transports: this.toTransports(pk.transports),
          }));
        }
      } else {
        // Prevent user enumeration and cross-account authentication if email does not exist
        shouldPersistChallenge = false;
      }
    }

    const options = await generateAuthenticationOptions({
      rpID: rpId,
      allowCredentials,
      userVerification: 'required',
    });

    if (shouldPersistChallenge) {
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      await this.passkeysRepository.saveChallenge({
        userId: targetUserId,
        challenge: options.challenge,
        type: PasskeyChallengeTypeEnum.AUTHENTICATION,
        expiresAt,
      });
    }

    return options;
  }

  async verifyAuthentication(
    response: AuthenticationResponseJSON,
    requestOrigin?: string,
  ) {
    const clientChallenge = this.extractChallenge(
      response.response.clientDataJSON,
    );

    const challengeRecord = await this.passkeysRepository.consumeValidChallenge(
      clientChallenge,
      PasskeyChallengeTypeEnum.AUTHENTICATION,
    );
    if (!challengeRecord) {
      throw new UnauthorizedException(
        'Authentication challenge expired or invalid',
      );
    }

    const passkey = await this.passkeysRepository.findByCredentialId(response.id);
    if (!passkey || !passkey.user) {
      throw new UnauthorizedException('Passkey credential not recognized');
    }

    if (challengeRecord.userId && challengeRecord.userId !== passkey.userId) {
      throw new UnauthorizedException('Challenge does not match passkey owner');
    }

    const { rpId, origins } = this.getRpConfig(requestOrigin);

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: challengeRecord.challenge,
        expectedOrigin: origins,
        expectedRPID: rpId,
        requireUserVerification: true,
        credential: {
          id: passkey.credentialId,
          publicKey: new Uint8Array(Buffer.from(passkey.publicKey, 'base64url')),
          counter: Number(passkey.counter),
          transports: this.toTransports(passkey.transports),
        },
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Authentication verification failed';
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
