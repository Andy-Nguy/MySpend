import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
    const res = await this.passkeyRepo.delete({ id, userId });
    return (res.affected ?? 0) > 0;
  }

  async saveChallenge(data: {
    userId?: string | null;
    challenge: string;
    type: 'registration' | 'authentication';
    expiresAt: Date;
  }): Promise<PasskeyChallengeEntity> {
    const record = this.challengeRepo.create(data);
    return this.challengeRepo.save(record);
  }

  findValidChallenge(
    challenge: string,
    type: 'registration' | 'authentication',
  ): Promise<PasskeyChallengeEntity | null> {
    return this.challengeRepo.findOne({
      where: {
        challenge,
        type,
        expiresAt: MoreThan(new Date()),
      },
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
