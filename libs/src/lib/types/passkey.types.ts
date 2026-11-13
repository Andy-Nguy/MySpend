import { IBaseEntity } from './base.types';
import { PasskeyChallengeTypeEnum } from '../enums/passkey-challenge-type.enum';

export interface IUserPasskey extends IBaseEntity {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  deviceType?: string | null;
  backedUp?: boolean;
  transports?: string[] | null;
  deviceName?: string | null;
}

export interface IPasskeyChallenge {
  id: string;
  userId?: string | null;
  challenge: string;
  type: PasskeyChallengeTypeEnum;
  expiresAt: Date;
  createdAt: Date;
}
