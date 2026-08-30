import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProfileEntity } from '../../entities/profile/profile.entity';

@Injectable()
export class ProfilesRepository {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly repository: Repository<ProfileEntity>
  ) {}

  async upsertFromSupabaseUser(user: { id: string; email?: string | null }) {
    const email = user.email?.toLowerCase();
    if (!email) {
      throw new Error('User email is required to upsert profile');
    }

    const existingById = await this.repository.findOne({ where: { id: user.id } });
    if (existingById) {
      if (existingById.email !== email) {
        existingById.email = email;
        return this.repository.save(existingById);
      }
      return existingById;
    }

    const existingByEmail = await this.repository.findOne({ where: { email } });
    if (existingByEmail && existingByEmail.id !== user.id) {
      await this.repository.delete({ id: existingByEmail.id });
    }

    const profile = this.repository.create({
      id: user.id,
      email,
    });

    return this.repository.save(profile);
  }

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.repository.findOne({ where: { email: email.toLowerCase() } });
  }
}
