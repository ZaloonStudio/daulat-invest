export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  const messages: Record<string, string> = {
    'auth/configuration-not-found': 'Account sign-in is not configured on the server yet. Please try again after the Firebase setup is complete.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled yet. Please use another method or contact Daulat support.',
    'auth/unauthorized-domain': 'Sign-in is not enabled for this website address yet. Please contact Daulat support.',
    'auth/invalid-api-key': 'Account sign-in is temporarily unavailable because of a server configuration issue.',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Account sign-in is temporarily unavailable because of a server configuration issue.',
    'auth/popup-blocked': 'Your browser blocked the Google sign-in window. Allow pop-ups for this website, then try again.',
    'auth/popup-closed-by-user': 'The Google sign-in window was closed. You can try again or sign in with email.',
    'auth/cancelled-popup-request': 'Another sign-in window is already open. Please finish there first.',
    'auth/account-exists-with-different-credential': 'This email already has a Daulat account with another sign-in method. Sign in with your app password, or reset your password below.',
    'auth/invalid-credential': 'The email or password is incorrect. Use your Daulat app credentials or reset your password.',
    'auth/wrong-password': 'The email or password is incorrect.',
    'auth/user-not-found': 'The email or password is incorrect.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact Daulat support.',
    'auth/network-request-failed': 'Unable to connect. Check your internet connection and try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait a little before trying again.',
  };
  return messages[code] || 'Unable to sign in right now. Please try again.';
}
