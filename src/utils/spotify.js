import { SPOTIFY_ENDPOINTS } from '../constants/spotify';

// Get Spotify access token (you'll need to implement OAuth flow)
export const getSpotifyAccessToken = async () => {
  // For now, return null - you'll need to implement OAuth
  // This is a placeholder for the actual OAuth implementation
  return null;
};

// Fetch artist data from Spotify
export const fetchArtistData = async (artistId) => {
  try {
    const token = await getSpotifyAccessToken();
    
    if (!token) {
      // Return basic artist data when no token
      console.log(`No Spotify token for ${artistId}, using basic data`);
      return {
        id: artistId,
        name: 'Artist',
        images: [],
        external_urls: { spotify: 'https://open.spotify.com' }
      };
    }

    const response = await fetch(`${SPOTIFY_ENDPOINTS.ARTIST}/${artistId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch artist data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching artist data:', error);
    // Return basic artist data on error
    return {
      id: artistId,
      name: 'Artist',
      images: [],
      external_urls: { spotify: 'https://open.spotify.com' }
    };
  }
};

// Get artist image URL
export const getArtistImageUrl = (artistData, size = 'medium') => {
  if (!artistData || !artistData.images || artistData.images.length === 0) {
    console.log('No images found in artist data:', artistData);
    return null;
  }

  const imageUrl = artistData.images[0].url;
  console.log(`Getting image URL for artist ${artistData.id}:`, imageUrl);

  // Return appropriate image size
  if (size === 'small' && artistData.images.length > 1) {
    return artistData.images[1].url; // Second image is usually smaller
  }
  
  return imageUrl; // First image is usually the largest
};
