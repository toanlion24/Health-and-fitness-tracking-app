/**
 * Breaks circular imports between api/client and auth-store.
 * Call bindAuthSessionHandlers once after the auth store is created.
 */

export type AuthSessionHandlers = {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  commitTokens: (accessToken: string, refreshToken: string) => Promise<void>;
};

let handlers: AuthSessionHandlers | null = null;

export function bindAuthSessionHandlers(next: AuthSessionHandlers): void {
  handlers = next;
}

export function getAuthSessionHandlers(): AuthSessionHandlers | null {
  return handlers;
}
