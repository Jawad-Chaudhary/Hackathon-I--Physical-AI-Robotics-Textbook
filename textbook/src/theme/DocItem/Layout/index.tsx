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

  // Use portal to render overlay at document.body level for proper z-index stacking
  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: '#ffffff',
        color: '#1c1e21',
        overflow: 'auto',
      }}
      data-theme="light"
    >
      {/* Dark mode support */}
      <style>{`
        [data-theme='dark'] .content-overlay-wrapper {
          background-color: #1b1b1d !important;
          color: #e3e3e3 !important;
        }
      `}</style>
      <div
        className="content-overlay-wrapper"
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--ifm-background-color, #ffffff)',
          color: 'var(--ifm-font-color-base, #1c1e21)',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'sticky',
              top: '10px',
              float: 'right',
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              zIndex: 10000,
            }}
          >
            ✕ Close & Show Original
          </button>
          <div
            className="theme-doc-markdown markdown"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
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

  console.log('[DocItemToolbar] Render state:', { isLoading, isAuthenticated, isReady, contentLength: originalContent.length });

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

// Creates a portal container at the top of doc content and renders toolbar into it
function ToolbarPortal() {
  const location = useLocation();
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Reset on page change
    setPortalContainer(null);

    const setupPortal = () => {
      // Check if portal container already exists
      let container = document.getElementById('ai-toolbar-portal');
      if (container) {
        setPortalContainer(container);
        return;
      }

      // Find the markdown content area
      const selectors = [
        '.theme-doc-markdown',
        '[class*="docItemContent"]',
        '.markdown',
        'article',
      ];

      for (const selector of selectors) {
        const target = document.querySelector(selector);
        if (target) {
          // Create portal container
          container = document.createElement('div');
          container.id = 'ai-toolbar-portal';
          // Insert at the very beginning of the content
          target.insertBefore(container, target.firstChild);
          setPortalContainer(container);
          break;
        }
      }
    };

    // Try immediately and with delays
    setupPortal();
    const timer1 = setTimeout(setupPortal, 100);
    const timer2 = setTimeout(setupPortal, 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      // Clean up portal container on unmount
      const container = document.getElementById('ai-toolbar-portal');
      if (container) {
        container.remove();
      }
    };
  }, [location.pathname]);

  if (!portalContainer) return null;

  return ReactDOM.createPortal(
    <div style={{ marginBottom: '20px' }}>
      <DocItemToolbar />
    </div>,
    portalContainer
  );
}

export default function LayoutWrapper(props: Props): ReactNode {
  return (
    <>
      <Layout {...props} />
      <BrowserOnly fallback={null}>
        {() => <ToolbarPortal />}
      </BrowserOnly>
      <BrowserOnly fallback={null}>
        {() => <ChatWidget />}
      </BrowserOnly>
    </>
  );
}
