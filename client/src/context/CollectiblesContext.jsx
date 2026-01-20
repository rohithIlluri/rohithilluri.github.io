import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  COLLECTIBLES,
  RARITY_CONFIG,
  getCollectibleById,
  getCollectiblesByZone,
  getTotalCollectiblesCount,
  getTotalPossiblePoints,
} from '../constants/collectibles';
import { PLANET_CONFIG } from '../constants/planetTheme';

const CollectiblesContext = createContext(null);

export function CollectiblesProvider({ children }) {
  // Collected items state
  const [collectedItems, setCollectedItems] = useState(new Set());
  const [recentlyCollected, setRecentlyCollected] = useState(null);
  const [showCollectionNotification, setShowCollectionNotification] = useState(false);

  // Score state
  const [totalScore, setTotalScore] = useState(0);

  // Nearby collectible state
  const [nearbyCollectible, setNearbyCollectible] = useState(null);

  // Completion state
  const [isComplete, setIsComplete] = useState(false);
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);

  // Stats
  const [collectionStats, setCollectionStats] = useState({
    collected: 0,
    total: getTotalCollectiblesCount(),
    score: 0,
    maxScore: getTotalPossiblePoints(),
    percentComplete: 0,
  });

  // Load collected state from localStorage
  useEffect(() => {
    const savedCollected = localStorage.getItem('collectedItems');
    const savedScore = localStorage.getItem('collectionScore');

    if (savedCollected) {
      try {
        const parsed = JSON.parse(savedCollected);
        setCollectedItems(new Set(parsed));
      } catch (e) {
        console.warn('Failed to parse collected items from localStorage');
      }
    }

    if (savedScore) {
      try {
        setTotalScore(parseInt(savedScore, 10) || 0);
      } catch (e) {
        console.warn('Failed to parse collection score from localStorage');
      }
    }
  }, []);

  // Update stats when collected items change
  useEffect(() => {
    const collected = collectedItems.size;
    const total = getTotalCollectiblesCount();
    const maxScore = getTotalPossiblePoints();

    setCollectionStats({
      collected,
      total,
      score: totalScore,
      maxScore,
      percentComplete: Math.round((collected / total) * 100),
    });
  }, [collectedItems, totalScore]);

  // Completion detection
  useEffect(() => {
    if (collectionStats.percentComplete === 100 && collectedItems.size > 0) {
      const seen = localStorage.getItem('hasSeenCompletionCelebration');
      if (seen !== 'true') {
        setIsComplete(true);
        setShowCompletionCelebration(true);
      } else {
        setIsComplete(true);
      }
    }
  }, [collectionStats.percentComplete, collectedItems.size]);

  // Dismiss completion celebration
  const dismissCompletionCelebration = useCallback(() => {
    setShowCompletionCelebration(false);
    localStorage.setItem('hasSeenCompletionCelebration', 'true');
  }, []);

  // Save collected state to localStorage
  const saveCollectedState = useCallback(() => {
    localStorage.setItem('collectedItems', JSON.stringify([...collectedItems]));
    localStorage.setItem('collectionScore', totalScore.toString());
  }, [collectedItems, totalScore]);

  // Collect an item
  const collectItem = useCallback((collectibleId) => {
    if (collectedItems.has(collectibleId)) {
      return false; // Already collected
    }

    const collectible = getCollectibleById(collectibleId);
    if (!collectible) {
      console.warn(`Collectible not found: ${collectibleId}`);
      return false;
    }

    // Add to collected
    setCollectedItems((prev) => {
      const updated = new Set(prev);
      updated.add(collectibleId);
      return updated;
    });

    // Add score based on rarity
    const rarityConfig = RARITY_CONFIG[collectible.rarity] || RARITY_CONFIG.common;
    setTotalScore((prev) => prev + rarityConfig.points);

    // Show notification
    setRecentlyCollected(collectible);
    setShowCollectionNotification(true);

    // Hide notification after delay
    setTimeout(() => {
      setShowCollectionNotification(false);
      setRecentlyCollected(null);
    }, 3000);

    return true;
  }, [collectedItems]);

  // Check if item is collected
  const isCollected = useCallback((collectibleId) => {
    return collectedItems.has(collectibleId);
  }, [collectedItems]);

  // Get uncollected items
  const getUncollectedItems = useCallback(() => {
    return COLLECTIBLES.filter((c) => !collectedItems.has(c.id));
  }, [collectedItems]);

  // Get collected items
  const getCollectedItems = useCallback(() => {
    return COLLECTIBLES.filter((c) => collectedItems.has(c.id));
  }, [collectedItems]);

  // Get uncollected items in a zone
  const getUncollectedInZone = useCallback((zoneId) => {
    const zoneCollectibles = getCollectiblesByZone(zoneId);
    return zoneCollectibles.filter((c) => !collectedItems.has(c.id));
  }, [collectedItems]);

  // Check for nearby collectibles
  const checkNearbyCollectibles = useCallback((position, threshold = PLANET_CONFIG.interactionDistance) => {
    if (!position) return null;

    for (const collectible of COLLECTIBLES) {
      // Skip already collected
      if (collectedItems.has(collectible.id)) continue;

      // Calculate collectible position on sphere
      const phi = collectible.phi;
      const theta = collectible.theta;
      const radius = PLANET_CONFIG.radius + collectible.heightOffset;

      const collectiblePos = {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.sin(theta),
      };

      const distance = Math.sqrt(
        Math.pow(position.x - collectiblePos.x, 2) +
        Math.pow(position.y - collectiblePos.y, 2) +
        Math.pow(position.z - collectiblePos.z, 2)
      );

      if (distance < threshold) {
        setNearbyCollectible(collectible);
        return collectible;
      }
    }

    setNearbyCollectible(null);
    return null;
  }, [collectedItems]);

  // Reset collection (for testing)
  const resetCollection = useCallback(() => {
    setCollectedItems(new Set());
    setTotalScore(0);
    setRecentlyCollected(null);
    setShowCollectionNotification(false);
    localStorage.removeItem('collectedItems');
    localStorage.removeItem('collectionScore');
  }, []);

  // Save state on unmount or when state changes
  useEffect(() => {
    const handleBeforeUnload = () => saveCollectedState();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveCollectedState();
    };
  }, [saveCollectedState]);

  const value = {
    // Collected state
    collectedItems,
    recentlyCollected,
    showCollectionNotification,

    // Score
    totalScore,

    // Nearby
    nearbyCollectible,
    setNearbyCollectible,
    checkNearbyCollectibles,

    // Stats
    collectionStats,

    // Completion
    isComplete,
    showCompletionCelebration,
    dismissCompletionCelebration,

    // Actions
    collectItem,
    isCollected,
    getUncollectedItems,
    getCollectedItems,
    getUncollectedInZone,

    // Utils
    resetCollection,
    saveCollectedState,
  };

  return (
    <CollectiblesContext.Provider value={value}>
      {children}
    </CollectiblesContext.Provider>
  );
}

export function useCollectibles() {
  const context = useContext(CollectiblesContext);
  if (!context) {
    throw new Error('useCollectibles must be used within a CollectiblesProvider');
  }
  return context;
}

export default CollectiblesContext;
