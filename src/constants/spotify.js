// Spotify API configuration
export const SPOTIFY_CONFIG = {
  // You'll need to get these from Spotify Developer Dashboard
  CLIENT_ID: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
  CLIENT_SECRET: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
  REDIRECT_URI: process.env.REACT_APP_SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback',
};

// Music artists with their Spotify IDs and descriptions
export const MUSIC_ARTISTS = [
  {
    id: '711MCceyCBcFnzjGY4Q7Un', // AC/DC
    name: 'AC/DC',
    description: 'Beer in one hand, Blood in the other',
    initials: 'AC',
    spotifyUrl: 'https://open.spotify.com/artist/711MCceyCBcFnzjGY4Q7Un'
  },
  {
    id: '3WrFJ7ztbogyGnTHbHJFl2', // The Beatles
    name: 'The Beatles',
    description: 'The best band ever',
    initials: 'TB',
    spotifyUrl: 'https://open.spotify.com/artist/3WrFJ7ztbogyGnTHbHJFl2'
  },
  {
    id: '1mYsTxnqsietFxj1OgoGbG', // A.R. Rahman
    name: 'A.R. Rahman',
    description: 'Musical Maestro',
    initials: 'AR',
    spotifyUrl: 'https://open.spotify.com/artist/1mYsTxnqsietFxj1OgoGbG'
  },
  {
    id: '6XyY86QOPPrYVGvF9ch6wz', // Linkin Park
    name: 'Linkin Park',
    description: 'RIP Chester Bennington',
    initials: 'LP',
    spotifyUrl: 'https://open.spotify.com/artist/6XyY86QOPPrYVGvF9ch6wz'
  }
];

// Spotify API endpoints
export const SPOTIFY_ENDPOINTS = {
  ARTIST: 'https://api.spotify.com/v1/artists',
  SEARCH: 'https://api.spotify.com/v1/search',
};
