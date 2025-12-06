import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { useHistory } from '@docusaurus/router'; // 👈 Use Docusaurus Router
import { useAuth } from '../hooks/useAuth';

export default function LoginPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const history = useHistory(); // 👈 Initialize history

  // Redirect if already authenticated
  // We use useEffect to handle side effects properly
  React.useEffect(() => {
    if (isAuthenticated) {
      history.push('/docs/');
    }
  }, [isAuthenticated, history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login({ email, password });
    if (success) {
      history.push('/docs'); // 👈 Instant SPA navigation
    }
  };

  if (isAuthenticated) return null; // Prevent flash of login content

  return (
    <Layout title="Login" description="Login to access AI features">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 200px)',
          padding: '40px 20px',
        }}
      >
        <div
          className="auth-card"
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '32px',
            backgroundColor: 'var(--ifm-background-surface-color)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h1
            style={{
              textAlign: 'center',
              marginBottom: '8px',
              fontSize: '28px',
              color: 'var(--ifm-font-color-base)',
            }}
          >
            Welcome Back
          </h1>
          <p
            style={{
              textAlign: 'center',
              marginBottom: '32px',
              color: 'var(--ifm-font-color-secondary)',
            }}
          >
            Log in to access AI-powered features
          </p>

          {error && (
            <div
              style={{
                padding: '12px 16px',
                marginBottom: '20px',
                backgroundColor: '#f8d7da',
                borderRadius: '8px',
                color: '#842029',
                border: '1px solid #f5c2c7',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 500,
                  color: 'var(--ifm-font-color-base)',
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--ifm-background-color)',
                  color: 'var(--ifm-font-color-base)',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 500,
                  color: 'var(--ifm-font-color-base)',
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--ifm-background-color)',
                  color: 'var(--ifm-font-color-base)',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#0d6efd',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: isLoading ? 'wait' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p
            style={{
              textAlign: 'center',
              marginTop: '24px',
              color: 'var(--ifm-font-color-secondary)',
            }}
          >
            Don't have an account?{' '}
            <a
              href="/signup"
              onClick={(e) => {
                e.preventDefault();
                history.push('/signup');
              }}
              style={{
                color: '#0d6efd',
                textDecoration: 'none',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}