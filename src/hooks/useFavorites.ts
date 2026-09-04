import { useState, useEffect } from 'react';
import { MovieStream, SeriesStream } from '../types';

export type FavoriteItem = (MovieStream | SeriesStream) & { mediaType: 'movie' | 'series' };

const FAVORITES_KEY = 'master_movie_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (_e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (_e) {}
  }, [favorites]);

  const isFavorite = (id: string | number): boolean => {
    return favorites.some(
      (f) => String(('stream_id' in f ? f.stream_id : f.series_id)) === String(id)
    );
  };

  const toggleFavorite = (item: (MovieStream | SeriesStream), mediaType: 'movie' | 'series') => {
    const id = 'stream_id' in item ? item.stream_id : item.series_id;
    setFavorites((prev) => {
      const exists = prev.some(
        (f) => String(('stream_id' in f ? f.stream_id : f.series_id)) === String(id)
      );
      if (exists) {
        return prev.filter(
          (f) => String(('stream_id' in f ? f.stream_id : f.series_id)) !== String(id)
        );
      } else {
        return [...prev, { ...item, mediaType }];
      }
    });
  };

  return {
    favorites,
    isFavorite,
    toggleFavorite,
  };
}
