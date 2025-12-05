import React, { type ReactNode, useState, useEffect, useRef } from 'react';
import Layout from '@theme-original/DocItem/Layout';
import type LayoutType from '@theme/DocItem/Layout';
import type { WrapperProps } from '@docusaurus/types';
import { useLocation } from '@docusaurus/router';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Import our custom components
import PersonalizeButton from '@site/src/components/PersonalizeButton';
import TranslateButton from '@site/src/components/TranslateButton';
import ChatWidget from '@site/src/components/ChatWidget';
import { useAuth } from '@site/src/hooks/useAuth';

type Props = WrapperProps<typeof LayoutType>;

function DocItemToolbar() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [originalContent, setOriginalContent] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract chapter slug from URL
  const chapterSlug = location.pathname.split('/').filter(Boolean).pop() || 'intro';

  // Get the document content after DOM is ready
  useEffect(() => {
    const findContent = () => {
      const selectors = [
        '.theme-doc-markdown',
        '[class*="docItemContent"]',
        '.markdown',
        'article',
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.innerHTML.length > 100) {
          console.log('[DocItemToolbar] Found content with selector:', selector, 'length:', element.innerHTML.length);
          return element.innerHTML;
        }
      }
      return null;
    };

    // Retry with delays
    const attemptFind = (attempts: number) => {
      const content = findContent();
      if (content) {
        setOriginalContent(content);
        setIsReady(true);
      } else if (attempts < 10) {
        setTimeout(() => attemptFind(attempts + 1), 200);
      }
    };

    attemptFind(0);
  }, [location.pathname]);

  // Insert toolbar at the top of the article
  useEffect(() => {
    if (containerRef.current && isReady) {
      const articleContent = document.querySelector('.theme-doc-markdown');
      if (articleContent && articleContent.parentElement) {
        articleContent.parentElement.insertBefore(containerRef.current, articleContent);
      }
    }
  }, [isReady]);

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    const element = document.querySelector('.theme-doc-markdown');
    if (element) {
      element.innerHTML = newContent;
    }
  };

  console.log('[DocItemToolbar] Render state:', { isLoading, isAuthenticated, isReady, contentLength: originalContent.length });

  if (isLoading) {
    return <div ref={containerRef} style={{ padding: '12px', color: '#888' }}>Checking auth...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div
        ref={containerRef}
        style={{
          padding: '12px 16px',
          marginBottom: '16px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          border: '1px solid #ffc107',
        }}
      >
        <span style={{ color: '#856404' }}>
          <a href="/login" style={{ color: '#0d6efd', textDecoration: 'none', fontWeight: 'bold' }}>
            Log in
          </a>{' '}
          to access AI-powered personalization and translation features.
        </span>
      </div>
    );
  }

  if (!isReady) {
    return <div ref={containerRef} style={{ padding: '12px', color: '#888' }}>Loading AI features...</div>;
  }

  return (
    <div
      ref={containerRef}
      style={{
        padding: '12px 16px',
        marginBottom: '16px',
        backgroundColor: '#d4edda',
        borderRadius: '8px',
        border: '1px solid #28a745',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <span style={{ marginRight: '10px', color: '#155724', fontWeight: 500 }}>
        AI Features:
      </span>
      <PersonalizeButton
        chapterSlug={chapterSlug}
        originalContent={originalContent}
        onContentChange={handleContentChange}
      />
      <TranslateButton
        chapterSlug={chapterSlug}
        originalContent={originalContent}
        onContentChange={handleContentChange}
      />
    </div>
  );
}

export default function LayoutWrapper(props: Props): ReactNode {
  return (
    <>
      <Layout {...props} />
      <BrowserOnly>
        {() => <DocItemToolbar />}
      </BrowserOnly>
      <BrowserOnly>
        {() => <ChatWidget />}
      </BrowserOnly>
    </>
  );
}
