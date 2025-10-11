import React, { memo, useState, useEffect } from 'react';
import { COMPONENT_STYLES } from '../../constants/theme';
import { MUSIC_ARTISTS } from '../../constants/spotify';
import { fetchArtistData, getArtistImageUrl } from '../../utils/spotify';

// Local image mapping using public folder (no import issues)
const LOCAL_ARTIST_IMAGES = {
  '711MCceyCBcFnzjGY4Q7Un': '/artists/ac-dc.jpg', // ac/dc
  '3WrFJ7ztbogyGnTHbHJFl2': '/artists/the-beatles.jpg', // The Beatles
  '1mYsTxnqsietFxj1OgoGbG': '/artists/ar-rahman.jpg', // A.R. Rahman
  '6XyY86QOPPrYVGvF9ch6wz': '/artists/linkin-park.jpg', // Linkin Park
};

const Music = () => {
  const [artistsData, setArtistsData] = useState({});

  useEffect(() => {
    const fetchArtistsData = async () => {
      const data = {};
      for (const artist of MUSIC_ARTISTS) {
        data[artist.id] = await fetchArtistData(artist.id);
        console.log(`Artist ${artist.name} data:`, data[artist.id]);
      }
      setArtistsData(data);
      console.log('All artists data:', data);
    };

    fetchArtistsData();
  }, []);

  const handleArtistClick = (spotifyUrl) => {
    window.open(spotifyUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="music" className={COMPONENT_STYLES.section.base} aria-label="Music section">
      <div className={COMPONENT_STYLES.section.container}>
        <h2 className={COMPONENT_STYLES.section.heading}>Music</h2>
       
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {MUSIC_ARTISTS.map((artist) => {
            const artistData = artistsData[artist.id];
            const imageUrl = artistData && artistData.images && artistData.images.length > 0 ? getArtistImageUrl(artistData, 'small') : LOCAL_ARTIST_IMAGES[artist.id];
            
            return (
              <div 
                key={artist.id}
                onClick={() => handleArtistClick(artist.spotifyUrl)}
                className="flex items-center space-x-6 p-8 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-pointer group min-h-[140px]"
              >
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={`${artist.name} poster`}
                    className="w-24 h-24 rounded-full object-cover shadow-sm"
                    onError={(e) => {
                      console.log('Image failed to load:', imageUrl);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    onLoad={(e) => {
                      console.log('Image loaded successfully:', imageUrl);
                    }}
                  />
                ) : null}
                <div className={`w-24 h-24 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center text-gray-700 dark:text-slate-200 text-3xl font-bold ${imageUrl ? 'hidden' : 'flex'}`}>
                  {artist.initials}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-black dark:text-white text-xl mb-2">{artist.name}</h3>
                  <p className="text-gray-600 dark:text-slate-400 text-lg leading-relaxed">{artist.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default memo(Music);
