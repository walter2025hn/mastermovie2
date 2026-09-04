import React, { useState, useEffect } from 'react';
import { X, Play, Heart, Star, Calendar, Clock, Film, Tv, Share2, Layers, ExternalLink, Sparkles } from 'lucide-react';
import { MovieStream, SeriesStream, SeriesDetails, DevicePerformanceMode, SeriesEpisode } from '../types';
import { xtreamService } from '../services/xtreamApi';
import { extractMediaYear, getDetectedGenres } from '../utils/mediaClassifier';

interface MediaDetailModalProps {
  item: MovieStream | SeriesStream;
  mediaType: 'movie' | 'series';
  categoryName?: string;
  deviceMode: DevicePerformanceMode;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
  onPlayMovie: (item: MovieStream) => void;
  onPlayEpisode: (series: SeriesStream, episode: SeriesEpisode) => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  item,
  mediaType,
  categoryName,
  deviceMode,
  isFavorite,
  onToggleFavorite,
  onClose,
  onPlayMovie,
  onPlayEpisode,
}) => {
  const [seriesDetails, setSeriesDetails] = useState<SeriesDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  const detectedYear = extractMediaYear(item, categoryName);
  const year = detectedYear || ('year' in item ? item.year : ('release_date' in item ? item.release_date?.substring(0, 4) : ''));
  const detectedGenres = getDetectedGenres(item, categoryName);

  // Load series seasons and episodes if it's a series
  useEffect(() => {
    if (mediaType === 'series' && 'series_id' in item) {
      setLoadingDetails(true);
      xtreamService
        .getSeriesInfo(item.series_id)
        .then((details) => {
          setSeriesDetails(details);
          if (details?.seasons?.length > 0) {
            setSelectedSeason(details.seasons[0].season_number || 1);
          }
        })
        .finally(() => setLoadingDetails(false));
    }
  }, [item, mediaType]);

  const episodesForSeason: SeriesEpisode[] =
    seriesDetails?.episodes?.[String(selectedSeason)] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#090e1b] border border-cyan-900/50 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-950/60 my-auto max-h-[92vh] flex flex-col">
        {/* Top Banner / Backdrop Header */}
        <div className="relative aspect-[16/9] max-h-64 sm:max-h-72 w-full bg-[#050811] overflow-hidden flex-shrink-0">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={item.name}
              className="w-full h-full object-cover filter brightness-75 scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-cyan-950 to-blue-950 flex items-center justify-center">
              {mediaType === 'movie' ? <Film className="w-16 h-16 text-cyan-400/40" /> : <Tv className="w-16 h-16 text-blue-400/40" />}
            </div>
          )}

          {/* Vignette gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090e1b] via-[#090e1b]/60 to-black/40"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Floating Badges */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div className="space-y-1 max-w-[80%]">
              <span
                className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded shadow inline-flex items-center gap-1 ${
                  mediaType === 'series'
                    ? 'bg-purple-600 text-white border border-purple-400/40'
                    : 'bg-cyan-500 text-black border border-cyan-300/40'
                }`}
              >
                {mediaType === 'series' ? '📺 Serie de TV' : '🎬 Película'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                {item.name}
              </h2>
            </div>

            {ratingNum && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/80 border border-yellow-500/40 text-yellow-400 font-extrabold text-sm shadow-lg">
                <Star className="w-4 h-4 fill-yellow-400" />
                <span>{ratingNum}</span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300">
            {year && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>{year}</span>
              </div>
            )}
            {'duration' in item && item.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{item.duration}</span>
              </div>
            )}
            <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-semibold text-cyan-300">
              Full HD / 4K
            </span>
            <span className="px-2 py-0.5 rounded bg-gray-800 text-[10px] font-semibold text-gray-300">
              Audio 5.1 & Estéreo
            </span>
          </div>

          {/* Detected Genres Pills */}
          {detectedGenres.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Género:
              </span>
              {detectedGenres.map((g) => (
                <span
                  key={g.id}
                  className="px-2.5 py-0.5 rounded-full bg-[#10192e] border border-cyan-500/30 text-xs font-semibold text-cyan-200 flex items-center gap-1"
                >
                  <span>{g.emoji}</span>
                  <span>{g.name}</span>
                </span>
              ))}
            </div>
          )}

          {/* Synopsis / Plot */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Sinopsis
            </h4>
            <p className="text-sm text-gray-200 leading-relaxed">
              {item.plot ||
                'Disfruta de este título en alta fidelidad en la aplicación Master Movie.'}
            </p>
          </div>

          {/* Cast & Director */}
          {(item.cast || item.director) && (
            <div className="space-y-1 text-xs text-gray-400 pt-2 border-t border-gray-800">
              {item.director && (
                <p>
                  <strong className="text-gray-300">Director:</strong> {item.director}
                </p>
              )}
              {item.cast && (
                <p>
                  <strong className="text-gray-300">Reparto:</strong> {item.cast}
                </p>
              )}
            </div>
          )}

          {/* Main Action Bar for Movie */}
          {mediaType === 'movie' && (
            <div className="pt-2 flex items-center gap-3">
              <button
                id="play-movie-now-btn"
                onClick={() => onPlayMovie(item as MovieStream)}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-sm tracking-wide transition shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                <Play className="w-5 h-5 fill-black text-black" />
                <span>Reproducir Película</span>
              </button>

              <button
                onClick={onToggleFavorite}
                className={`p-3.5 rounded-2xl border transition active:scale-95 ${
                  isFavorite
                    ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
                    : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:text-white'
                }`}
                title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
              </button>
            </div>
          )}

          {/* Series Seasons and Episodes Selector */}
          {mediaType === 'series' && (
            <div className="pt-3 border-t border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Temporadas y Episodios
                </h4>
                <button
                  onClick={onToggleFavorite}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                    isFavorite
                      ? 'bg-red-950/80 border-red-500 text-red-300'
                      : 'bg-gray-800/80 border-gray-700 text-gray-300 hover:text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-red-400' : ''}`} />
                  <span>{isFavorite ? 'En Favoritos' : 'Guardar'}</span>
                </button>
              </div>

              {/* Seasons tabs */}
              {seriesDetails?.seasons && seriesDetails.seasons.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {seriesDetails.seasons.map((s) => (
                    <button
                      key={s.season_number}
                      onClick={() => setSelectedSeason(s.season_number)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                        selectedSeason === s.season_number
                          ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25'
                          : 'bg-gray-800/80 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {s.name || `Temporada ${s.season_number}`}
                    </button>
                  ))}
                </div>
              )}

              {/* Episodes List */}
              {loadingDetails ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  Cargando episodios...
                </div>
              ) : episodesForSeason.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {episodesForSeason.map((ep) => (
                    <div
                      key={ep.id}
                      onClick={() => onPlayEpisode(item as SeriesStream, ep)}
                      className="p-3 rounded-xl bg-[#0e1628] border border-cyan-950/60 hover:border-cyan-500/60 hover:bg-[#131f38] transition cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs group-hover:bg-cyan-500 group-hover:text-black transition">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                            {ep.title || `Episodio ${ep.episode_num}`}
                          </p>
                          <span className="text-[10px] text-gray-400">
                            Episodio {ep.episode_num} • HD
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider group-hover:underline">
                        Ver
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-gray-400">
                  Selecciona una temporada para ver los episodios disponibles.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
