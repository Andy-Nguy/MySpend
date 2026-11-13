import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PasskeyChallengeTypeEnum } from '@myspend/libs';
import { Repository, MoreThan } from 'typeorm';
import { UserPasskeyEntity } from '../../entities/passkey/user-passkey.entity';
import { PasskeyChallengeEntity } from '../../entities/passkey/passkey-challenge.entity';

@Injectable()
export class PasskeysRepository {
  constructor(
    @InjectRepository(UserPasskeyEntity)
    private readonly passkeyRepo: Repository<UserPasskeyEntity>,
    @InjectRepository(PasskeyChallengeEntity)
    private readonly challengeRepo: Repository<PasskeyChallengeEntity>,
  ) {}

  findUserPasskeys(userId: string): Promise<UserPasskeyEntity[]> {
    return this.passkeyRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  findByCredentialId(credentialId: string): Promise<UserPasskeyEntity | null> {
    return this.passkeyRepo.findOne({
      where: { credentialId },
      relations: { user: true },
    });
  }

  savePasskey(data: Partial<UserPasskeyEntity>): Promise<UserPasskeyEntity> {
    const passkey = this.passkeyRepo.create(data);
    return this.passkeyRepo.save(passkey);
  }

  async updateCounter(id: string, counter: number): Promise<void> {
    await this.passkeyRepo.update({ id }, { counter });
  }

  async deletePasskey(userId: string, id: string): Promise<boolean> {
    // Hard delete is intentional: revoked passkeys cannot be reused and allow re-enrollment without credential_id conflicts.
    const res = await this.passkeyRepo.delete({ id, userId });
    return (res.affected ?? 0) > 0;
  }

  async saveChallenge(data: {
    userId?: string | null;
    challenge: string;
    type: PasskeyChallengeTypeEnum;
    expiresAt: Date;
  }): Promise<PasskeyChallengeEntity> {
    await this.cleanExpiredChallenges();
    const record = this.challengeRepo.create(data);
    return this.challengeRepo.save(record);
  }

  findValidChallenge(
    challenge: string,
    type: PasskeyChallengeTypeEnum,
  ): Promise<PasskeyChallengeEntity | null> {
    return this.challengeRepo.findOne({
      where: {
        challenge,
        type,
        expiresAt: MoreThan(new Date()),
      },
    });
  }

  /**
   * Atomically consumes (deletes and returns) a valid challenge in a single query
   * to prevent replay attacks and race conditions.
   */
  async consumeValidChallenge(
    challenge: string,
    type: PasskeyChallengeTypeEnum,
  ): Promise<PasskeyChallengeEntity | null> {
    const result = await this.challengeRepo
      .createQueryBuilder()
      .delete()
      .from(PasskeyChallengeEntity)
      .where('challenge = :challenge', { challenge })
      .andWhere('type = :type', { type })
      .andWhere('expires_at > :now', { now: new Date() })
      .returning(['id', 'user_id', 'challenge', 'type', 'expires_at', 'created_at'])
      .execute();

    const row = result.raw?.[0];
    if (!row) return null;

    return this.challengeRepo.create({
      id: row.id,
      userId: row.user_id ?? null,
      challenge: row.challenge,
      type: row.type,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    });
  }

  async deleteChallenge(id: string): Promise<void> {
    await this.challengeRepo.delete({ id });
  }

  async cleanExpiredChallenges(): Promise<void> {
    await this.challengeRepo
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now: new Date() })
      .execute();
  }
}
