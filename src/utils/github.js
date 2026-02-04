// ========================================
// GITHUB API UTILITIES
// ========================================
// 
// Utility functions for fetching live GitHub repository data
// Provides real-time updates for project information
// ========================================

import { GITHUB_API_BASE, GITHUB_USERNAME } from '../constants/github';

/**
 * Fetch live repository data for specific projects
 * @param {string[]} repoNames - Array of repository names to fetch
 * @returns {Promise<Object[]>} Array of repository objects with live data
 */
export const fetchLiveRepoData = async (repoNames) => {
  try {
    const promises = repoNames.map(async (repoName) => {
      const repoRes = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repoName}`);
      if (!repoRes.ok) {
        console.warn(`Failed to fetch data for repository: ${repoName}`);
        return null;
      }
      const repoJson = await repoRes.json();

      // Fetch topics for richer tech metadata (best-effort)
      try {
        const topicsRes = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repoName}/topics`, {
          headers: { Accept: 'application/vnd.github+json' }
        });
        if (topicsRes.ok) {
          const topicsJson = await topicsRes.json();
          repoJson.topics = Array.isArray(topicsJson.names) ? topicsJson.names : [];
        } else {
          repoJson.topics = [];
        }
      } catch (e) {
        repoJson.topics = [];
      }

      return repoJson;
    });

    const results = await Promise.all(promises);
    return results.filter(repo => repo !== null);
  } catch (error) {
    console.error('Error fetching live repository data:', error);
    return [];
  }
};

/**
 * Fetch live repository data for a single project
 * @param {string} repoName - Repository name to fetch
 * @returns {Promise<Object|null>} Repository object with live data or null
 */
export const fetchSingleRepoData = async (repoName) => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repoName}`);
    if (!response.ok) {
      console.warn(`Failed to fetch data for repository: ${repoName}`);
      return null;
    }
    const repoJson = await response.json();

    // Attach topics (best-effort)
    try {
      const topicsRes = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${repoName}/topics`, {
        headers: { Accept: 'application/vnd.github+json' }
      });
      if (topicsRes.ok) {
        const topicsJson = await topicsRes.json();
        repoJson.topics = Array.isArray(topicsJson.names) ? topicsJson.names : [];
      } else {
        repoJson.topics = [];
      }
    } catch (e) {
      repoJson.topics = [];
    }

    return repoJson;
  } catch (error) {
    console.error(`Error fetching data for repository ${repoName}:`, error);
    return null;
  }
};

/**
 * Get formatted last updated date
 * @param {string} updatedAt - ISO date string from GitHub API
 * @returns {string} Formatted date string
 */
export const formatLastUpdated = (updatedAt) => {
  if (!updatedAt) return 'Unknown';
  
  const date = new Date(updatedAt);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Updated today';
  if (diffDays === 2) return 'Updated yesterday';
  if (diffDays <= 7) return `Updated ${diffDays} days ago`;
  if (diffDays <= 30) return `Updated ${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays <= 365) return `Updated ${Math.ceil(diffDays / 30)} months ago`;
  
  return `Updated ${Math.ceil(diffDays / 365)} years ago`;
};

/**
 * Get relative time for last updated
 * @param {string} updatedAt - ISO date string from GitHub API
 * @returns {string} Relative time string
 */
export const getRelativeTime = (updatedAt) => {
  if (!updatedAt) return 'Unknown';
  
  const date = new Date(updatedAt);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays} days ago`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays <= 365) return `${Math.ceil(diffDays / 30)} months ago`;
  
  return `${Math.ceil(diffDays / 365)} years ago`;
};
