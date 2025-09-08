// ========================================
// PROJECTS CONFIGURATION
// ========================================
// 
// To display your GitHub projects:
// 1. Replace the placeholder names below with your actual GitHub repository names
// 2. Make sure the names exactly match your GitHub repository names (case-sensitive)
// 3. The projects will automatically fetch data from GitHub API
//
// Example: If your GitHub repo is named "my-portfolio", use 'my-portfolio'
// ========================================

export const PROJECT_REPOS = [
  'Nnets',           // Neural Networks implementation
  'toronto-project', // Toronto city data analysis project
  'cryptoapp',            // Personal blog application
  'spotify-UI'       // Spotify UI clone/redesign
];

// ========================================
// CUSTOM PROJECT DESCRIPTIONS
// ========================================
// 
// Custom descriptions that will override GitHub descriptions
// These provide more detailed and engaging project information
// 
// Note: Language field will display with appropriate skill icons
// ========================================

export const CUSTOM_PROJECTS = {
  'Nnets': {
    description: 'A comprehensive neural network implementation featuring backpropagation, multiple activation functions, and gradient descent optimization. Built with Python and NumPy for educational purposes and practical machine learning applications.',
    language: 'Python'
  },
  
  'toronto-project': {
    description: 'Data analysis project exploring Toronto city datasets including demographics, transportation patterns, and urban development trends. Utilizes pandas, matplotlib, and statistical analysis to uncover insights about the city.',
    language: 'Python'
  },
  
  'cryptoapp': {
    description: 'A modern, responsive cryptocurrency dashboard built with React and Tailwind CSS, featuring real-time market data, charts, and news.',
    language: 'JavaScript',
    liveUrl: 'https://cryptoapp-livid-sigma.vercel.app/'
  },
  
  'spotify-UI': {
    description: 'A beautiful Spotify UI clone built with React and Tailwind CSS. Replicates the core Spotify interface including music player controls, playlist management, and responsive design for desktop and mobile devices.',
    language: 'JavaScript'
  }
};
