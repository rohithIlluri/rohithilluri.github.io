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
  'Crave',           // Food delivery marketplace app
  'toronto-project', // Toronto city data analysis project
  'cryptoapp',       // Cryptocurrency dashboard
  'Nnets'            // Neural network implementation (Micrograd)
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
  'Crave': {
    description: 'Share your Homecooked meals with the neighborhood. A marketplace for food lovers to share their recipes and find new ones.',
    language: 'Next.js',
    liveUrl: 'https://crave-food-sharing.vercel.app/',
    screenshot: '/project-screenshots/crave.png'
  },
  
  'toronto-project': {
    description: 'Data analysis project exploring Toronto city datasets including demographics, transportation patterns, and urban development trends. Utilizes pandas, matplotlib, and statistical analysis to uncover insights about the city.',
    language: 'Python'
  },
  
  'cryptoapp': {
    description: 'A modern, responsive cryptocurrency dashboard built with React and Tailwind CSS, featuring real-time market data, charts, and news.',
    language: 'JavaScript',
    liveUrl: 'https://cryptoapp-livid-sigma.vercel.app/',
    screenshot: '/project-screenshots/cryptoapp.png'
  },
  
  'Nnets': {
    description: 'A minimalistic neural network implementation inspired by Micrograd. Built from scratch using Jupyter notebooks, featuring automatic differentiation, backpropagation, and educational examples for understanding deep learning fundamentals.',
    language: 'Python'
  }
};
