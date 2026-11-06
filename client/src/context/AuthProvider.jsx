import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  authClient,
  clearNeonToken,
  neonEnabled,
  neonSession,
  neonSignIn,
  neonSignOut,
  neonSignUp,
  refreshNeonToken,
} from '../lib/neonAuth';
import { authApi, clearToken } from '../lib/api';
import { connectSocket, disconnectSocket } from '../lib/socket';

const AuthContext = createContext(null);

function mapNeonUser(user) {
  return { id: user.id, name: user.name || user.email, email: user.email, avatar_url: user.image || null };
}

function NeonAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const sessionState = authClient.useSession();

  useEffect(() => {
    if (sessionState.data?.user) {
      setUser(mapNeonUser(sessionState.data.user));
      refreshNeonToken().then(connectSocket);
    }
  }, [sessionState.data?.user]);

  useEffect(() => {
    let active = true;
    async function restore() {
      try {
        const session = await authClient.getSession();
        if (active && session?.user) {
          setUser(mapNeonUser(session.user));
          await refreshNeonToken();
          await connectSocket();
        }
      } catch (error) {
        console.error('Auth init error', error);
      } finally {
        if (active) setLoading(false);
      }
    }
    restore();
    const interval = setInterval(() => refreshNeonToken(), 10 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const login = async (email, password) => {
    await neonSignIn(email, password);
    const session = await neonSession();
    if (session?.user) setUser(mapNeonUser(session.user));
    await refreshNeonToken();
    await connectSocket();
  };
  const register = async (name, email, password) => {
    await neonSignUp(name, email, password);
    const session = await neonSession();
    if (session?.user) setUser(mapNeonUser(session.user));
    await refreshNeonToken();
    await connectSocket();
  };
  const logout = async () => {
    await neonSignOut();
    clearNeonToken();
    setUser(null);
    disconnectSocket();
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

function LocalAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    setUser(data.user);
    await connectSocket();
  };
  const register = async (name, email, password) => {
    const data = await authApi.register({ name, email, password });
    setUser(data.user);
    await connectSocket();
  };
  const logout = () => {
    clearToken();
    setUser(null);
    disconnectSocket();
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }) {
  return neonEnabled ? <NeonAuthProvider>{children}</NeonAuthProvider> : <LocalAuthProvider>{children}</LocalAuthProvider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
