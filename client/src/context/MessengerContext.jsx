import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { NPC_DIALOGUES, getDialogueForNPC } from '../constants/dialogues';

const MessengerContext = createContext(null);

export function MessengerProvider({ children }) {
  // Dialogue state
  const [isDialogueActive, setIsDialogueActive] = useState(false);
  const [currentDialogue, setCurrentDialogue] = useState(null);
  const [dialogueHistory, setDialogueHistory] = useState(new Map());
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  // Load intro state from localStorage
  useEffect(() => {
    const seen = localStorage.getItem('hasSeenIntro');
    if (seen === 'true') {
      setHasSeenIntro(true);
    }
  }, []);

  // Start a dialogue with an NPC
  const startDialogue = useCallback((npcId) => {
    const npcData = getDialogueForNPC(npcId);
    if (!npcData) {
      console.warn(`No dialogue found for NPC: ${npcId}`);
      return;
    }

    // Get last index from history or start at 0
    const startIndex = dialogueHistory.get(npcId) || 0;

    setCurrentDialogue({
      npcId,
      npcName: npcData.name,
      npcColor: npcData.color,
      chapter: npcData.chapter,
      messages: npcData.dialogues,
      currentIndex: 0, // Always start from beginning when talking
      totalMessages: npcData.dialogues.length,
    });
    setIsDialogueActive(true);
    setDisplayedText('');
    setIsTyping(true);
  }, [dialogueHistory]);

  // Advance to next message
  const nextMessage = useCallback(() => {
    if (!currentDialogue) return;

    // If still typing, complete the text immediately
    if (isTyping) {
      setIsTyping(false);
      const currentMsg = currentDialogue.messages[currentDialogue.currentIndex];
      setDisplayedText(currentMsg.text);
      return;
    }

    const nextIndex = currentDialogue.currentIndex + 1;

    if (nextIndex >= currentDialogue.messages.length) {
      // End of dialogue
      closeDialogue();
    } else {
      // Go to next message
      setCurrentDialogue((prev) => ({
        ...prev,
        currentIndex: nextIndex,
      }));
      setDisplayedText('');
      setIsTyping(true);
    }
  }, [currentDialogue, isTyping]);

  // Close dialogue
  const closeDialogue = useCallback(() => {
    if (currentDialogue) {
      // Save progress
      setDialogueHistory((prev) => {
        const updated = new Map(prev);
        updated.set(currentDialogue.npcId, currentDialogue.currentIndex);
        return updated;
      });
    }
    setIsDialogueActive(false);
    setCurrentDialogue(null);
    setDisplayedText('');
    setIsTyping(false);
  }, [currentDialogue]);

  // Mark intro as seen
  const markIntroSeen = useCallback(() => {
    setHasSeenIntro(true);
    localStorage.setItem('hasSeenIntro', 'true');
  }, []);

  // Reset intro (for testing)
  const resetIntro = useCallback(() => {
    setHasSeenIntro(false);
    localStorage.removeItem('hasSeenIntro');
  }, []);

  // Get current message
  const getCurrentMessage = useCallback(() => {
    if (!currentDialogue) return null;
    return currentDialogue.messages[currentDialogue.currentIndex];
  }, [currentDialogue]);

  // Check if at last message
  const isLastMessage = useCallback(() => {
    if (!currentDialogue) return false;
    return currentDialogue.currentIndex >= currentDialogue.messages.length - 1;
  }, [currentDialogue]);

  const value = {
    // State
    isDialogueActive,
    currentDialogue,
    dialogueHistory,
    isTyping,
    setIsTyping,
    displayedText,
    setDisplayedText,
    hasSeenIntro,

    // Actions
    startDialogue,
    nextMessage,
    closeDialogue,
    markIntroSeen,
    resetIntro,

    // Helpers
    getCurrentMessage,
    isLastMessage,
  };

  return (
    <MessengerContext.Provider value={value}>
      {children}
    </MessengerContext.Provider>
  );
}

export function useMessenger() {
  const context = useContext(MessengerContext);
  if (!context) {
    throw new Error('useMessenger must be used within a MessengerProvider');
  }
  return context;
}

export default MessengerContext;
