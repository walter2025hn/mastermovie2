import React, { useState } from 'react';
import { Star, Play, Heart, Film, Tv, Calendar } from 'lucide-react';
import { MovieStream, SeriesStream, DevicePerformanceMode } from '../types';
import { xtreamService } from '../services/xtreamApi';
import { extractMediaYear, getDetectedGenres } from '../utils/mediaClassifier';

interface MediaCardProps {
  item: MovieStream | SeriesStream;
  mediaType: 'movie' | 'series';
  categoryName?: string;
  deviceMode: DevicePerformanceMode;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSelect: () => void;
  onQuickPlay: () => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  mediaType,
  categoryName,
  deviceMode,
  isFavorite,
  onToggleFavorite,
  onSelect,
  onQuickPlay,
}) => {
  const [imgError, setImgError] = useState(false);

  const rawPoster = 'stream_icon' in item ? item.stream_icon : item.cover;
  const posterUrl = rawPoster ? xtreamService.getSafePosterUrl(rawPoster) : '';

  const rawRating = item.rating || item.rating_5based;
  let ratingNum: number | null = null;
  if (rawRating) {
    const parsed = typeof rawRating === 'number' ? rawRating : parseFloat(String(rawRating));
    if (!isNaN(parsed) && parsed > 0) {
      ratingNum = parsed > 5 ? Math.round(parsed * 10) / 10 : Math.round(parsed * 2 * 10) / 10;
    }
  }

  // Detected release year and genres with category context
  const detectedYear = extractMediaYear(item, categoryName);
  const detectedGenres = getDetectedGenres(item, categoryName);
  const primaryGenre = detectedGenres.length > 0 ? detectedGenres[0] : null;

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl overflow-hidden bg-[#0c1322] border border-cyan-950/50 cursor-pointer select-none transition-all duration-200 flex flex-col ${
        deviceMode === 'alto'
          ? 'hover:border-cyan-500/80 hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1'
          : deviceMode === 'medio'
          ? 'hover:border-cyan-500/50 hover:shadow-md'
          : 'active:bg-gray-800'
      }`}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full bg-[#070b14] overflow-hidden">
        {posterUrl && !imgError ? (
          <img
            src={posterUrl}
            alt={item.name}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              deviceMode !== 'bajo' ? 'group-hover:scale-105' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-[#0c1424] to-[#060912]">
            {mediaType === 'movie' ? (
              <Film className="w-8 h-8 text-cyan-500/40 mb-2" />
            ) : (
              <Tv className="w-8 h-8 text-blue-500/40 mb-2" />
            )}
            <span className="text-xs font-bold text-gray-400 line-clamp-3">
              {item.name}
            </span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1">
            {mediaType === 'series' ? (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-950/90 backdrop-blur-sm border border-purple-500/50 text-[10px] font-extrabold text-purple-300 shadow">
                <Tv className="w-2.5 h-2.5 text-purple-400" />
                SERIE
              </span>
            ) : (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/90 backdrop-blur-sm border border-cyan-500/50 text-[10px] font-extrabold text-cyan-300 shadow">
                <Film className="w-2.5 h-2.5 text-cyan-400" />
                PELÍCULA
              </span>
            )}
            {ratingNum ? (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-yellow-500/30 text-yellow-400 text-[11px] font-extrabold shadow">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{ratingNum}</span>
              </div>
            ) : (
              <div className="px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-gray-300 font-mono">
                HD
              </div>
            )}
          </div>

          {/* Favorite heart button (pointer-events auto) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`pointer-events-auto p-1.5 rounded-full transition active:scale-90 ${
              isFavorite
                ? 'bg-red-600/90 text-white shadow-md shadow-red-600/40'
                : 'bg-black/60 backdrop-blur-sm text-gray-300 hover:text-white hover:bg-black/90'
            }`}
            title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Quick Play Overlay on Hover/Tap */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickPlay();
            }}
            className="w-12 h-12 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-lg shadow-cyan-500/50 hover:scale-110 active:scale-95 transition"
            title="Reproducir de inmediato"
          >
            <Play className="w-5 h-5 fill-black text-black ml-0.5" />
          </button>
        </div>

        {/* Year & Genre Pill bottom overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {detectedYear ? (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-sm border border-cyan-500/30 text-[10px] font-bold text-cyan-300 shadow">
              <Calendar className="w-2.5 h-2.5 text-cyan-400" />
              {detectedYear}
            </span>
          ) : (
            <span></span>
          )}

          {primaryGenre && (
            <span className="px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-sm border border-gray-700/60 text-[9px] font-bold text-gray-200 shadow truncate max-w-[50%]">
              {primaryGenre.emoji} {primaryGenre.name.split('/')[0].trim()}
            </span>
          )}
        </div>
      </div>

      {/* Media Metadata Info */}
      <div className="p-2.5 flex-1 flex flex-col justify-between">
        <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
          {item.name}
        </h3>

        <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-400">
          <span className="uppercase font-semibold tracking-wider text-[10px] text-cyan-400/80">
            {mediaType === 'movie' ? 'Película' : 'Serie'}
          </span>
          <span className="text-[10px] text-gray-500 font-medium">
            Full HD
          </span>
        </div>
      </div>
    </div>
  );
};
