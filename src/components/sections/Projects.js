import React, { memo, useState, useEffect } from 'react';
import { PROJECT_REPOS, CUSTOM_PROJECTS } from '../../constants/projects';
import { fetchLiveRepoData, getRelativeTime } from '../../utils/github';

const LANG_COLORS = {
  javascript: '#fbbf24',
  typescript: '#60a5fa',
  python:     '#60a5fa',
  'next.js':  '#e4e4e4',
  nextjs:     '#e4e4e4',
  react:      '#22d3ee',
  'node.js':  '#4ade80',
  java:       '#f87171',
  go:         '#22d3ee',
  rust:       '#fb923c',
  html:       '#fb923c',
};

const langColor = (lang) =>
  lang ? (LANG_COLORS[lang.toLowerCase()] ?? '#6b6b6b') : '#6b6b6b';

const Projects = ({ repos, loading, error }) => {
  const [liveData, setLiveData] = useState({});
  const [liveLoading, setLiveLoading] = useState(false);

  const filteredRepos = repos.filter((r) => PROJECT_REPOS.includes(r.name));

  const fetchLive = async () => {
    setLiveLoading(true);
    try {
      const data = await fetchLiveRepoData(PROJECT_REPOS);
      const map = {};
      data.forEach((r) => { map[r.name] = r; });
      setLiveData(map);
    } catch (_) {}
    finally { setLiveLoading(false); }
  };

  useEffect(() => {
    fetchLive();
    const id = setInterval(fetchLive, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const getInfo = (repo) => {
    const custom = CUSTOM_PROJECTS[repo.name];
    const live   = liveData[repo.name];
    return {
      description: custom?.description ?? repo.description ?? '—',
      language:    custom?.language ?? live?.language ?? repo.language,
      updated:     live?.updated_at ?? repo.updated_at,
      liveUrl:     custom?.liveUrl ?? live?.homepage ?? repo.homepage,
      githubUrl:   repo.html_url,
    };
  };

  return (
    <section id="projects" aria-label="Projects" style={{ marginBottom: '0.5rem' }}>
      <div className="term-block">
        <div className="term-cmd" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="term-prompt">❯</span>
            <span className="term-command">ls -l ~/projects/</span>
          </div>
          <button
            onClick={fetchLive}
            disabled={liveLoading}
            className="term-btn"
            style={{ cursor: liveLoading ? 'not-allowed' : 'pointer', opacity: liveLoading ? 0.5 : 1 }}
          >
            {liveLoading ? 'syncing…' : '↻ refresh'}
          </button>
        </div>

        <div className="term-output">
          {loading && (
            <p style={{ color: '#6b6b6b', fontSize: '0.8rem' }}>
              fetching repos<span className="term-cursor" />
            </p>
          )}

          {error && (
            <p style={{ color: '#f87171', fontSize: '0.8rem' }}>
              error: {error}
            </p>
          )}

          {!loading && !error && filteredRepos.length === 0 && (
            <p style={{ color: '#6b6b6b', fontSize: '0.8rem' }}>
              no matching repos found
            </p>
          )}

          {!loading && !error && filteredRepos.map((repo) => {
            const info = getInfo(repo);
            const dirName = repo.name.toLowerCase() + '/';
            return (
              <div key={repo.id} className="term-project-row">
                {/* Row header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}>
                  <span style={{ color: '#c084fc', fontWeight: 600, minWidth: '170px' }}>
                    {dirName}
                  </span>
                  <span style={{ color: langColor(info.language), fontSize: '0.75rem', minWidth: '80px' }}>
                    {info.language ?? '—'}
                  </span>
                  <span style={{ color: '#6b6b6b', fontSize: '0.75rem', flex: 1 }}>
                    {getRelativeTime(info.updated)}
                  </span>
                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      className="term-btn"
                      onClick={() => window.open(info.githubUrl, '_blank', 'noopener,noreferrer')}
                      aria-label={`View ${repo.name} on GitHub`}
                    >
                      [code]
                    </button>
                    {info.liveUrl && (
                      <button
                        className="term-btn term-btn-primary"
                        onClick={() => window.open(info.liveUrl, '_blank', 'noopener,noreferrer')}
                        aria-label={`Open ${repo.name} demo`}
                      >
                        [demo]
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p style={{
                  color: '#9a9a9a',
                  fontSize: '0.78rem',
                  margin: '4px 0 0 0',
                  lineHeight: 1.55,
                }}>
                  {info.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default memo(Projects);
