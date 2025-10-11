import React, { memo, useState, useEffect } from 'react';
import { COMPONENT_STYLES } from '../../constants/theme';
import { PROJECT_REPOS, CUSTOM_PROJECTS } from '../../constants/projects';
import { fetchLiveRepoData, getRelativeTime } from '../../utils/github';
import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNodedotjs,
  SiPython,
  SiHtml5,
  SiCss3,
  SiTailwindcss,
  SiGit,
  SiDocker,
  SiMongodb,
  SiPostgresql,
  SiNextdotjs,
  SiGraphql
} from 'react-icons/si';
import { FaJava, FaGithub } from 'react-icons/fa';
import { GITHUB_USERNAME } from '../../constants/github';

// ========================================
// PROJECTS COMPONENT
// ========================================
// 
// This component displays specific GitHub repositories based on the names
// defined in src/constants/projects.js
// 
// To update which projects are displayed:
// 1. Edit src/constants/projects.js
// 2. Replace the placeholder repo names with your actual GitHub repo names
// 3. Make sure the names exactly match your GitHub repository names
// ========================================

const Projects = ({ repos, loading, error }) => {
  const [liveRepoData, setLiveRepoData] = useState({});
  const [liveDataLoading, setLiveDataLoading] = useState(false);

  // Filter repos to only show the specific ones
  const filteredRepos = repos.filter(repo => PROJECT_REPOS.includes(repo.name));

  // Fetch live data for projects on component mount and periodically
  const fetchLiveData = async () => {
    setLiveDataLoading(true);
    try {
      const liveData = await fetchLiveRepoData(PROJECT_REPOS);
      const liveDataMap = {};
      liveData.forEach(repo => {
        liveDataMap[repo.name] = repo;
      });
      setLiveRepoData(liveDataMap);
    } catch (error) {
      console.error('Error fetching live repository data:', error);
    } finally {
      setLiveDataLoading(false);
    }
  };

  useEffect(() => {
    // Fetch immediately
    fetchLiveData();

    // Set up periodic updates every 5 minutes
    const interval = setInterval(fetchLiveData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Helper function to get the best description for a repo
  const getRepoInfo = (repo) => {
    const customInfo = CUSTOM_PROJECTS[repo.name];
    const liveData = liveRepoData[repo.name];
    
    if (customInfo) {
      return {
        description: customInfo.description,
        language: customInfo.language || (liveData?.language) || repo.language,
        updated: liveData?.updated_at || repo.updated_at,
        liveData: liveData,
        liveUrl: (customInfo && customInfo.liveUrl) || liveData?.homepage || repo.homepage,
        githubUrl: repo.html_url
      };
    }
    return {
      description: repo.description || "No description provided.",
      language: (liveData?.language) || repo.language,
      updated: liveData?.updated_at || repo.updated_at,
      liveData: liveData,
      liveUrl: liveData?.homepage || repo.homepage,
      githubUrl: repo.html_url
    };
  };

  // Helper function to get the skill icon for a language
  const getLanguageIcon = (language, size = "w-4 h-4") => {
    if (!language) return null;
    
    switch (language.toLowerCase()) {
      case "javascript":
        return <SiJavascript className={`${size} text-yellow-400`} />;
      case "typescript":
        return <SiTypescript className={`${size} text-blue-600`} />;
      case "react":
        return <SiReact className={`${size} text-blue-400`} />;
      case "node.js":
      case "nodejs":
        return <SiNodedotjs className={`${size} text-green-600`} />;
      case "python":
        return <SiPython className={`${size} text-blue-500`} />;
      case "java":
        return <FaJava className={`${size} text-red-600`} />;
      case "html":
        return <SiHtml5 className={`${size} text-orange-500`} />;
      case "css":
        return <SiCss3 className={`${size} text-blue-500`} />;
      case "tailwind":
      case "tailwind css":
        return <SiTailwindcss className={`${size} text-cyan-500`} />;
      case "git":
        return <SiGit className={`${size} text-orange-600`} />;
      case "docker":
        return <SiDocker className={`${size} text-blue-500`} />;
      case "mongodb":
        return <SiMongodb className={`${size} text-green-500`} />;
      case "postgresql":
        return <SiPostgresql className={`${size} text-blue-600`} />;
      case "next.js":
      case "nextjs":
        return <SiNextdotjs className={`${size} text-black`} />;
      case "graphql":
        return <SiGraphql className={`${size} text-pink-500`} />;
      default:
        return (
          <div className={`${size} bg-gray-400 rounded-sm flex items-center justify-center text-white text-xs font-bold`}>
            {language.charAt(0).toUpperCase()}
          </div>
        );
    }
  };

  // Enhanced thumbnail logic - prioritize manual screenshots
  const getRepoThumbnailUrl = (repoName, liveUrl, customScreenshot) => {
    // Primary: Manual screenshot if provided
    const manual = customScreenshot;
    // Secondary: Live app screenshot if available  
    const liveScreenshot = liveUrl ? `https://api.screenshotone.com/take?access_key=demo&url=${encodeURIComponent(liveUrl)}&viewport_width=1200&viewport_height=800&device_scale_factor=1&format=png&image_quality=80&block_ads=true&block_cookie_banners=true&block_banners_by_heuristics=false&block_trackers=true&delay=3&timeout=60` : null;
    // Tertiary: WordPress mshots as fallback
    const mshot = liveUrl ? `https://s.wordpress.com/mshots/v1/${encodeURIComponent(liveUrl)}?w=1200&h=800` : null;
    // Quaternary: GitHub OpenGraph image
    const og = `https://opengraph.githubassets.com/1/${GITHUB_USERNAME}/${repoName}`;
    return { manual, liveScreenshot, mshot, og };
  };

  // Map GitHub topics into a small set of recognizable tech labels
  const normalizeTopicsToStack = (topics = []) => {
    const map = new Map([
      ['react', 'React'],
      ['nextjs', 'Next.js'],
      ['next-js', 'Next.js'],
      ['tailwindcss', 'Tailwind'],
      ['tailwind', 'Tailwind'],
      ['typescript', 'TypeScript'],
      ['javascript', 'JavaScript'],
      ['node', 'Node.js'],
      ['nodejs', 'Node.js'],
      ['express', 'Express'],
      ['python', 'Python'],
      ['flask', 'Flask'],
      ['django', 'Django']
    ]);
    const result = [];
    for (const t of topics) {
      const key = t.toLowerCase();
      if (map.has(key) && !result.includes(map.get(key))) {
        result.push(map.get(key));
      }
      if (result.length >= 6) break;
    }
    return result;
  };

  return (
    <section id="projects" className={COMPONENT_STYLES.section.base} aria-label="Projects section">
      {/* Header - responsive layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Featured Projects</h2>
          <p className="text-sm sm:text-lg text-gray-600 dark:text-slate-400 max-w-2xl leading-tight sm:leading-normal">
            Here are some of my recent projects showcasing different technologies and approaches to problem-solving.
          </p>
        </div>
        
        {/* Refresh button - responsive positioning */}
        <button
          onClick={fetchLiveData}
          disabled={liveDataLoading}
          className="flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 hover:border-gray-300 dark:hover:border-slate-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto"
          title="Refresh live data from GitHub"
        >
          <svg 
            className={`w-4 h-4 ${liveDataLoading ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="whitespace-nowrap">{liveDataLoading ? 'Updating...' : 'Refresh Data'}</span>
        </button>
      </div>
      
      <div className={COMPONENT_STYLES.section.container}>
        
        {loading && (
          <div className="text-center py-12 bg-white/50 dark:bg-slate-800/50 rounded-md border border-black/5 dark:border-slate-700">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-black/20 dark:border-slate-600 border-t-black dark:border-t-slate-200"></div>
            <p className="mt-4 text-black/70 dark:text-slate-400 text-sm">Loading projects...</p>
          </div>
        )}

        {error && (
          <div className="bg-black/5 dark:bg-slate-800/50 border border-black/10 dark:border-slate-700 rounded-md p-6 shadow-sm">
            <p className="text-black/80 dark:text-slate-300 text-center text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            {filteredRepos.map((repo) => {
              const repoInfo = getRepoInfo(repo);
              const techStack = normalizeTopicsToStack(repoInfo.liveData?.topics || repo.topics || []);
              return (
                <div
                  key={repo.id}
                  className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 will-change-transform"
                >
                  {/* Enhanced thumbnail with manual screenshot priority */}
                  <div className="relative h-36 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 overflow-hidden">
                    {(() => {
                      const customInfo = CUSTOM_PROJECTS[repo.name];
                      const { manual, liveScreenshot, mshot, og } = getRepoThumbnailUrl(repo.name, repoInfo.liveUrl, customInfo?.screenshot);
                      const primaryImage = manual || (repoInfo.liveUrl ? (liveScreenshot || mshot) : og);
                      const fallbackImage = manual ? (repoInfo.liveUrl ? (liveScreenshot || mshot || og) : og) : (repoInfo.liveUrl ? og : null);
                      
                      return (
                        <>
                          <img
                            src={primaryImage}
                            alt={`${repo.name} preview`}
                            className="w-full h-full object-contain sm:object-cover bg-white"
                            loading="lazy"
                            onError={(e) => {
                              if (fallbackImage && e.currentTarget.src !== fallbackImage) {
                                e.currentTarget.src = fallbackImage;
                              } else {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement.classList.add('bg-gradient-to-br', 'from-blue-50', 'to-purple-50');
                              }
                            }}
                          />
                          {/* Tech stack overlay */}
                          {techStack.length > 0 && (
                            <div className="absolute bottom-3 left-3 right-3">
                              <div className="flex flex-wrap gap-1">
                                {techStack.slice(0, 3).map((tech) => (
                                  <span 
                                    key={tech} 
                                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-gray-700 dark:text-slate-200 rounded-md shadow-sm"
                                  >
                                    {getLanguageIcon(tech.toLowerCase())}
                                    <span className="ml-1">{tech}</span>
                                  </span>
                                ))}
                                {techStack.length > 3 && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-gray-500 dark:text-slate-400 rounded-md shadow-sm">
                                    +{techStack.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Content section */}
                  <div className="p-3 sm:p-6">
                    <div className="mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {repo.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 mb-2 sm:mb-4">
                      {repoInfo.description}
                    </p>
                    
                    <div className="h-5 sm:h-6 flex items-center text-xs text-gray-500 dark:text-slate-400 mb-2 sm:mb-4">
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {getRelativeTime(repoInfo.updated)}
                      </span>
                    </div>

                    {/* Action buttons - responsive layout */}
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-0">
                      {/* Mobile: Stack vertically, Desktop: Side by side */}
                      <div className="flex flex-col items-start order-2 sm:order-1">
                        <button
                          type="button"
                          aria-label="View on GitHub"
                          onClick={() => window.open(repoInfo.githubUrl, '_blank', 'noopener,noreferrer')}
                          className="flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-gray-700 dark:text-slate-200 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg transition-all duration-200 min-w-[70px] sm:min-w-[80px] justify-center hover:bg-gray-200 dark:hover:bg-slate-600 hover:border-gray-300 dark:hover:border-slate-500 w-full sm:w-auto"
                        >
                          <FaGithub className="w-4 h-4" />
                          <span>Code</span>
                        </button>
                      </div>

                      <div className="flex flex-col items-end order-1 sm:order-2">
                        {/* Technology icons - responsive sizing */}
                        <div className="h-5 sm:h-6 flex items-center justify-end mb-1.5 sm:mb-2">
                          {(() => {
                            const allTechs = [...techStack];
                            // Add primary language if not already in techStack
                            if (repoInfo.language && !allTechs.some(tech => tech.toLowerCase() === repoInfo.language.toLowerCase())) {
                              allTechs.unshift(repoInfo.language);
                            }
                            
                            return allTechs.length > 0 && (
                              <div className="flex items-center space-x-1">
                                {allTechs.slice(0, 3).map((tech) => {
                                  const icon = getLanguageIcon(tech.toLowerCase(), "w-4 h-4 sm:w-6 sm:h-6");
                                  return icon ? (
                                    <div key={tech} className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center">
                                      {icon}
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Demo button - responsive sizing */}
                        <div className="h-8 sm:h-10 flex items-center w-full sm:w-auto">
                          {repoInfo.liveUrl && (
                            <button
                              type="button"
                              onClick={() => window.open(repoInfo.liveUrl, '_blank', 'noopener,noreferrer')}
                              className="flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg shadow-sm transition-all duration-200 min-w-[70px] sm:min-w-[80px] justify-center hover:bg-blue-800 dark:hover:bg-blue-600 hover:shadow-md w-full sm:w-auto"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              <span>Demo</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && filteredRepos.length === 0 && (
          <div className="text-center py-12 bg-white/50 dark:bg-slate-800/50 rounded-md border border-black/5 dark:border-slate-700">
            <p className="text-black/70 dark:text-slate-400 text-sm">
              No matching projects found. Update the repo names in <code className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">src/constants/projects.js</code> to display your projects.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(Projects); 