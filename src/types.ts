export type DevicePerformanceMode = 'bajo' | 'medio' | 'alto';

export interface DeviceModeConfig {
  id: DevicePerformanceMode;
  name: string;
  tagline: string;
  description: string;
  color: string;
  enableAnimations: boolean;
  enableBlur: boolean;
  imageQuality: 'low' | 'medium' | 'high';
  bufferSize: number; // seconds
}

export interface XtreamUserInfo {
  username: string;
  password?: string;
  status: string;
  exp_date?: string | null;
  is_trial?: string;
  active_cons?: string;
  created_at?: string;
  max_connections?: string;
  allowed_output_formats?: string[];
  auth?: number | string;
}

export interface XtreamServerInfo {
  url?: string;
  port?: string;
  https_port?: string;
  server_protocol?: string;
  rtmp_port?: string;
  timezone?: string;
  timestamp_now?: number;
  time_now?: string;
}

export interface XtreamAuthResponse {
  user_info: XtreamUserInfo;
  server_info: XtreamServerInfo;
}

export interface MediaCategory {
  category_id: string;
  category_name: string;
  parent_id?: number;
}

export interface MovieStream {
  num?: number;
  name: string;
  title?: string;
  stream_type?: string;
  stream_id: number | string;
  stream_icon?: string;
  rating?: string | number;
  rating_5based?: number;
  added?: string;
  category_id: string;
  container_extension?: string;
  custom_sid?: string;
  direct_source?: string;
  year?: string;
  genre?: string;
  plot?: string;
  duration?: string;
  cast?: string;
  director?: string;
}

export interface SeriesStream {
  num?: number;
  name: string;
  title?: string;
  series_id: number | string;
  cover?: string;
  plot?: string;
  cast?: string;
  director?: string;
  genre?: string;
  year?: string;
  release_date?: string;
  releaseDate?: string;
  last_modified?: string;
  rating?: string | number;
  rating_5based?: number;
  category_id: string;
  backdrop_path?: string[];
  youtube_trailer?: string;
  episode_run_time?: string;
  seasons?: any[];
}

export interface SeriesEpisode {
  id: string | number;
  episode_num: number;
  season?: number;
  season_num?: number;
  title: string;
  container_extension: string;
  info?: {
    plot?: string;
    duration?: string;
    duration_secs?: number;
    movie_image?: string;
    rating?: number | string;
    releasedate?: string;
  };
}

export interface SeriesDetails {
  seasons: {
    season_number: number;
    name: string;
    episode_count: number;
    air_date?: string;
  }[];
  info: {
    name: string;
    cover: string;
    plot: string;
    cast: string;
    director: string;
    genre: string;
    releaseDate: string;
    rating: string;
    backdrop_path?: string[];
  };
  episodes: Record<string, SeriesEpisode[]>;
}

export type ContentTab = 'all' | 'movies' | 'series' | 'search' | 'favorites' | 'history' | 'settings';

export interface HistoryItem {
  id: string | number;
  mediaType: 'movie' | 'series';
  title: string;
  subtitle?: string;
  poster?: string;
  streamUrl: string;
  directXtreamUrl?: string;
  containerExtension?: string;
  currentTime: number; // in seconds
  duration: number; // in seconds
  progressPercentage: number; // 0 to 100
  lastWatched: number; // Unix timestamp in ms
  completed?: boolean;
  seriesId?: string | number;
  episodeId?: string | number;
  episodeNum?: number;
  seasonNum?: number;
}

export interface FilterOptions {
  query: string;
  categoryId: string;
  genre: string; // 'all' | 'terror' | 'suspenso' | 'accion' | etc.
  year: string; // 'all' | '2025' | '2024' | etc.
  rating: string;
  sortBy: 'recent' | 'year-desc' | 'year-asc' | 'rating' | 'az' | 'za';
  mediaTypeFilter?: 'all' | 'movies' | 'series';
}

export interface AppRemoteConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  latestVersion: string;
  minRequiredVersion: string;
  updateUrl: string;
  forceUpdate: boolean;
  updateMessage: string;
  globalAnnouncement: string;
  showAnnouncement: boolean;
  adminPin: string;
  customXtreamHost?: string;
  updatedAt?: string;
}

export interface BlockedUserRecord {
  username: string;
  reason: string;
  blockedAt: string;
  active: boolean;
}

