import React, { memo, useEffect } from 'react';
import { COMPONENT_STYLES } from '../../constants/theme';
import { gsap } from 'gsap';

const Hero = () => {
  useEffect(() => {
    const masterTimeline = gsap.timeline();

    // Function to create the drawing animation for an icon
    const createDrawAnimation = (containerId) => {
      const container = document.getElementById(containerId);
      const paths = container.querySelectorAll('.draw-path');
      const tl = gsap.timeline();
      tl.to(paths, {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power2.inOut',
      })
      .to(paths, {
        fill: '#ffffff',
        stroke: 'none',
        filter: 'none',
        duration: 0.5
      }, '-=0.75');
      return tl;
    };

    // Add drawing animations to the master timeline
    masterTimeline
      .add(createDrawAnimation('x-icon'))
      .add(createDrawAnimation('linkedin-icon'), '-=1.8')
      .add(createDrawAnimation('github-icon'), '-=1.8')
      .add(createDrawAnimation('discord-icon'), '-=1.8')
      .add(createDrawAnimation('mail-icon'), '-=1.8');

    // GitHub Eyes
    const githubEyes = document.querySelectorAll('#github-icon .eyes');
    masterTimeline.to(githubEyes, { opacity: 1, duration: 0.3 }, '-=1.0');
    
    const githubBlink = gsap.timeline({ repeat: -1, repeatDelay: 1.5, delay: 1.5 });
    githubBlink.to(githubEyes, { opacity: 0, duration: 0.06 })
               .to(githubEyes, { opacity: 1, duration: 0.06 })
               .to(githubEyes, { opacity: 0, duration: 0.06 })
               .to(githubEyes, { opacity: 1, duration: 0.06 });

    // Discord Eyes
    const discordEyes = document.querySelectorAll('#discord-icon .discord-eyes');
    masterTimeline.to(discordEyes, { opacity: 1, duration: 0.3 }, '-=1.0');
    
    const discordBlink = gsap.timeline({ repeat: -1, repeatDelay: 2, delay: 2 });
    discordBlink.to(discordEyes, { opacity: 0, duration: 0.06 })
                .to(discordEyes, { opacity: 1, duration: 0.06 })
                .to(discordEyes, { opacity: 0, duration: 0.06 })
                .to(discordEyes, { opacity: 1, duration: 0.06 });
  }, []);

  return (
    <section id="hero" className={`${COMPONENT_STYLES.section.base} -mt-8 pt-2`} aria-label="Hero section">
      <div className={COMPONENT_STYLES.section.container}>
        
        
        <div className="mb-8">
          <h2 className={`${COMPONENT_STYLES.fontSizes.lg} font-bold text-black dark:text-white mb-3`}>tldr; </h2>
          <div className="space-y-2 text-black/70 dark:text-slate-400">
            <p>self-taught developer by shipping things on the internet</p>
            <p>into tech and physics – things that shape the universe</p>
            <p>fascinated by space, science, and ideas that expand the mind</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className={`${COMPONENT_STYLES.fontSizes.lg} font-bold text-black dark:text-white mb-3`}>Socials</h2>
          <div className="flex space-x-4">
            {/* Twitter/X */}
            <a
              href="https://twitter.com/notforgrind"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-16 h-16 bg-gray-800 dark:bg-slate-700 rounded-xl flex items-center justify-center text-white hover:bg-gray-700 dark:hover:bg-slate-600 transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg"
              aria-label="Follow on Twitter/X"
            >
              <svg
                id="x-icon"
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="draw-path"
                  d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.931ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="2000"
                  strokeDashoffset="2000"
                  style={{ filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.6))' }}
                />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com/in/sree-naga-illuri"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-16 h-16 bg-gray-800 dark:bg-slate-700 rounded-xl flex items-center justify-center text-white hover:bg-gray-700 dark:hover:bg-slate-600 transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg"
              aria-label="Connect on LinkedIn"
            >
              <svg
                id="linkedin-icon"
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="draw-path"
                  d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="2000"
                  strokeDashoffset="2000"
                  style={{ filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.6))' }}
                />
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/rohithIlluri"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-16 h-16 bg-gray-800 dark:bg-slate-700 rounded-xl flex items-center justify-center text-white hover:bg-gray-700 dark:hover:bg-slate-600 transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg"
              aria-label="View GitHub profile"
            >
              <svg
                id="github-icon"
                className="w-8 h-8 text-white"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="draw-path"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="2000"
                  strokeDashoffset="2000"
                  style={{ filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.6))' }}
                />
                <circle className="eyes" cx="6.3" cy="6.3" r="1" fill="#ffffff" style={{ opacity: 0 }} />
                <circle className="eyes" cx="9.7" cy="6.3" r="1" fill="#ffffff" style={{ opacity: 0 }} />
              </svg>
            </a>

            {/* Discord */}
            <a
              href="https://discord.com/users/tars9791"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-16 h-16 bg-gray-800 dark:bg-slate-700 rounded-xl flex items-center justify-center text-white hover:bg-gray-700 dark:hover:bg-slate-600 transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg"
              aria-label="Join Discord server"
            >
              <svg
                id="discord-icon"
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="draw-path"
                  d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.078.037c-.211.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.078-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.045-.319 13.579.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.134 10.248 10.248 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292.077.055.017.149-.06.134a13.258 13.258 0 0 1-1.872.892.077.077 0 0 0-.041.106c.36.698.772 1.362 1.225 1.994a.076.076 0 0 0 .084.028 19.9 19.9 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.673-3.548-13.66a.07.07 0 0 0-.031-.028z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="2000"
                  strokeDashoffset="2000"
                  style={{ filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.6))' }}
                />
                <circle className="discord-eyes" cx="8.5" cy="12.5" r="1.5" fill="#000000" style={{ opacity: 0 }} />
                <circle className="discord-eyes" cx="15.5" cy="12.5" r="1.5" fill="#000000" style={{ opacity: 0 }} />
              </svg>
            </a>

            {/* Email */}
            <a
              href="mailto:rohith.illuri@gmail.com"
              className="group relative w-16 h-16 bg-gray-800 dark:bg-slate-700 rounded-xl flex items-center justify-center text-white hover:bg-gray-700 dark:hover:bg-slate-600 transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg"
              aria-label="Send email"
            >
              <svg
                id="mail-icon"
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  className="draw-path"
                  d="M0 3.754v16.492c0 .535.434.969.969.969h22.062c.535 0 .969-.434.969-.969V3.754a.97.97 0 0 0-.349-.747L12.72.113a.968.968 0 0 0-1.44 0L.35 3.007a.97.97 0 0 0-.35.747zm1.938.93L12 11.217l10.062-6.533V19.28H1.938V4.684z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="2000"
                  strokeDashoffset="2000"
                  style={{ filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.6))' }}
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(Hero); 