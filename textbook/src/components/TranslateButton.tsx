import React, { useState } from 'react';
import { useSkills } from '../hooks/useSkills';

interface TranslateButtonProps {
  chapterSlug: string;
  originalContent: string;
  onContentChange: (content: string) => void;
}

export function TranslateButton({
  chapterSlug,
  originalContent,
  onContentChange,
}: TranslateButtonProps) {
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const { isLoading, translateChapter } = useSkills();

  const handleClick = async () => {
    setLocalError(null);

    if (isTranslated) {
      // Show English
      onContentChange(originalContent);
      setIsTranslated(false);
    } else {
      // Translate to Urdu
      if (translatedContent) {
        // Use cached translated content
        onContentChange(translatedContent);
        setIsTranslated(true);
      } else {
        // Fetch translated content
        try {
          const result = await translateChapter(chapterSlug, originalContent, 'urdu');
          if (result) {
            setTranslatedContent(result);
            onContentChange(result);
            setIsTranslated(true);
          } else {
            setLocalError('Translation returned no content. Try logging out and back in.');
            alert('Translation failed. Try logging out and back in.');
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          setLocalError(msg);
          alert(`Translation failed: ${msg}`);
        }
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="translate-button"
      title={localError || undefined}
      style={{
        backgroundColor: localError ? '#dc3545' : isTranslated ? '#6c757d' : '#198754',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 16px',
        cursor: isLoading ? 'wait' : 'pointer',
        opacity: isLoading ? 0.7 : 1,
        fontWeight: 500,
        transition: 'all 0.2s ease',
      }}
    >
      {isLoading ? 'Translating...' : isTranslated ? 'Show English' : 'Read in Urdu'}
    </button>
  );
}

export default TranslateButton;
