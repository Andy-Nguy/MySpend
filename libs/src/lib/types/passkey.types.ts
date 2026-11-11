import { IBaseEntity } from './base.types';

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
