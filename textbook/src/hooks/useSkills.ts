/**
 * Skills hook for AI features (Personalize, Translate)
 * Uses better-auth token for authentication
 */

import { useState, useCallback } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'; // 👈 Added Import

const TOKEN_KEY = 'better_auth_token';

interface SkillsState {
  isLoading: boolean;
  error: string | null;
}

interface PersonalizeResponse {
  personalized_content: string;
  chapter_slug: string;
}

interface TranslateResponse {
  translated_content: string;
  chapter_slug: string;
}

export function useSkills() {
  // ✅ Fix 1: Get URL from Docusaurus Config
  const { siteConfig } = useDocusaurusContext();
  const API_BASE_URL = siteConfig.customFields?.apiUrl as string;

  const [state, setState] = useState<SkillsState>({
    isLoading: false,
    error: null,
  });

  const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  };

  const personalizeChapter = useCallback(async (
    chapterSlug: string,
    content: string
  ): Promise<string | null> => {
    setState({ isLoading: true, error: null });

    const token = getToken();
    if (!token) {
      const err = 'Not authenticated. Please log in.';
      setState({ isLoading: false, error: err });
      alert(err);
      return null;
    }

    try {
      console.log(`[Personalize] Sending request to: ${API_BASE_URL}/api/personalize`); // DEBUG LOG
      const response = await fetch(`${API_BASE_URL}/api/personalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          chapter_slug: chapterSlug,
          content: content,
        }),
        credentials: 'include',
      });
      console.log(`[Personalize] Response status: ${response.status}`); // DEBUG LOG

      if (!response.ok) {
        let errorMsg = 'Personalization failed';
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorMsg;
        } catch {
          errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        }
        setState({ isLoading: false, error: errorMsg });
        alert(`Personalization failed: ${errorMsg}`);
        return null;
      }

      const data: PersonalizeResponse = await response.json();
      setState({ isLoading: false, error: null });

      // Strip debug logs if present
      const cleanContent = data.personalized_content.replace(/^\[PERSONALIZE_AGENT\].*$/gm, '').trim();

      return cleanContent;
    } catch (err) {
      console.error('[Personalize] Fetch error details:', err); // DEBUG LOG
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setState({ isLoading: false, error: errorMessage });
      alert(`Personalization failed: ${errorMessage}`);
      return null;
    }
  }, [API_BASE_URL]);

  const translateChapter = useCallback(async (
    chapterSlug: string,
    content: string,
    targetLanguage: string = 'urdu'
  ): Promise<string | null> => {
    setState({ isLoading: true, error: null });

    const token = getToken();
    if (!token) {
      const err = 'Not authenticated. Please log in.';
      setState({ isLoading: false, error: err });
      alert(err);
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          chapter_slug: chapterSlug,
          content: content,
          target_language: targetLanguage,
        }),
        credentials: 'include', // 👈 Added missing credentials
      });

      if (!response.ok) {
        let errorMsg = 'Translation failed';
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorMsg;
        } catch {
          errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        }
        setState({ isLoading: false, error: errorMsg });
        alert(`Translation failed: ${errorMsg}`);
        return null;
      }

      const data: TranslateResponse = await response.json();
      setState({ isLoading: false, error: null });
      return data.translated_content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setState({ isLoading: false, error: errorMessage });
      alert(`Translation failed: ${errorMessage}`);
      return null;
    }
  }, [API_BASE_URL]);

  return {
    ...state,
    personalizeChapter,
    translateChapter,
  };
}

export default useSkills;