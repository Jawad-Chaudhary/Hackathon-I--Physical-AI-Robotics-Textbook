import { useState, useCallback } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'; // 👈 Added Import

// ✅ Fix 2: Match the key used in useAuth
const TOKEN_KEY = 'better_auth_token'; 

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: Date;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

interface ChatResponse {
  answer: string;
  sources: string[];
}

export function useChat() {
  // ✅ Fix 1: Get URL from Docusaurus Config instead of process.env
  const { siteConfig } = useDocusaurusContext();
  const API_BASE_URL = siteConfig.customFields?.apiUrl as string;

  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  };

  const generateId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const sendMessage = useCallback(async (content: string): Promise<void> => {
    const token = getToken();
    
    if (!token) {
      setState(prev => ({ ...prev, error: 'Not authenticated. Please log in.' }));
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: content }),
        credentials: 'include', 
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Chat request failed');
      }

      const data: ChatResponse = await response.json();

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
        error: null,
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chat request failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [API_BASE_URL]); // Added dependency

  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    sendMessage,
    clearMessages,
  };
}

export default useChat;