import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthProvider';
import { PublicOnlyRoute, ProtectedRoute } from './routes/ProtectedRoute';
import NeonAuthGate, { NeonAuthPage } from './components/NeonAuthGate';
import { neonEnabled } from './lib/neonAuth';
import Landing from './pages/Landing';

// Stub Components
const Dashboard = () => <div className="p-10 font-display text-3xl">Dashboard</div>;
const WhiteboardPage = () => <div className="p-10 font-display text-3xl">Whiteboard</div>;
const NotFound = () => <div className="p-10 font-display text-3xl">404 Not Found</div>;
const Login = () => <div className="p-10 font-display text-3xl">Login</div>;
const Register = () => <div className="p-10 font-display text-3xl">Register</div>;

export default function App() {
  return (
    <BrowserRouter>
      <NeonAuthGate>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            {neonEnabled ? (
              <>
                <Route path="/login" element={<Navigate to="/auth/sign-in" replace />} />
                <Route path="/register" element={<Navigate to="/auth/sign-up" replace />} />
                <Route path="/auth/:pathname" element={<PublicOnlyRoute><NeonAuthPage /></PublicOnlyRoute>} />
              </>
            ) : (
              <>
                <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
              </>
            )}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/board/:boardId" element={<ProtectedRoute><WhiteboardPage /></ProtectedRoute>} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#fff',
                color: '#16161d',
                border: '1px solid var(--color-line)',
                borderRadius: '999px',
                padding: '.6rem 1rem',
                boxShadow: 'var(--shadow-soft)',
                fontSize: '.875rem',
                fontWeight: '500',
              },
            }}
          />
        </AuthProvider>
      </NeonAuthGate>
    </BrowserRouter>
  );
}