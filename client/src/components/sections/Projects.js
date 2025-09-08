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
  const getLanguageIcon = (language) => {
    if (!language) return null;
    
    switch (language.toLowerCase()) {
      case "javascript":
        return <SiJavascript className="w-4 h-4 text-yellow-400" />;
      case "typescript":
        return <SiTypescript className="w-4 h-4 text-blue-600" />;
      case "react":
        return <SiReact className="w-4 h-4 text-blue-400" />;
      case "node.js":
      case "nodejs":
        return <SiNodedotjs className="w-4 h-4 text-green-600" />;
      case "python":
        return <SiPython className="w-4 h-4 text-blue-500" />;
      case "java":
        return <FaJava className="w-4 h-4 text-red-600" />;
      case "html":
        return <SiHtml5 className="w-4 h-4 text-orange-500" />;
      case "css":
        return <SiCss3 className="w-4 h-4 text-blue-500" />;
      case "tailwind":
      case "tailwind css":
        return <SiTailwindcss className="w-4 h-4 text-cyan-500" />;
      case "git":
        return <SiGit className="w-4 h-4 text-orange-600" />;
      case "docker":
        return <SiDocker className="w-4 h-4 text-blue-500" />;
      case "mongodb":
        return <SiMongodb className="w-4 h-4 text-green-500" />;
      case "postgresql":
        return <SiPostgresql className="w-4 h-4 text-blue-600" />;
      case "next.js":
      case "nextjs":
        return <SiNextdotjs className="w-4 h-4 text-black" />;
      case "graphql":
        return <SiGraphql className="w-4 h-4 text-pink-500" />;
      default:
        return (
          <div className="w-4 h-4 bg-gray-400 rounded-sm flex items-center justify-center text-white text-xs font-bold">
            {language.charAt(0).toUpperCase()}
          </div>
        );
    }
  };

  // Derive a thumbnail automatically from GitHub OpenGraph image
  const getRepoThumbnailUrl = (repoName, liveUrl) => {
    // Primary: GitHub OpenGraph image for the repo
    const og = `https://opengraph.githubassets.com/1/${GITHUB_USERNAME}/${repoName}`;
    // Secondary: WordPress mshots of live URL (if available)
    const mshot = liveUrl ? `https://s.wordpress.com/mshots/v1/${encodeURIComponent(liveUrl)}?w=1200` : null;
    return { og, mshot };
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
      <div className={COMPONENT_STYLES.section.container}>
        <div className="flex items-center justify-between mb-8">
          <h2 className={COMPONENT_STYLES.section.heading}>Recent Work</h2>
          <button
            onClick={fetchLiveData}
            disabled={liveDataLoading}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <span>{liveDataLoading ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
        
        {loading && (
          <div className="text-center py-12 bg-white/50 rounded-md border border-black/5">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-black/20 border-t-black"></div>
            <p className="mt-4 text-black/70 text-sm">Loading projects...</p>
          </div>
        )}

        {error && (
          <div className="bg-black/5 border border-black/10 rounded-md p-6 shadow-sm">
            <p className="text-black/80 text-center text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredRepos.map((repo) => {
              const repoInfo = getRepoInfo(repo);
              return (
                <div
                  key={repo.id}
                  className="p-6 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors group min-h-[220px] flex flex-col"
                >
                  {/* Auto-generated thumbnail */}
                  <div className="w-full h-40 rounded-md overflow-hidden border border-gray-200 bg-white mb-4 relative">
                    {(() => {
                      const { og, mshot } = getRepoThumbnailUrl(repo.name, repoInfo.liveUrl);
                      return (
                        <>
                          <img
                            src={og}
                            alt={`${repo.name} banner`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              if (mshot) {
                                e.currentTarget.src = mshot;
                              } else {
                                e.currentTarget.style.display = 'none';
                              }
                            }}
                          />
                          {/* Derived badges overlay (bottom-right) */}
                          <div className="absolute bottom-2 right-2 flex items-center space-x-2 bg-white/80 backdrop-blur px-2 py-1 rounded-md border border-gray-200">
                            {normalizeTopicsToStack(repoInfo.liveData?.topics || repo.topics || []).slice(0,4).map((label) => (
                              <span key={label} className="text-xs text-black/80">{label}</span>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-bold text-black text-xl mb-2 line-clamp-1">{repo.name}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed line-clamp-3">{repoInfo.description}</p>
                    <div className="mt-3 text-sm text-black/60 flex items-center space-x-3">
                      {repoInfo.language && (
                        <span className="flex items-center">
                          {getLanguageIcon(repoInfo.language)}
                          <span className="ml-2">{repoInfo.language}</span>
                        </span>
                      )}
                      <span>{getRelativeTime(repoInfo.updated)}</span>
                      {repoInfo.liveData && <span className="text-green-600">●</span>}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-between">
                    <button
                      type="button"
                      aria-label="Open GitHub repository"
                      onClick={() => window.open(repoInfo.githubUrl, '_blank', 'noopener,noreferrer')}
                      className="p-2 rounded-md border border-gray-200 bg-white text-black/70 hover:text-black hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                    >
                      <FaGithub className="w-4 h-4" />
                    </button>

                    {repoInfo.liveUrl ? (
                      <button
                        type="button"
                        onClick={() => window.open(repoInfo.liveUrl, '_blank', 'noopener,noreferrer')}
                        className="px-3 py-2 text-xs font-medium rounded-md bg-black text-button hover:bg-black/90 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
                      >
                        Check Demo
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && filteredRepos.length === 0 && (
          <div className="text-center py-12 bg-white/50 rounded-md border border-black/5">
            <p className="text-black/70 text-sm">
              No matching projects found. Update the repo names in <code className="bg-gray-100 px-2 py-1 rounded">src/constants/projects.js</code> to display your projects.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(Projects); 