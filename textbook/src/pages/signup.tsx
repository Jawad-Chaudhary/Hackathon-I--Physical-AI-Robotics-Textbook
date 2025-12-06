import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { useHistory } from '@docusaurus/router'; // 👈 Use Router
import { useAuth } from '../hooks/useAuth';

export default function SignupPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pythonKnowledge, setPythonKnowledge] = useState(false);
  const [hasNvidiaGpu, setHasNvidiaGpu] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const { signup, isLoading, error, isAuthenticated } = useAuth();
  const history = useHistory();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      history.push('/docs/intro');
    }
  }, [isAuthenticated, history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signup({
      email,
      password,
      python_knowledge: pythonKnowledge,
      has_nvidia_gpu: hasNvidiaGpu,
      experience_level: experienceLevel,
    });
    if (success) {
      history.push('/docs/intro');
    }
  };

  if (isAuthenticated) return null;

  return (
    <Layout title="Sign Up" description="Create an account to access AI features">
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
            maxWidth: '450px',
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
            Create Account
          </h1>
          <p
            style={{
              textAlign: 'center',
              marginBottom: '32px',
              color: 'var(--ifm-font-color-secondary)',
            }}
          >
            Sign up for personalized AI learning
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

            <div style={{ marginBottom: '20px' }}>
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
                minLength={8}
                placeholder="At least 8 characters"
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

            <div style={{ marginBottom: '20px' }}>
              <label
                htmlFor="experience"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 500,
                  color: 'var(--ifm-font-color-base)',
                }}
              >
                Experience Level
              </label>
              <select
                id="experience"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
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
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div
              style={{
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: 'var(--ifm-color-emphasis-100)',
                borderRadius: '8px',
              }}
            >
              <p
                style={{
                  margin: '0 0 12px 0',
                  fontWeight: 500,
                  color: 'var(--ifm-font-color-base)',
                }}
              >
                Help us personalize your experience:
              </p>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={pythonKnowledge}
                  onChange={(e) => setPythonKnowledge(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    marginRight: '10px',
                    cursor: 'pointer',
                  }}
                />
                <span style={{ color: 'var(--ifm-font-color-base)' }}>I know Python</span>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={hasNvidiaGpu}
                  onChange={(e) => setHasNvidiaGpu(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    marginRight: '10px',
                    cursor: 'pointer',
                  }}
                />
                <span style={{ color: 'var(--ifm-font-color-base)' }}>I have an NVIDIA GPU</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#198754',
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
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p
            style={{
              textAlign: 'center',
              marginTop: '24px',
              color: 'var(--ifm-font-color-secondary)',
            }}
          >
            Already have an account?{' '}
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                history.push('/login');
              }}
              style={{
                color: '#0d6efd',
                textDecoration: 'none',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}