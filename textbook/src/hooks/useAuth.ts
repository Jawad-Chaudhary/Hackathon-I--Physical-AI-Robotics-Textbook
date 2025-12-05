/**
 * Authentication hook using Better-Auth
 * Stores token for cross-origin API calls
 */

import { useState, useEffect, useCallback } from 'react';

const AUTH_URL = 'http://localhost:3001';
const TOKEN_KEY = 'better_auth_token';
const USER_KEY = 'better_auth_user';

interface User {
  id?: string;
  email: string;
  name?: string;
  python_knowledge: boolean;
  has_nvidia_gpu: boolean;
  experience_level: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData extends LoginCredentials {
  python_knowledge: boolean;
  has_nvidia_gpu: boolean;
  experience_level?: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setState({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${AUTH_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const token = data.token;
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        python_knowledge: data.user.pythonKnowledge || false,
        has_nvidia_gpu: data.user.hasNvidiaGpu || false,
        experience_level: data.user.experienceLevel || 'beginner',
      };

      // Store in localStorage for cross-origin API calls
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      setState({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  const signup = useCallback(async (data: SignupData): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${AUTH_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.email.split('@')[0],
          pythonKnowledge: data.python_knowledge,
          hasNvidiaGpu: data.has_nvidia_gpu,
          experienceLevel: data.experience_level || 'beginner',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      const responseData = await response.json();
      const token = responseData.token;
      const user = {
        id: responseData.user.id,
        email: responseData.user.email,
        name: responseData.user.name,
        python_knowledge: responseData.user.pythonKnowledge || false,
        has_nvidia_gpu: responseData.user.hasNvidiaGpu || false,
        experience_level: responseData.user.experienceLevel || 'beginner',
      };

      // Store in localStorage
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      setState({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${AUTH_URL}/api/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    login,
    signup,
    logout,
  };
}

export default useAuth;
