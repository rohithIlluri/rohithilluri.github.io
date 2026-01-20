import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ZONES, getZoneByTheta } from '../constants/zones';
import { BUILDINGS, getBuildingsByZone } from '../constants/buildings';

const WorldContext = createContext(null);

export function WorldProvider({ children }) {
  // Current zone state
  const [currentZone, setCurrentZone] = useState(ZONES[0]);
  const [previousZone, setPreviousZone] = useState(null);
  const [visitedZones, setVisitedZones] = useState(new Set(['welcome']));
  const [zoneTransitioning, setZoneTransitioning] = useState(false);

  // Buildings state
  const [nearbyBuilding, setNearbyBuilding] = useState(null);
  const [visitedBuildings, setVisitedBuildings] = useState(new Set());

  // World exploration stats
  const [explorationProgress, setExplorationProgress] = useState({
    zonesVisited: 1,
    totalZones: ZONES.length,
    buildingsVisited: 0,
    totalBuildings: BUILDINGS.length,
  });

  // Load visited state from localStorage
  useEffect(() => {
    const savedVisitedZones = localStorage.getItem('visitedZones');
    const savedVisitedBuildings = localStorage.getItem('visitedBuildings');

    if (savedVisitedZones) {
      try {
        const parsed = JSON.parse(savedVisitedZones);
        setVisitedZones(new Set(parsed));
      } catch (e) {
        console.warn('Failed to parse visited zones from localStorage');
      }
    }

    if (savedVisitedBuildings) {
      try {
        const parsed = JSON.parse(savedVisitedBuildings);
        setVisitedBuildings(new Set(parsed));
      } catch (e) {
        console.warn('Failed to parse visited buildings from localStorage');
      }
    }
  }, []);

  // Update exploration progress when visited state changes
  useEffect(() => {
    setExplorationProgress({
      zonesVisited: visitedZones.size,
      totalZones: ZONES.length,
      buildingsVisited: visitedBuildings.size,
      totalBuildings: BUILDINGS.length,
    });
  }, [visitedZones, visitedBuildings]);

  // Save visited state to localStorage
  const saveVisitedState = useCallback(() => {
    localStorage.setItem('visitedZones', JSON.stringify([...visitedZones]));
    localStorage.setItem('visitedBuildings', JSON.stringify([...visitedBuildings]));
  }, [visitedZones, visitedBuildings]);

  // Update current zone based on theta position
  const updateZoneFromTheta = useCallback((theta) => {
    const newZone = getZoneByTheta(theta);
    if (newZone && newZone.id !== currentZone?.id) {
      setPreviousZone(currentZone);
      setCurrentZone(newZone);
      setZoneTransitioning(true);

      // Mark zone as visited
      if (!visitedZones.has(newZone.id)) {
        setVisitedZones((prev) => {
          const updated = new Set(prev);
          updated.add(newZone.id);
          return updated;
        });
      }

      // Clear transition state after animation
      setTimeout(() => setZoneTransitioning(false), 500);
    }
  }, [currentZone, visitedZones]);

  // Mark building as visited
  const visitBuilding = useCallback((buildingId) => {
    if (!visitedBuildings.has(buildingId)) {
      setVisitedBuildings((prev) => {
        const updated = new Set(prev);
        updated.add(buildingId);
        return updated;
      });
    }
  }, [visitedBuildings]);

  // Check if zone has been visited
  const hasVisitedZone = useCallback((zoneId) => {
    return visitedZones.has(zoneId);
  }, [visitedZones]);

  // Check if building has been visited
  const hasVisitedBuilding = useCallback((buildingId) => {
    return visitedBuildings.has(buildingId);
  }, [visitedBuildings]);

  // Get buildings in current zone
  const getBuildingsInCurrentZone = useCallback(() => {
    if (!currentZone) return [];
    return getBuildingsByZone(currentZone.id);
  }, [currentZone]);

  // Get all zones with visited status
  const getZonesWithStatus = useCallback(() => {
    return ZONES.map((zone) => ({
      ...zone,
      visited: visitedZones.has(zone.id),
      isCurrent: currentZone?.id === zone.id,
    }));
  }, [visitedZones, currentZone]);

  // Reset exploration progress (for testing)
  const resetExploration = useCallback(() => {
    setVisitedZones(new Set(['welcome']));
    setVisitedBuildings(new Set());
    localStorage.removeItem('visitedZones');
    localStorage.removeItem('visitedBuildings');
  }, []);

  // Save state on unmount or when state changes
  useEffect(() => {
    const handleBeforeUnload = () => saveVisitedState();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveVisitedState();
    };
  }, [saveVisitedState]);

  const value = {
    // Zone state
    currentZone,
    previousZone,
    visitedZones,
    zoneTransitioning,
    updateZoneFromTheta,
    hasVisitedZone,
    getZonesWithStatus,

    // Building state
    nearbyBuilding,
    setNearbyBuilding,
    visitedBuildings,
    visitBuilding,
    hasVisitedBuilding,
    getBuildingsInCurrentZone,

    // Exploration stats
    explorationProgress,

    // Utils
    resetExploration,
    saveVisitedState,
  };

  return (
    <WorldContext.Provider value={value}>
      {children}
    </WorldContext.Provider>
  );
}

export function useWorld() {
  const context = useContext(WorldContext);
  if (!context) {
    throw new Error('useWorld must be used within a WorldProvider');
  }
  return context;
}

export default WorldContext;
