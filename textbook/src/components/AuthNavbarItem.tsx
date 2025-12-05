import React from 'react';
import Link from '@docusaurus/Link'; // 👈 Optimized navigation
import { useAuth } from '../hooks/useAuth';

export default function AuthNavbarItem(): JSX.Element {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {/* Login Link */}
        <Link
          to="/login"
          className="navbar__item navbar__link"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          Login
        </Link>
        
        {/* Signup Button (styled as Docusaurus button) */}
        <Link
          to="/signup"
          className="button button--primary button--sm"
          style={{ 
            textDecoration: 'none', 
            color: 'var(--ifm-button-color)',
            fontWeight: 600 
          }}
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <span style={{ 
          color: 'var(--ifm-navbar-link-color)', 
          fontSize: '14px',
          maxWidth: '150px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
      }}>
        {user?.email}
      </span>
      
      <button
        onClick={logout}
        className="button button--danger button--sm"
        style={{ border: 'none' }}
      >
        Sign Out
      </button>
    </div>
  );
}