import {
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';
import { apiClient } from './api.service';
import { IAuthUser } from '../context/AuthContext';

export interface IUserPasskeyItem {
  id: string;
  credentialId: string;
  deviceName: string;
  deviceType?: string;
  backedUp?: boolean;
  createdAt: string;
}

export interface ILastLoggedUser {
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  hasPasskey?: boolean;
}

const LAST_USER_KEY = 'myspend:last_logged_user';

export const passkeyService = {
  async isSupported(): Promise<boolean> {
    if (!browserSupportsWebAuthn()) return false;
    try {
      return await platformAuthenticatorIsAvailable();
    } catch {
      return false;
    }
  },

  getFriendlyDeviceName(): string {
    const ua = navigator.userAgent;
    if (/iPhone/i.test(ua)) return 'iPhone (FaceID / Passcode)';
    if (/iPad/i.test(ua)) return 'iPad (TouchID / FaceID)';
    if (/Macintosh/i.test(ua)) return 'MacBook (TouchID / Passcode)';
    if (/Android/i.test(ua)) return 'Android (Vân tay / Sinh trắc học)';
    if (/Windows/i.test(ua)) return 'Windows PC (Windows Hello)';
    return 'Thiết bị Sinh trắc học';
  },

  getLastLoggedUser(): ILastLoggedUser | null {
    try {
      const data = localStorage.getItem(LAST_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setLastLoggedUser(user: Partial<IAuthUser> & { email: string; hasPasskey?: boolean }) {
    try {
      const existing = this.getLastLoggedUser();
      const info: ILastLoggedUser = {
        email: user.email,
        displayName:
          user.displayName ||
          `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
          user.email.split('@')[0],
        avatarUrl: user.avatarUrl || null,
        hasPasskey: user.hasPasskey ?? existing?.hasPasskey ?? false,
      };
      localStorage.setItem(LAST_USER_KEY, JSON.stringify(info));
    } catch {
      // ignore storage error
    }
  },

  clearLastLoggedUser() {
    localStorage.removeItem(LAST_USER_KEY);
  },

  async registerPasskey(
    customDeviceName?: string
  ): Promise<{ verified: boolean; passkeyId: string }> {
    // 1. Get options from server
    const { data: optionsJSON } = await apiClient.get(
      '/auth/passkey/register-options'
    );

    // 2. Prompt FaceID / TouchID / Passkey
    const response = await startRegistration({ optionsJSON });

    // 3. Send response to server for verification and saving
    const deviceName = customDeviceName || this.getFriendlyDeviceName();
    const { data: verifyResult } = await apiClient.post(
      '/auth/passkey/register-verify',
      {
        response,
        deviceName,
      }
    );

    // Update last logged user state
    const lastUser = this.getLastLoggedUser();
    if (lastUser) {
      lastUser.hasPasskey = true;
      localStorage.setItem(LAST_USER_KEY, JSON.stringify(lastUser));
    }

    return verifyResult;
  },

  async loginWithPasskey(
    email?: string
  ): Promise<{ accessToken: string; user: IAuthUser }> {
    // 1. Get authentication options from server
    const { data: optionsJSON } = await apiClient.post(
      '/auth/passkey/login-options',
      {
        email,
      }
    );

    // 2. Prompt FaceID / TouchID / Passkey
    const response = await startAuthentication({ optionsJSON });

    // 3. Verify authentication response on server
    const { data: authResponse } = await apiClient.post(
      '/auth/passkey/login-verify',
      {
        response,
      }
    );

    // Update last logged user
    if (authResponse?.user) {
      this.setLastLoggedUser({ ...authResponse.user, hasPasskey: true });
    }

    return authResponse;
  },

  async listPasskeys(): Promise<IUserPasskeyItem[]> {
    const { data } = await apiClient.get<IUserPasskeyItem[]>(
      '/auth/passkey/list'
    );
    return data;
  },

  async deletePasskey(id: string): Promise<void> {
    await apiClient.delete(`/auth/passkey/${id}`);
  },
};
