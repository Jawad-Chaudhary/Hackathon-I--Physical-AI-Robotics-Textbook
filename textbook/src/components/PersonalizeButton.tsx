import React, { useState } from 'react';
import { useSkills } from '../hooks/useSkills';

interface PersonalizeButtonProps {
  chapterSlug: string;
  originalContent: string;
  onContentChange: (content: string) => void;
}

export function PersonalizeButton({
  chapterSlug,
  originalContent,
  onContentChange,
}: PersonalizeButtonProps) {
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [personalizedContent, setPersonalizedContent] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const { isLoading, personalizeChapter } = useSkills();

  const handleClick = async () => {
    setLocalError(null);

    if (isPersonalized) {
      // Show original
      onContentChange(originalContent);
      setIsPersonalized(false);
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

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="personalize-button"
      title={localError || undefined}
      style={{
        backgroundColor: localError ? '#dc3545' : isPersonalized ? '#6c757d' : '#0d6efd',
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
      {isLoading ? 'Personalizing...' : isPersonalized ? 'Show Original' : 'Personalize'}
    </button>
  );
}

export default PersonalizeButton;
