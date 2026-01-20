import { useCallback, useRef } from 'react';
import { getZoneByTheta } from '../constants/zones';

/**
 * Hook for detecting which zone the player is currently in based on position
 * Converts cartesian position to theta angle and determines zone
 */
export function useZoneDetection() {
  const lastZoneRef = useRef(null);
  const lastThetaRef = useRef(0);

  /**
   * Convert cartesian position to theta angle on sphere
   * @param {Object} position - {x, y, z} position vector
   * @returns {number} theta angle in radians (0 to 2*PI)
   */
  const positionToTheta = useCallback((position) => {
    if (!position) return 0;

    // Project position to sphere surface (ignore height variations)
    const { x, z } = position;

    // Calculate theta from x, z coordinates
    // atan2 returns angle from -PI to PI, we need 0 to 2*PI
    let theta = Math.atan2(z, x);
    if (theta < 0) {
      theta += Math.PI * 2;
    }

    return theta;
  }, []);

  /**
   * Get current zone from position
   * @param {Object} position - {x, y, z} position vector
   * @returns {Object|null} zone object or null
   */
  const getZoneFromPosition = useCallback((position) => {
    if (!position) return null;

    const theta = positionToTheta(position);
    lastThetaRef.current = theta;

    const zone = getZoneByTheta(theta);
    if (zone) {
      lastZoneRef.current = zone;
    }

    return zone;
  }, [positionToTheta]);

  /**
   * Check if position is in a specific zone
   * @param {Object} position - {x, y, z} position vector
   * @param {string} zoneId - zone ID to check
   * @returns {boolean}
   */
  const isInZone = useCallback((position, zoneId) => {
    const zone = getZoneFromPosition(position);
    return zone && zone.id === zoneId;
  }, [getZoneFromPosition]);

  /**
   * Get distance to zone boundary
   * @param {Object} position - current position
   * @param {string} direction - 'next' or 'prev'
   * @returns {number} distance in theta radians
   */
  const getDistanceToBoundary = useCallback((position, direction = 'next') => {
    if (!position) return 0;

    const theta = positionToTheta(position);
    const zone = getZoneByTheta(theta);

    if (!zone) return 0;

    if (direction === 'next') {
      return zone.thetaEnd - theta;
    } else {
      return theta - zone.thetaStart;
    }
  }, [positionToTheta]);

  /**
   * Get progress through current zone (0 to 1)
   * @param {Object} position - current position
   * @returns {number} progress percentage (0 to 1)
   */
  const getZoneProgress = useCallback((position) => {
    if (!position) return 0;

    const theta = positionToTheta(position);
    const zone = getZoneByTheta(theta);

    if (!zone) return 0;

    const zoneWidth = zone.thetaEnd - zone.thetaStart;
    const progress = (theta - zone.thetaStart) / zoneWidth;

    return Math.max(0, Math.min(1, progress));
  }, [positionToTheta]);

  /**
   * Check if near zone boundary
   * @param {Object} position - current position
   * @param {number} threshold - distance threshold in radians (default ~5 degrees)
   * @returns {Object|null} { boundary: 'start'|'end', nextZone: zone }
   */
  const isNearZoneBoundary = useCallback((position, threshold = 0.1) => {
    if (!position) return null;

    const theta = positionToTheta(position);
    const zone = getZoneByTheta(theta);

    if (!zone) return null;

    const distanceToEnd = zone.thetaEnd - theta;
    const distanceToStart = theta - zone.thetaStart;

    if (distanceToEnd < threshold && distanceToEnd >= 0) {
      // Near end boundary, get next zone
      const nextTheta = zone.thetaEnd + 0.01;
      const nextZone = getZoneByTheta(nextTheta);
      return { boundary: 'end', nextZone };
    }

    if (distanceToStart < threshold && distanceToStart >= 0) {
      // Near start boundary, get previous zone
      let prevTheta = zone.thetaStart - 0.01;
      if (prevTheta < 0) prevTheta += Math.PI * 2;
      const prevZone = getZoneByTheta(prevTheta);
      return { boundary: 'start', nextZone: prevZone };
    }

    return null;
  }, [positionToTheta]);

  /**
   * Get last detected zone (useful for avoiding recalculation)
   * @returns {Object|null} last zone
   */
  const getLastZone = useCallback(() => {
    return lastZoneRef.current;
  }, []);

  /**
   * Get last theta angle
   * @returns {number} last theta
   */
  const getLastTheta = useCallback(() => {
    return lastThetaRef.current;
  }, []);

  return {
    positionToTheta,
    getZoneFromPosition,
    isInZone,
    getDistanceToBoundary,
    getZoneProgress,
    isNearZoneBoundary,
    getLastZone,
    getLastTheta,
  };
}

export default useZoneDetection;
