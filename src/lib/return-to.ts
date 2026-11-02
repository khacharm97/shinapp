// Remembers which page to go back to after logging in or signing up.
// Kept in sessionStorage (not router state) so it survives switching between
// the login and signup pages and the full-page Google login round trip.
const KEY = "auth_return_to";

function isSafePath(path: string | null | undefined): path is string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return false;
  // Never send someone back to an auth page.
  return !/^\/(login|signup|auth)(\/|\?|$)/.test(path);
}

export function rememberReturnTo(path: string) {
  try {
    if (isSafePath(path)) sessionStorage.setItem(KEY, path);
  } catch {
    // Storage blocked: login still works, it just lands on the home page.
  }
}

/** Returns the saved page (and forgets it), or null if there is none. */
export function takeReturnTo(): string | null {
  try {
    const path = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return isSafePath(path) ? path : null;
  } catch {
    return null;
  }
}
