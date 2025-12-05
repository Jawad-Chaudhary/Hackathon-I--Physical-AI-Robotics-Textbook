import React, { useState } from 'react';
import { useSkills } from '../hooks/useSkills';

interface PersonalizeButtonProps {
  chapterSlug: string;
  originalContent: string;
  onContentChange: (content: string | null) => void;
  isShowingTransformed?: boolean;
}

export function PersonalizeButton({
  chapterSlug,
  originalContent,
  onContentChange,
  isShowingTransformed = false,
}: PersonalizeButtonProps) {
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const { isLoading, personalizeChapter } = useSkills();

  const handleClick = async () => {
    setLocalError(null);

    // If any transformed content is showing, close it first
    if (isShowingTransformed) {
      onContentChange(null);
      setIsPersonalized(false);
      return;
    }

    if (isPersonalized && personalizedContent) {
      // Toggle: show personalized content again
      onContentChange(personalizedContent);
    } else {
      // Personalize
      if (personalizedContent) {
        // Use cached personalized content
        onContentChange(personalizedContent);
        setIsPersonalized(true);
      } else {
        // Fetch personalized content
        try {
          const result = await personalizeChapter(chapterSlug, originalContent);
          if (result) {
            setPersonalizedContent(result);
            onContentChange(result);
            setIsPersonalized(true);
          } else {
            setLocalError('Personalization returned no content. Try logging out and back in.');
            alert('Personalization failed. Try logging out and back in.');
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          setLocalError(msg);
          alert(`Personalization failed: ${msg}`);
        }
      }
    }
  };

  const buttonText = isLoading
    ? 'Personalizing...'
    : isShowingTransformed
    ? 'Show Original'
    : personalizedContent
    ? 'Personalize ✓'
    : 'Personalize';

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="personalize-button"
      title={localError || (personalizedContent ? 'Click to show personalized version' : undefined)}
      style={{
        backgroundColor: localError ? '#dc3545' : isShowingTransformed ? '#6c757d' : '#0d6efd',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 16px',
        marginRight: '10px',
        cursor: isLoading ? 'wait' : 'pointer',
        opacity: isLoading ? 0.7 : 1,
        fontWeight: 500,
        transition: 'all 0.2s ease',
      }}
    >
      {buttonText}
    </button>
  );
}

export default PersonalizeButton;
