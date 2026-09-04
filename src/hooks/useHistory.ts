import { useState, useEffect, useCallback } from 'react';
import { HistoryItem } from '../types';

const HISTORY_STORAGE_KEY = 'master_movie_history';
const MAX_HISTORY_ITEMS = 150;

export interface RecordPlaybackParams {
  id: string | number;
  mediaType: 'movie' | 'series';
  title: string;
  subtitle?: string;
  poster?: string;
  streamUrl: string;
  directXtreamUrl?: string;
  containerExtension?: string;
  seriesId?: string | number;
  episodeId?: string | number;
  episodeNum?: number;
  seasonNum?: number;
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Sort chronologically (most recently watched first)
        return parsed.sort((a, b) => (b.lastWatched || 0) - (a.lastWatched || 0));
      }
      return [];
    } catch (_e) {
      return [];
    }
  });

  // Sync to localStorage whenever history changes
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (_e) {}
  }, [history]);

  // Record playback start or touch
  const recordPlayback = useCallback((params: RecordPlaybackParams) => {
    const stringId = String(params.id);
    const now = Date.now();

    setHistory((prev) => {
      const existingIndex = prev.findIndex((item) => String(item.id) === stringId);

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const updatedItem: HistoryItem = {
          ...existing,
          ...params,
          lastWatched: now,
        };

        // Move to the very top (most recent)
        const newHistory = [
          updatedItem,
          ...prev.filter((_, i) => i !== existingIndex),
        ];
        return newHistory.slice(0, MAX_HISTORY_ITEMS);
      }

      // New item
      const newItem: HistoryItem = {
        id: params.id,
        mediaType: params.mediaType,
        title: params.title,
        subtitle: params.subtitle,
        poster: params.poster,
        streamUrl: params.streamUrl,
        directXtreamUrl: params.directXtreamUrl,
        containerExtension: params.containerExtension,
        currentTime: 0,
        duration: 0,
        progressPercentage: 0,
        lastWatched: now,
        completed: false,
        seriesId: params.seriesId,
        episodeId: params.episodeId,
        episodeNum: params.episodeNum,
        seasonNum: params.seasonNum,
      };

      return [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

  // Update progress in real time (currentTime & duration)
  const updateProgress = useCallback((id: string | number, currentTime: number, duration: number) => {
    if (!id) return;
    const stringId = String(id);
    const validCurrent = Math.max(0, Number(currentTime) || 0);
    const validDuration = Math.max(0, Number(duration) || 0);

    const progressPercentage = validDuration > 0
      ? Math.min(100, Math.round((validCurrent / validDuration) * 100))
      : 0;

    const completed = validDuration > 60 && validCurrent >= validDuration - 30;

    setHistory((prev) => {
      const index = prev.findIndex((item) => String(item.id) === stringId);
      if (index === -1) return prev;

      const currentItem = prev[index];
      const updated: HistoryItem = {
        ...currentItem,
        currentTime: validCurrent,
        duration: validDuration > 0 ? validDuration : currentItem.duration,
        progressPercentage,
        completed,
        lastWatched: Date.now(),
      };

      const copy = [...prev];
      copy[index] = updated;
      // Keep sorted by lastWatched descending
      return copy.sort((a, b) => (b.lastWatched || 0) - (a.lastWatched || 0));
    });
  }, []);

  // Remove single item from history
  const removeFromHistory = useCallback((id: string | number) => {
    const stringId = String(id);
    setHistory((prev) => prev.filter((item) => String(item.id) !== stringId));
  }, []);

  // Clear entire history
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (_e) {}
  }, []);

  // Retrieve item to check if it can be resumed
  const getHistoryItem = useCallback(
    (id: string | number): HistoryItem | undefined => {
      const stringId = String(id);
      return history.find((item) => String(item.id) === stringId);
    },
    [history]
  );

  return {
    history,
    recordPlayback,
    updateProgress,
    removeFromHistory,
    clearHistory,
    getHistoryItem,
  };
}
