import React, { type ReactNode, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
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

interface ContentOverlayProps {
  content: string | null;
  onClose: () => void;
}

// Overlay component that renders transformed content without mutating the DOM
function ContentOverlay({ content, onClose }: ContentOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!content || !mounted) return null;

  // Detect current theme from document
  const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
  
  // Detect if content is Urdu (contains Arabic script characters)
  const isUrdu = /[\u0600-\u06FF]/.test(content);

  console.log('[ContentOverlay] Rendering overlay, content length:', content.length, 'isUrdu:', isUrdu);

  // Use portal to render overlay at document.body level
  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: isDarkMode ? '#1b1b1d' : '#ffffff',
        color: isDarkMode ? '#e3e3e3' : '#1c1e21',
        overflow: 'auto',
      }}
    >
      {/* Close button bar */}
      <div
        style={{
          backgroundColor: isDarkMode ? '#2d2d2d' : '#f5f5f5',
          padding: '10px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 10001,
          display: 'flex',
          justifyContent: 'flex-end',
          borderBottom: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
        }}
      >
        <button
          onClick={onClose}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          ✕ Close & Show Original
        </button>
      </div>
      
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '30px 20px',
          direction: isUrdu ? 'rtl' : 'ltr',
        }}
      >
        <div
          className="theme-doc-markdown markdown"
          style={{
            color: isDarkMode ? '#e3e3e3' : '#1c1e21',
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>,
    document.body
  );
}

function DocItemToolbar() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [originalContent, setOriginalContent] = useState<string>('');
  const [transformedContent, setTransformedContent] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Extract chapter slug from URL
  const chapterSlug = location.pathname.split('/').filter(Boolean).pop() || 'intro';

  // Get the document content after DOM is ready (read-only)
  useEffect(() => {
    // Reset state on page change
    setTransformedContent(null);
    setIsReady(false);
    setOriginalContent('');

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

    // Small delay to ensure DOM is rendered
    const timer = setTimeout(() => attemptFind(0), 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Handle content changes - now using React state instead of DOM mutation
  const handleContentChange = (newContent: string | null) => {
    setTransformedContent(newContent);
  };

  // Close overlay and show original
  const handleCloseOverlay = () => {
    setTransformedContent(null);
  };

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div
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
    return (
      <div style={{ padding: '12px', color: '#888' }}>
        Loading AI features...
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          padding: '12px 16px',
          marginBottom: '16px',
          backgroundColor: '#d4edda',
          borderRadius: '8px',
          border: '1px solid #28a745',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          // Ensure it's separate from content
          marginTop: '1rem',
        }}
      >
        <span style={{ marginRight: '10px', color: '#155724', fontWeight: 500 }}>
          AI Features:
        </span>
        <PersonalizeButton
          chapterSlug={chapterSlug}
          originalContent={originalContent}
          onContentChange={handleContentChange}
          isShowingTransformed={transformedContent !== null}
        />
        <TranslateButton
          chapterSlug={chapterSlug}
          originalContent={originalContent}
          onContentChange={handleContentChange}
          isShowingTransformed={transformedContent !== null}
        />
      </div>
      <ContentOverlay content={transformedContent} onClose={handleCloseOverlay} />
    </>
  );
}

export default function LayoutWrapper(props: Props): ReactNode {
  return (
    <Layout {...props}>
      <BrowserOnly fallback={null}>
        {() => <DocItemToolbar />}
      </BrowserOnly>
      {props.children}
      <BrowserOnly fallback={null}>
        {() => <ChatWidget />}
      </BrowserOnly>
    </Layout>
  );
}
