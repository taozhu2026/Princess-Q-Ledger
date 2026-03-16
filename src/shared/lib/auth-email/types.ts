export const AUTH_EMAIL_ACTIONS = ["signup", "magiclink", "recovery"] as const;

export type AuthEmailAction = (typeof AUTH_EMAIL_ACTIONS)[number];

export interface AuthEmailRequest {
  action: AuthEmailAction;
  email: string;
  password?: string;
  displayName?: string;
  nextPath?: string;
}
