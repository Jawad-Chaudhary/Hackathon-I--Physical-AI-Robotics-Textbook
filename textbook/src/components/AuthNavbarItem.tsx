import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function AuthNavbarItem(): JSX.Element {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <a
          href="/login"
          className="navbar__item navbar__link"
          style={{ color: 'inherit' }}
        >
          Login
        </a>
        <a
          href="/signup"
          className="navbar-signup-btn"
          style={{
            backgroundColor: '#198754',
            color: 'white',
            padding: '6px 16px',
            borderRadius: '6px',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Sign Up
        </a>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <span style={{ color: 'var(--ifm-navbar-link-color)', fontSize: '14px' }}>
        {user?.email}
      </span>
      <button
        onClick={logout}
        style={{
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          padding: '6px 16px',
          borderRadius: '6px',
          fontWeight: 500,
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
