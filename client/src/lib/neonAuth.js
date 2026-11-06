import { createClient } from "@neondatabase/neon-js";
import { BetterAuthReactAdapter } from "@neondatabase/neon-js/auth/react/adapters";

const url = import.meta.env.VITE_NEON_AUTH_URL;
const dataUrl = import.meta.env.VITE_NEON_DATA_API_URL || url;
export const neonEnabled = Boolean(url);

let client = null;
if (neonEnabled) {
  client = createClient({
    auth: { adapter: BetterAuthReactAdapter(), url },
    dataApi: { url: dataUrl },
  });
}

export const authClient = client?.auth;

let cachedToken = null;
export const getNeonToken = () => cachedToken;
export const clearNeonToken = () => { cachedToken = null; };
export const asTokenString = (v) => {
  if (typeof v === 'string') return v;
  if (v?.token) return v.token;
  if (v?.data?.token) return v.data.token;
  if (v?.data?.session?.token) return v.data.session.token;
  if (v?.session?.token) return v.session.token;
  return null;
};

export async function refreshNeonToken() {
  if (!authClient) return null;
  try {
    const tokenRes = await authClient.token();
    const token = asTokenString(tokenRes);
    if (token) {
      cachedToken = token;
      return token;
    }
    const session = await authClient.getSession();
    const sessionToken = asTokenString(session);
    if (sessionToken) {
      cachedToken = sessionToken;
      return sessionToken;
    }
  } catch (e) {
    console.error("Neon token refresh failed", e);
  }
  return null;
}

export const neonSignIn = (email, password) => authClient?.signIn.email({ email, password });
export const neonSignUp = (name, email, password) => authClient?.signUp.email({ name, email, password });
export const neonSignOut = () => authClient?.signOut();
export const neonSession = () => authClient?.getSession();