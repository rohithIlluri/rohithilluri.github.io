import React from 'react';

const GitHubAchievements = ({ achievements }) => {
  if (!achievements || achievements.length === 0) return null;

  return (
    <div className="bg-white p-4 group shadow-lg border border-gray-200 rounded-2xl hover:shadow-xl hover:border-gray-300 hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30 transition-all duration-300">
      <h4 className="text-xs font-medium uppercase tracking-wide text-black/80 mb-4 transition-all duration-200">GitHub Achievements</h4>
      <div className="space-y-3">
        {achievements.map((achievement, index) => (
          <div 
            key={index} 
            className="group/achievement flex items-center gap-3 p-3 bg-black/5 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-200/50 hover:ring-2 hover:ring-blue-100/30"
          >
            <div className="flex-shrink-0">
                              <span 
                  className="text-2xl hover:scale-125 hover:rotate-12 hover:drop-shadow-lg transition-all duration-300 group-hover/achievement:animate-bounce" 
                  role="img" 
                  aria-label={achievement.title}
                >
                  {achievement.icon}
                </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="font-medium text-sm text-black/90 hover:text-blue-600 hover:font-bold transition-all duration-200">
                  {achievement.title}
                </div>
                {achievement.tier && (
                  <span className="px-2 py-1 bg-black/10 text-xs font-medium text-black/70 rounded-md uppercase tracking-wide hover:bg-blue-200/50 hover:text-blue-700 hover:scale-110 hover:shadow-sm hover:animate-pulse transition-all duration-200">
                    {achievement.tier}
                  </span>
                )}
              </div>
              <div className="text-xs text-black/60 leading-relaxed hover:text-black/80 hover:font-medium transition-all duration-200">
                {achievement.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GitHubAchievements;