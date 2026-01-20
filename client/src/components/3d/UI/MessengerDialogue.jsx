import React, { useEffect, useCallback } from 'react';
import { useMessenger } from '../../../context/MessengerContext';
import { MESSENGER_COLORS, TIMING } from '../../../constants/planetTheme';

// Dialogue content renderers
import TextMessage from './DialogueContent/TextMessage';
import SkillsMessage from './DialogueContent/SkillsMessage';
import ProjectsMessage from './DialogueContent/ProjectsMessage';
import MusicMessage from './DialogueContent/MusicMessage';
import MoviesMessage from './DialogueContent/MoviesMessage';
import ContactMessage from './DialogueContent/ContactMessage';

export default function MessengerDialogue() {
  const {
    isDialogueActive,
    currentDialogue,
    isTyping,
    setIsTyping,
    displayedText,
    setDisplayedText,
    nextMessage,
    closeDialogue,
    getCurrentMessage,
    isLastMessage,
  } = useMessenger();

  const currentMsg = getCurrentMessage();

  // Typewriter effect for text messages
  useEffect(() => {
    if (!isDialogueActive || !currentMsg || currentMsg.type !== 'text' || !currentMsg.text) {
      return;
    }

    if (!isTyping) return;

    const fullText = currentMsg.text;
    let currentIndex = 0;
    setDisplayedText('');

    const typeInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, TIMING.typewriterSpeed);

    return () => clearInterval(typeInterval);
  }, [currentMsg, isDialogueActive, isTyping, setDisplayedText, setIsTyping]);

  // For non-text messages, mark typing as complete immediately
  useEffect(() => {
    if (currentMsg && currentMsg.type !== 'text' && isTyping) {
      setIsTyping(false);
    }
  }, [currentMsg, isTyping, setIsTyping]);

  // Keyboard controls
  useEffect(() => {
    if (!isDialogueActive) return;

    const handleKeyDown = (e) => {
      if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        nextMessage();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeDialogue();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDialogueActive, nextMessage, closeDialogue]);

  // Render content based on message type
  const renderContent = useCallback(() => {
    if (!currentMsg) return null;

    switch (currentMsg.type) {
      case 'text':
        return <TextMessage text={displayedText} isTyping={isTyping} />;
      case 'skills':
        return <SkillsMessage data={currentMsg.data} />;
      case 'projects':
        return <ProjectsMessage data={currentMsg.data} />;
      case 'music':
        return <MusicMessage data={currentMsg.data} />;
      case 'movies':
        return <MoviesMessage data={currentMsg.data} />;
      case 'contact':
        return <ContactMessage data={currentMsg.data} />;
      default:
        return <TextMessage text={currentMsg.text || ''} isTyping={false} />;
    }
  }, [currentMsg, displayedText, isTyping]);

  if (!isDialogueActive || !currentDialogue) return null;

  const progress = `${currentDialogue.currentIndex + 1}/${currentDialogue.totalMessages}`;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 500,
        width: '90%',
        maxWidth: '600px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      {/* Main dialogue box */}
      <div
        style={{
          background: MESSENGER_COLORS.dialogueBackground,
          borderRadius: '24px',
          padding: '20px 24px',
          boxShadow: `0 10px 40px ${MESSENGER_COLORS.dialogueShadow}`,
          border: `1px solid ${MESSENGER_COLORS.dialogueBorder}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Header with speaker name and progress */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Speaker tag */}
          <div
            style={{
              background: currentDialogue.npcColor,
              color: MESSENGER_COLORS.speakerTagText,
              padding: '6px 14px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            {currentDialogue.npcName}
          </div>

          {/* Progress indicator */}
          <div
            style={{
              color: 'rgba(0,0,0,0.4)',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            {progress}
          </div>
        </div>

        {/* Message content */}
        <div
          style={{
            minHeight: '60px',
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          {renderContent()}
        </div>

        {/* Footer with next button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Hint text */}
          <div
            style={{
              color: 'rgba(0,0,0,0.4)',
              fontSize: '11px',
            }}
          >
            Press E, Space, or click to continue
          </div>

          {/* Next/Close button */}
          <button
            onClick={nextMessage}
            style={{
              background: currentDialogue.npcColor,
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s ease, opacity 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.opacity = '1';
            }}
          >
            {isTyping ? (
              'Skip'
            ) : isLastMessage() ? (
              'Close'
            ) : (
              <>
                Next
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Close hint */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '12px',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '11px',
        }}
      >
        Press ESC to close
      </div>

      {/* Animation keyframes */}
      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}
