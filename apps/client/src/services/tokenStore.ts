let accessToken: string | null = null;

export const tokenStore = {
  getAccessToken() {
    return accessToken;
  },

  setAccessToken(token: string) {
    accessToken = token;
  },

  clearAccessToken() {
    accessToken = null;
  },
};
