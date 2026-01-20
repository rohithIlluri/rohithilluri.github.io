// NPC Dialogue Configuration for Messenger-style Portfolio
// "The Wanderer's World" - A story-driven portfolio experience
// Each NPC represents a chapter of the journey

export const NPC_DIALOGUES = {
  guide: {
    name: 'The Guide',
    color: '#5DBFB8',
    chapter: 'The Arrival',
    dialogues: [
      {
        text: "Welcome, traveler. You've found my little world.",
        type: 'text',
      },
      {
        text: "I've been waiting for someone curious enough to explore.",
        type: 'text',
      },
      {
        text: "I built this place piece by piece, memory by memory. Each building holds a part of my story.",
        type: 'text',
      },
      {
        text: "Use WASD or Arrow keys to walk. Press E to talk with the residents.",
        type: 'text',
      },
      {
        text: "The Craftsman in the Workshop knows about the tools I've learned. The Architect guards my creations.",
        type: 'text',
      },
      {
        text: "The Musician fills the air with sounds that shaped me. The Critic knows the stories that moved me.",
        type: 'text',
      },
      {
        text: "And when you're ready to reach out, the Postmaster will help you send a message across the stars.",
        type: 'text',
      },
      {
        text: "Look around carefully. There are memories hidden everywhere... glowing orbs, scattered photos, postcards from my journey.",
        type: 'text',
      },
      {
        text: "Now go. This world is yours to discover.",
        type: 'text',
      },
    ],
  },

  craftsman: {
    name: 'The Craftsman',
    color: '#FF6B6B',
    chapter: 'The Learning',
    dialogues: [
      {
        text: "Ah, you've found the Workshop. *dusts off hands*",
        type: 'text',
      },
      {
        text: "I'm The Craftsman. Every tool in here has a story.",
        type: 'text',
      },
      {
        text: "Some were picked up quickly, others took years to master. But each one opened a door I couldn't have imagined.",
        type: 'text',
      },
      {
        text: null,
        type: 'skills',
        data: {
          categories: [
            {
              name: 'Languages',
              skills: ['JavaScript', 'TypeScript', 'Python', 'Java'],
            },
            {
              name: 'Frontend',
              skills: ['React', 'Next.js', 'HTML/CSS', 'Tailwind CSS'],
            },
            {
              name: 'Backend',
              skills: ['Node.js', 'Express.js', 'GraphQL', 'PostgreSQL', 'MongoDB'],
            },
            {
              name: 'Tools',
              skills: ['Git', 'Docker', 'AWS'],
            },
          ],
        },
      },
      {
        text: "JavaScript was the first love. Python became a trusted friend. TypeScript? That's the one that made everything click.",
        type: 'text',
      },
      {
        text: "The smoke from that chimney? It's from late nights and early mornings, hammering ideas into existence.",
        type: 'text',
      },
      {
        text: "A craftsman never stops learning. There's always a new tool to pick up, a new technique to master.",
        type: 'text',
      },
    ],
  },

  architect: {
    name: 'The Architect',
    color: '#98D8C8',
    chapter: 'The Building',
    dialogues: [
      {
        text: "Welcome to the Pavilion. I'm The Architect.",
        type: 'text',
      },
      {
        text: "Every structure here started as a dream. A 'what if?' that refused to stay quiet.",
        type: 'text',
      },
      {
        text: "Some took months. Some were weekend experiments. All taught me something.",
        type: 'text',
      },
      {
        text: null,
        type: 'projects',
        data: {
          projects: [
            {
              name: 'Crave',
              description: 'A marketplace for food lovers to share homecooked meals with the neighborhood.',
              tech: 'Next.js',
              url: 'https://crave-food-sharing.vercel.app/',
            },
            {
              name: 'CryptoApp',
              description: 'Modern cryptocurrency dashboard with real-time market data and charts.',
              tech: 'React',
              url: 'https://cryptoapp-livid-sigma.vercel.app/',
            },
            {
              name: 'Toronto Project',
              description: 'Data analysis exploring Toronto city datasets and urban trends.',
              tech: 'Python',
            },
            {
              name: 'Nnets',
              description: 'Neural network implementation inspired by Micrograd, built from scratch.',
              tech: 'Python',
            },
          ],
        },
      },
      {
        text: "Crave came from a simple thought: what if neighbors could share meals? The neural network? Pure curiosity about how machines learn.",
        type: 'text',
      },
      {
        text: "See that scaffolding? It's always there. Because an architect is never really done building.",
        type: 'text',
      },
      {
        text: "The blueprints are all on GitHub if you want to peek behind the curtain.",
        type: 'text',
      },
    ],
  },

  musician: {
    name: 'The Musician',
    color: '#FFD93D',
    chapter: 'The Listening',
    dialogues: [
      {
        text: "*adjusts headphones* Oh! A visitor to the Record Store.",
        type: 'text',
      },
      {
        text: "I'm The Musician. Sound is my language.",
        type: 'text',
      },
      {
        text: "Every vinyl on this wall kept me company through late nights of coding, moments of doubt, and bursts of inspiration.",
        type: 'text',
      },
      {
        text: null,
        type: 'music',
        data: {
          artists: [
            {
              name: 'AC/DC',
              description: 'For when the code needs energy',
              spotifyUrl: 'https://open.spotify.com/artist/711MCceyCBcFnzjGY4Q7Un',
            },
            {
              name: 'The Beatles',
              description: 'Timeless companions',
              spotifyUrl: 'https://open.spotify.com/artist/3WrFJ7ztbogyGnTHbHJFl2',
            },
            {
              name: 'A.R. Rahman',
              description: 'Musical genius from home',
              spotifyUrl: 'https://open.spotify.com/artist/1mYsTxnqsietFxj1OgoGbG',
            },
            {
              name: 'Linkin Park',
              description: 'Chester lives in these songs',
              spotifyUrl: 'https://open.spotify.com/artist/6XyY86QOPPrYVGvF9ch6wz',
            },
          ],
        },
      },
      {
        text: "AC/DC when the code needs energy. The Beatles for those contemplative moments. A.R. Rahman when I miss home.",
        type: 'text',
      },
      {
        text: "Linkin Park... that's for pushing through. Chester's voice hits different when you're debugging at 3 AM.",
        type: 'text',
      },
      {
        text: "What soundtrack plays in your head?",
        type: 'text',
      },
    ],
  },

  critic: {
    name: 'The Critic',
    color: '#E8B4A0',
    chapter: 'The Watching',
    dialogues: [
      {
        text: "*looks up from the screen* Ah, a fellow traveler of stories.",
        type: 'text',
      },
      {
        text: "I'm The Critic. Welcome to the Cinema.",
        type: 'text',
      },
      {
        text: "Stories shape us, you know? The films we love become part of who we are.",
        type: 'text',
      },
      {
        text: null,
        type: 'movies',
        data: {
          movies: [
            {
              name: 'Kill Bill: Vol. 1',
              year: 2003,
              description: 'Stylized vengeance as art',
              tmdbUrl: 'https://www.themoviedb.org/movie/24-kill-bill-vol-1',
            },
            {
              name: 'The Dark Knight',
              year: 2008,
              description: 'Chaos and order in conflict',
              tmdbUrl: 'https://www.themoviedb.org/movie/155',
            },
            {
              name: 'Interstellar',
              year: 2014,
              description: 'Love transcends dimensions',
              tmdbUrl: 'https://www.themoviedb.org/movie/157336',
            },
            {
              name: 'Pulp Fiction',
              year: 1994,
              description: 'Non-linear storytelling genius',
              tmdbUrl: 'https://www.themoviedb.org/movie/680',
            },
          ],
        },
      },
      {
        text: "Kill Bill taught me about dedication to craft. The Dark Knight? That chaos and order coexist.",
        type: 'text',
      },
      {
        text: "Interstellar reminded me that love is the one thing that transcends time. Pulp Fiction showed me rules are meant to be bent.",
        type: 'text',
      },
      {
        text: "What stories have shaped you?",
        type: 'text',
      },
    ],
  },

  postmaster: {
    name: 'The Postmaster',
    color: '#3B82F6',
    chapter: 'The Connecting',
    dialogues: [
      {
        text: "Welcome to the Post Office. I've been expecting you.",
        type: 'text',
      },
      {
        text: "I'm The Postmaster. I help messages travel far from this little planet.",
        type: 'text',
      },
      {
        text: "Connections are precious, you know. Every bridge built creates possibilities.",
        type: 'text',
      },
      {
        text: null,
        type: 'contact',
        data: {
          links: [
            {
              name: 'GitHub',
              url: 'https://github.com/rohithIlluri',
              icon: 'github',
              color: '#333333',
            },
            {
              name: 'Twitter / X',
              url: 'https://twitter.com/notforgrind',
              icon: 'twitter',
              color: '#1DA1F2',
            },
            {
              name: 'LinkedIn',
              url: 'https://linkedin.com/in/sree-naga-illuri',
              icon: 'linkedin',
              color: '#0077B5',
            },
            {
              name: 'Email',
              url: 'mailto:rohith.illuri@gmail.com',
              icon: 'email',
              color: '#FF6B6B',
            },
          ],
        },
      },
      {
        text: "Pick any letter from the mailbox. Each one will take you somewhere different.",
        type: 'text',
      },
      {
        text: "The best conversations I've seen start with a simple 'Hello.' Don't be afraid to send one.",
        type: 'text',
      },
      {
        text: "Now, is there a message you'd like to send?",
        type: 'text',
      },
    ],
  },
};

// Special completion dialogue for when player collects all items
export const COMPLETION_DIALOGUE = {
  guide_completion: {
    name: 'The Guide',
    color: '#5DBFB8',
    chapter: 'The Return',
    dialogues: [
      {
        text: "*smiles warmly* You've done it, traveler. You found every memory hidden in this world.",
        type: 'text',
      },
      {
        text: "Each orb you collected, each photo you found, each postcard you read... they're all pieces of a story.",
        type: 'text',
      },
      {
        text: "My story. And now, in a way, it's become part of yours too.",
        type: 'text',
      },
      {
        text: "Not many take the time to explore every corner. To seek out the hidden things. But you did.",
        type: 'text',
      },
      {
        text: "This world will always be here for you. The residents remember those who truly walked among them.",
        type: 'text',
      },
      {
        text: "Thank you for believing that every story, no matter how small, is worth discovering. Safe travels, friend.",
        type: 'text',
      },
    ],
  },
};

// Helper to get dialogue by NPC ID
export function getDialogueForNPC(npcId) {
  // Check completion dialogues first
  if (COMPLETION_DIALOGUE[npcId]) {
    return COMPLETION_DIALOGUE[npcId];
  }
  return NPC_DIALOGUES[npcId] || null;
}

// Get all NPC names
export function getAllNPCNames() {
  return Object.entries(NPC_DIALOGUES).map(([id, data]) => ({
    id,
    name: data.name,
    color: data.color,
  }));
}
