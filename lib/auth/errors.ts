export const AUTH_ERROR_MESSAGES = {
  auth_required: "Sign in with Google to continue.",
  callback_failed: "We could not complete sign-in. Please try again.",
  missing_code: "The sign-in response was incomplete. Please try again.",
  oauth_cancelled: "Google sign-in was cancelled or denied.",
  oauth_start_failed: "Google sign-in could not be started. Please try again.",
  profile_unavailable: "Your profile could not be loaded. Please try again.",
  signout_failed: "We could not sign you out. Please try again.",
} as const;

export type AuthErrorCode = keyof typeof AUTH_ERROR_MESSAGES;

export function getAuthErrorMessage(value: string | string[] | undefined) {
  const code = Array.isArray(value) ? value[0] : value;

  if (!code || !(code in AUTH_ERROR_MESSAGES)) {
    return null;
  }

  return AUTH_ERROR_MESSAGES[code as AuthErrorCode];
}

export function getAuthErrorPath(
  code: AuthErrorCode,
): `/?auth_error=${AuthErrorCode}` {
  return `/?auth_error=${code}`;
}
