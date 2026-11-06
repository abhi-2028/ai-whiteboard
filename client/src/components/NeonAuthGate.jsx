import React from 'react';
import { AuthView, NeonAuthUIProvider } from '@neondatabase/auth-ui';
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { authClient, neonEnabled } from '../lib/neonAuth';
import { useAuth } from '../context/AuthProvider';

function Inner({ children }) {
  const navigate = useNavigate();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      defaultTheme="light"
      redirectTo="/dashboard"
      basePath="/auth"
      navigate={(href) => navigate(href)}
      replace={(href) => navigate(href, { replace: true })}
      Link={({ href, ...props }) => <Link to={href} {...props} />}
    >
      {children}
    </NeonAuthUIProvider>
  );
}

export default function NeonAuthGate({ children }) {
  return neonEnabled ? <Inner>{children}</Inner> : children;
}

export function NeonAuthPage() {
  const { pathname } = useParams();
  const { user, loading } = useAuth();

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <AuthLayout wide>
      <AuthView path={pathname} />
    </AuthLayout>
  );
}
