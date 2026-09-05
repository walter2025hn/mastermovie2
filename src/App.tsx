import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Film,
  Tv,
  Search,
  Heart,
  Smartphone,
  Sparkles,
  Loader2,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Download,
  Info,
  User,
  Calendar,
  Clock,
  LogOut
} from 'lucide-react';
import {
  ContentTab,
  MovieStream,
  SeriesStream,
  MediaCategory,
  FilterOptions,
  SeriesEpisode,
  XtreamUserInfo,
  HistoryItem
} from './types';
import { xtreamService } from './services/xtreamApi';
import { App as CapacitorApp } from '@capacitor/app';
import { useDeviceMode } from './hooks/useDeviceMode';
import { useFavorites } from './hooks/useFavorites';
import { useHistory } from './hooks/useHistory';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { FilterBar } from './components/FilterBar';
import { MediaCard } from './components/MediaCard';
import { MediaDetailModal } from './components/MediaDetailModal';
import { VideoPlayer } from './components/VideoPlayer';
import { HistoryView } from './components/HistoryView';
import { DeviceModeSelector } from './components/DeviceModeSelector';
import { LoginModal } from './components/LoginModal';
import { SupportCreatorCard } from './components/SupportCreatorCard';
import { SupportCreatorModal } from './components/SupportCreatorModal';
import { ExitConfirmModal } from './components/ExitConfirmModal';
import { formatExpirationDate } from './utils/dateFormatter';
import {
  extractMediaYear,
  matchesGenre,
  normalizeText,
  detectMediaType,
  matchMediaTypeQuery,
} from './utils/mediaClassifier';

const BATCH_SIZE = 60; // "haz que las peliculas carguen de 60 en 60"

export default function App() {
  const { mode: deviceMode, setMode: setDeviceMode, config: modeConfig } = useDeviceMode();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const {
    history,
    recordPlayback,
    updateProgress,
    removeFromHistory,
    clearHistory,
    getHistoryItem,
  } = useHistory();

  // Authentication State & User Info (incluyendo fecha de expiración)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<XtreamUserInfo | null>(() => xtreamService.getUserInfo());
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Navigation & Saved Tabs - Guarda la pestaña seleccionada para no perderla
  const [activeTab, setActiveTab] = useState<ContentTab>(() => {
    const saved = localStorage.getItem('master_movie_active_tab');
    if (saved && ['all', 'movies', 'series', 'history', 'favorites', 'settings'].includes(saved)) {
      return saved as ContentTab;
    }
    return 'all';
  });
  const [tabHistory, setTabHistory] = useState<ContentTab[]>([]);
  const [showExitPrompt, setShowExitPrompt] = useState<boolean>(false);

  // Expiration date computation
  const expirationInfo = useMemo(() => {
    return formatExpirationDate(userInfo?.exp_date);
  }, [userInfo?.exp_date]);

  // Categories & Content
  const [vodCategories, setVodCategories] = useState<MediaCategory[]>([]);
  const [seriesCategories, setSeriesCategories] = useState<MediaCategory[]>([]);
  const [movies, setMovies] = useState<MovieStream[]>([]);
  const [series, setSeries] = useState<SeriesStream[]>([]);
  const [loadingContent, setLoadingContent] = useState<boolean>(false);

  // Pagination & Filtering
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [filters, setFilters] = useState<FilterOptions>({
    query: '',
    categoryId: 'all',
    genre: 'all',
    year: 'all',
    rating: 'all',
    sortBy: 'recent',
  });

  // Modals & Active Viewers
  const [selectedItem, setSelectedItem] = useState<{
    item: MovieStream | SeriesStream;
    mediaType: 'movie' | 'series';
  } | null>(null);

  const [activePlayback, setActivePlayback] = useState<{
    id: string | number;
    mediaType: 'movie' | 'series';
    title: string;
    subtitle?: string;
    streamUrl: string;
    directXtreamUrl?: string;
    initialTime?: number;
    containerExtension?: string;
    seriesId?: string | number;
    episodeId?: string | number;
    episodeNum?: number;
    seasonNum?: number;
  } | null>(null);

  const [showDeviceSelector, setShowDeviceSelector] = useState<boolean>(false);
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);

  // Synchronized refs for popstate (Android / browser back navigation trap)
  const activePlaybackRef = useRef(activePlayback);
  const selectedItemRef = useRef(selectedItem);
  const showSupportModalRef = useRef(showSupportModal);
  const showDeviceSelectorRef = useRef(showDeviceSelector);
  const showExitPromptRef = useRef(showExitPrompt);
  const tabHistoryRef = useRef(tabHistory);
  const activeTabRef = useRef(activeTab);

  useEffect(() => {
    activePlaybackRef.current = activePlayback;
  }, [activePlayback]);

  useEffect(() => {
    selectedItemRef.current = selectedItem;
  }, [selectedItem]);

  useEffect(() => {
    showSupportModalRef.current = showSupportModal;
  }, [showSupportModal]);

  useEffect(() => {
    showDeviceSelectorRef.current = showDeviceSelector;
  }, [showDeviceSelector]);

  useEffect(() => {
    showExitPromptRef.current = showExitPrompt;
  }, [showExitPrompt]);

  useEffect(() => {
    tabHistoryRef.current = tabHistory;
  }, [tabHistory]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Central back-button action with history memory:
  // closes player -> closes detail -> closes modals -> returns to previous tab -> asks confirmation to exit
  const handleBackAction = () => {
    // 1. Si el reproductor de video está abierto, cerrarlo
    if (activePlaybackRef.current) {
      setActivePlayback(null);
      return;
    }

    // 2. Si la ficha de detalles está abierta, cerrarla
    if (selectedItemRef.current) {
      setSelectedItem(null);
      return;
    }

    // 3. Si hay modales auxiliares abiertos, cerrarlos
    if (showSupportModalRef.current) {
      setShowSupportModal(false);
      return;
    }
    if (showDeviceSelectorRef.current) {
      setShowDeviceSelector(false);
      return;
    }

    // 4. Si el diálogo de confirmación de salida ya estaba abierto, cancelarlo/cerrarlo
    if (showExitPromptRef.current) {
      setShowExitPrompt(false);
      return;
    }

    // 5. Navegar hacia la pestaña previa guardada en la memoria (historial)
    if (tabHistoryRef.current.length > 0) {
      const historyCopy = [...tabHistoryRef.current];
      const previousTab = historyCopy.pop();
      if (previousTab) {
        setTabHistory(historyCopy);
        setActiveTab(previousTab);
        localStorage.setItem('master_movie_active_tab', previousTab);
        return;
      }
    }

    // 6. Si está en una pestaña secundaria sin historial previo, volver a 'all'
    if (activeTabRef.current !== 'all') {
      setActiveTab('all');
      localStorage.setItem('master_movie_active_tab', 'all');
      return;
    }

    // 7. En la pestaña raíz sin elementos abiertos: MOSTRAR AVISO PREGUNTANDO SI QUIERE SALIR
    setShowExitPrompt(true);
  };

  // Back-button navigation listeners: Web popstate + Native Android Capacitor backButton
  useEffect(() => {
    window.history.replaceState({ appRoot: true, tab: activeTab }, '');
    window.history.pushState({ appNav: true, tab: activeTab }, '');

    const handlePopState = () => {
      handleBackAction();
      window.history.pushState({ appNav: true, tab: activeTabRef.current }, '');
    };

    window.addEventListener('popstate', handlePopState);

    // Capacitor Native Android hardware / gesture back button
    let removeNativeListener: (() => void) | null = null;
    try {
      CapacitorApp.addListener('backButton', () => {
        handleBackAction();
      }).then((handle) => {
        removeNativeListener = () => handle.remove();
      }).catch(() => {});
    } catch (_e) {}

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (removeNativeListener) {
        removeNativeListener();
      }
    };
  }, []);

  // Check saved session on mount
  useEffect(() => {
    const saved = xtreamService.loadSavedCredentials();
    if (saved) {
      setUsername(saved.username);
      setIsDemoUser(xtreamService.isDemo());
      setUserInfo(xtreamService.getUserInfo());
      setIsAuthenticated(true);
      if (!xtreamService.isDemo()) {
        xtreamService.refreshUserInfo().then((fresh) => {
          if (fresh) setUserInfo(fresh);
        });
      }
    }
    setCheckingAuth(false);
  }, []);

  // Fetch categories and streams when authenticated with instant local cache + progressive streaming
  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Instant display from local storage/memory cache (0ms wait!)
    const cached = xtreamService.getCachedCatalog();
    let hasCachedData = false;

    if (cached.movies && cached.movies.length > 0) {
      setMovies(cached.movies);
      hasCachedData = true;
    }
    if (cached.vodCategories && cached.vodCategories.length > 0) {
      setVodCategories(cached.vodCategories);
      hasCachedData = true;
    }
    if (cached.seriesCategories && cached.seriesCategories.length > 0) {
      setSeriesCategories(cached.seriesCategories);
    }
    if (cached.series && cached.series.length > 0) {
      setSeries(cached.series);
    }

    if (hasCachedData) {
      setLoadingContent(false);
    } else {
      setLoadingContent(true);
    }

    // 2. Progressive loading: fetch movies & categories first so movies appear immediately!
    xtreamService.getVodCategories().then((vodCats) => {
      setVodCategories(vodCats);
    }).catch(() => {});

    xtreamService.getMovies().then((movieList) => {
      setMovies(movieList);
      setLoadingContent(false);
    }).catch(() => {})
      .finally(() => setLoadingContent(false));

    xtreamService.getSeriesCategories().then((serCats) => {
      setSeriesCategories(serCats);
    }).catch(() => {});

    xtreamService.getSeries().then((seriesList) => {
      setSeries(seriesList);
    }).catch(() => {});
  }, [isAuthenticated]);

  // Reset pagination batch count when tab, category, genre, year, sort, or query changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [activeTab, filters.categoryId, filters.genre, filters.year, filters.sortBy, filters.query]);

  // Update filter partially
  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Map category ID to Category Name for semantic genre matching
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    vodCategories.forEach((c) => map.set(String(c.category_id), c.category_name));
    seriesCategories.forEach((c) => map.set(String(c.category_id), c.category_name));
    return map;
  }, [vodCategories, seriesCategories]);

  // Switch category
  const activeCategories = useMemo(() => {
    if (activeTab === 'series') return seriesCategories;
    if (activeTab === 'movies') return vodCategories;
    if (activeTab === 'all' || activeTab === 'search') {
      const combined: MediaCategory[] = [
        { category_id: 'all', category_name: 'Todo el Catálogo (Películas y Series)' },
      ];
      vodCategories.forEach((c) => {
        if (c.category_id !== 'all') {
          combined.push({
            category_id: `vod_${c.category_id}`,
            category_name: `🎬 Película: ${c.category_name}`,
          });
        }
      });
      seriesCategories.forEach((c) => {
        if (c.category_id !== 'all') {
          combined.push({
            category_id: `ser_${c.category_id}`,
            category_name: `📺 Serie: ${c.category_name}`,
          });
        }
      });
      return combined;
    }
    return vodCategories;
  }, [activeTab, seriesCategories, vodCategories]);

  // Extract detected release years dynamically for current source items
  const availableYears = useMemo(() => {
    let sourceList: (MovieStream | SeriesStream)[] = [];
    if (activeTab === 'movies') sourceList = movies;
    else if (activeTab === 'series') sourceList = series;
    else if (activeTab === 'favorites') sourceList = favorites;
    else sourceList = [...movies, ...series];

    const counts: Record<number, number> = {};
    for (const item of sourceList) {
      const catName = categoryMap.get(String(item.category_id));
      const y = extractMediaYear(item, catName);
      if (y && y >= 1950 && y <= 2030) {
        counts[y] = (counts[y] || 0) + 1;
      }
    }

    return Object.keys(counts)
      .map(Number)
      .sort((a, b) => b - a)
      .map((y) => ({ year: String(y), count: counts[y] }));
  }, [activeTab, movies, series, favorites, categoryMap]);

  // Filter and Sort Content
  const filteredItems = useMemo(() => {
    let sourceList: (MovieStream | SeriesStream)[] = [];

    if (activeTab === 'movies') {
      sourceList = movies;
    } else if (activeTab === 'series') {
      sourceList = series;
    } else if (activeTab === 'favorites') {
      sourceList = favorites;
    } else {
      // 'all' or 'search': Recognizes both movies and series simultaneously
      sourceList = [...movies, ...series];
    }

    let result = sourceList;

    // 1. Category filter (supports raw ID or prefixed vod_/ser_ when in 'all' tab)
    if (filters.categoryId && filters.categoryId !== 'all') {
      if (filters.categoryId.startsWith('vod_')) {
        const rawId = filters.categoryId.replace('vod_', '');
        result = result.filter(
          (item) => 'stream_id' in item && String(item.category_id) === rawId
        );
      } else if (filters.categoryId.startsWith('ser_')) {
        const rawId = filters.categoryId.replace('ser_', '');
        result = result.filter(
          (item) => 'series_id' in item && String(item.category_id) === rawId
        );
      } else {
        result = result.filter(
          (item) => String(item.category_id) === String(filters.categoryId)
        );
      }
    }

    // 2. Genre / Thematic Filter (Terror, Suspenso, Acción, etc. for movies and series)
    if (filters.genre && filters.genre !== 'all') {
      result = result.filter((item) => {
        const catName = categoryMap.get(String(item.category_id));
        return matchesGenre(item, filters.genre, catName);
      });
    }

    // 3. Query Search (Supports title, year, genre terms like 'terror'/'suspenso', cast, plot, and media type keywords 'series' / 'peliculas')
    if (filters.query.trim()) {
      const rawQuery = filters.query.trim();
      const q = normalizeText(rawQuery);

      result = result.filter((item) => {
        const itemType = detectMediaType(item);

        // Check if query explicitly asks for 'series' or 'peliculas'
        const typeQueryCheck = matchMediaTypeQuery(itemType, rawQuery);
        if (typeQueryCheck.isMediaTypeSpecified && !typeQueryCheck.matches) {
          return false;
        }

        const effectiveQuery = typeQueryCheck.cleanQuery || (typeQueryCheck.isMediaTypeSpecified ? '' : q);
        if (!effectiveQuery) {
          // Query was strictly "series" or "peliculas", already matched
          return true;
        }

        const catName = categoryMap.get(String(item.category_id));
        const titleNorm = normalizeText(item.name);
        const castNorm = normalizeText(item.cast);
        const genreNorm = normalizeText(item.genre);
        const catNameNorm = normalizeText(catName);
        const plotNorm = normalizeText(item.plot);
        const itemYear = extractMediaYear(item, catName);
        const yearStr = itemYear ? String(itemYear) : '';

        // Semantic check: does query match genre keywords?
        const isGenreMatch = matchesGenre(item, effectiveQuery, catName);

        return (
          titleNorm.includes(effectiveQuery) ||
          castNorm.includes(effectiveQuery) ||
          genreNorm.includes(effectiveQuery) ||
          catNameNorm.includes(effectiveQuery) ||
          plotNorm.includes(effectiveQuery) ||
          yearStr === effectiveQuery ||
          isGenreMatch
        );
      });
    }

    // 4. Year filter (Exact year or Decades/Classics for movies and series)
    if (filters.year && filters.year !== 'all') {
      result = result.filter((item) => {
        const catName = categoryMap.get(String(item.category_id));
        const y = extractMediaYear(item, catName);
        if (!y) return false;
        if (filters.year === '2020s') return y >= 2020;
        if (filters.year === '2010s') return y >= 2010 && y <= 2019;
        if (filters.year === '2000s') return y >= 2000 && y <= 2009;
        if (filters.year === 'clasicos') return y < 2000;
        return y === parseInt(filters.year, 10);
      });
    }

    // 5. Rating filter
    if (filters.rating && filters.rating !== 'all') {
      const minRating = parseFloat(filters.rating);
      result = result.filter((item) => {
        const r = item.rating || item.rating_5based;
        if (!r) return false;
        const parsed = typeof r === 'number' ? r : parseFloat(String(r));
        const rating10 = parsed <= 5 ? parsed * 2 : parsed;
        return rating10 >= minRating;
      });
    }

    // 6. Sorting (Year newest-first, Year oldest-first, Rating, Alphabetical)
    result = [...result].sort((a, b) => {
      const catA = categoryMap.get(String(a.category_id));
      const catB = categoryMap.get(String(b.category_id));
      const yearA = extractMediaYear(a, catA) || 0;
      const yearB = extractMediaYear(b, catB) || 0;

      // Default & 'recent' / 'year-desc': Newest release year first (2025 -> 2024 -> 2023...)
      if (filters.sortBy === 'recent' || filters.sortBy === 'year-desc') {
        if (yearB !== yearA) {
          return yearB - yearA;
        }
        // Secondary: newest ID first
        const idA = Number('stream_id' in a ? a.stream_id : a.series_id) || 0;
        const idB = Number('stream_id' in b ? b.stream_id : b.series_id) || 0;
        return idB - idA;
      }

      // 'year-asc': Oldest release year first (Clásicos)
      if (filters.sortBy === 'year-asc') {
        if (yearA === 0 && yearB !== 0) return 1;
        if (yearB === 0 && yearA !== 0) return -1;
        if (yearA !== yearB) {
          return yearA - yearB;
        }
        return a.name.localeCompare(b.name);
      }

      if (filters.sortBy === 'rating') {
        const rA = Number(a.rating || a.rating_5based || 0);
        const rB = Number(b.rating || b.rating_5based || 0);
        return rB - rA;
      }

      if (filters.sortBy === 'az') {
        return a.name.localeCompare(b.name);
      }

      if (filters.sortBy === 'za') {
        return b.name.localeCompare(a.name);
      }

      return 0;
    });

    return result;
  }, [activeTab, movies, series, favorites, filters, categoryMap]);

  // Sliced items according to batch size (60 en 60)
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const hasMoreItems = visibleCount < filteredItems.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + BATCH_SIZE);
  };

  // Play Movie
  const handlePlayMovie = (movie: MovieStream) => {
    const ext = movie.container_extension || 'mp4';
    const streamUrl = xtreamService.getStreamUrl('movie', movie.stream_id, ext);
    const directXtreamUrl = xtreamService.getDirectXtreamStreamUrl('movie', movie.stream_id, ext);
    const existing = getHistoryItem(movie.stream_id);
    const initialTime = existing && existing.currentTime > 10 && !existing.completed ? existing.currentTime : 0;

    recordPlayback({
      id: movie.stream_id,
      mediaType: 'movie',
      title: movie.name,
      subtitle: 'Película • Full HD',
      poster: movie.stream_icon,
      streamUrl,
      directXtreamUrl,
      containerExtension: ext,
    });

    setActivePlayback({
      id: movie.stream_id,
      mediaType: 'movie',
      title: movie.name,
      subtitle: 'Película • Full HD',
      streamUrl,
      directXtreamUrl,
      initialTime,
      containerExtension: ext,
    });
    window.history.pushState({ appNav: true, tab: activeTab }, '');
  };

  // Play Series Episode
  const handlePlayEpisode = (s: SeriesStream, episode: SeriesEpisode) => {
    const ext = episode.container_extension || 'mp4';
    const streamUrl = xtreamService.getStreamUrl('series', episode.id, ext);
    const directXtreamUrl = xtreamService.getDirectXtreamStreamUrl('series', episode.id, ext);
    const existing = getHistoryItem(episode.id);
    const initialTime = existing && existing.currentTime > 10 && !existing.completed ? existing.currentTime : 0;
    const epSubtitle = episode.title || `Temporada ${episode.season_num || 1} • Episodio ${episode.episode_num}`;

    recordPlayback({
      id: episode.id,
      mediaType: 'series',
      title: s.name,
      subtitle: epSubtitle,
      poster: episode.info?.movie_image || s.cover,
      streamUrl,
      directXtreamUrl,
      containerExtension: ext,
      seriesId: s.series_id,
      episodeId: episode.id,
      episodeNum: episode.episode_num,
      seasonNum: episode.season_num,
    });

    setActivePlayback({
      id: episode.id,
      mediaType: 'series',
      title: s.name,
      subtitle: epSubtitle,
      streamUrl,
      directXtreamUrl,
      initialTime,
      containerExtension: ext,
      seriesId: s.series_id,
      episodeId: episode.id,
      episodeNum: episode.episode_num,
      seasonNum: episode.season_num,
    });
    window.history.pushState({ appNav: true, tab: activeTab }, '');
  };

  // Resume from History View
  const handleResumeHistory = (item: HistoryItem, resumeTime: number) => {
    setActivePlayback({
      id: item.id,
      mediaType: item.mediaType,
      title: item.title,
      subtitle: item.subtitle,
      streamUrl: item.streamUrl,
      directXtreamUrl: item.directXtreamUrl,
      initialTime: resumeTime,
      containerExtension: item.containerExtension,
      seriesId: item.seriesId,
      episodeId: item.episodeId,
      episodeNum: item.episodeNum,
      seasonNum: item.seasonNum,
    });
    window.history.pushState({ appNav: true, tab: activeTab }, '');
  };

  // Switch tab with history stack and local persistence
  const handleTabChange = (tab: ContentTab) => {
    if (tab !== activeTab) {
      setTabHistory((prev) => [...prev, activeTab]);
      setFilters((prev) => ({ ...prev, categoryId: 'all' }));
      setActiveTab(tab);
      localStorage.setItem('master_movie_active_tab', tab);
      window.history.pushState({ appNav: true, tab }, '');
    }
    if (tab === 'search') {
      const input = document.getElementById('quick-search-input');
      input?.focus();
    }
  };

  // Logout
  const handleLogout = () => {
    xtreamService.logout();
    setIsAuthenticated(false);
    setUsername('');
    setIsDemoUser(false);
    setUserInfo(null);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#050811] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="text-xs font-mono text-gray-400">
            Iniciando Master Movie...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#050811] text-gray-100 flex flex-col font-sans ${modeConfig.enableBlur ? '' : 'no-blur'}`}>
      {/* Top Header */}
      <Header
        deviceMode={deviceMode}
        onOpenDeviceSelector={() => {
          setShowDeviceSelector(true);
          window.history.pushState({ appNav: true, tab: activeTab }, '');
        }}
        onOpenSupportModal={() => {
          setShowSupportModal(true);
          window.history.pushState({ appNav: true, tab: activeTab }, '');
        }}
        onLogout={handleLogout}
        username={username}
        isDemo={isDemoUser}
        expirationFormatted={expirationInfo.shortDate}
        expirationFull={expirationInfo.formatted}
        canGoBack={tabHistory.length > 0 || activeTab !== 'all'}
        onGoBack={handleBackAction}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 pt-3 pb-24 space-y-4">
        {/* Settings / Device Mode View */}
        {activeTab === 'settings' ? (
          <div className="max-w-xl mx-auto space-y-5 pt-2">
            {/* Section: Apoyar al creador */}
            <SupportCreatorCard />

            {/* User Account & Expiration Details ("se mire la fecha de espiracion del usuario") */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0a101f] border border-cyan-950/60 space-y-3.5 shadow-lg shadow-cyan-950/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <User className="w-5 h-5" />
                  <span>Detalles de Cuenta y Suscripción</span>
                </div>
                <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${expirationInfo.badgeColor}`}>
                  {expirationInfo.statusLabel}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-black/40 border border-gray-800 space-y-1">
                  <span className="text-[11px] text-gray-400 block">Usuario de Streaming:</span>
                  <span className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
                    {username || 'Invitado'}
                    {isDemoUser && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                        Demo VIP
                      </span>
                    )}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-gray-800 space-y-1">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    Fecha de Expiración:
                  </span>
                  <span className="text-sm font-extrabold text-cyan-300">
                    {expirationInfo.formatted}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-xl bg-black/40 border border-gray-800 text-xs gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-gray-300">Servidor Master Movie Ultra HD (En línea)</span>
                </div>
                {userInfo?.max_connections && (
                  <span className="text-[11px] text-gray-400">
                    Pantallas: <strong className="text-white">{userInfo.max_connections} simultáneas</strong>
                  </span>
                )}
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 hover:border-red-700/60 text-red-200 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-[0.99] cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span>Cambiar de Cuenta / Salir</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0a101f] border border-cyan-950/60 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Smartphone className="w-5 h-5" />
                <span>Configuración de Rendimiento del Celular</span>
              </div>
              <p className="text-xs text-gray-300">
                Selecciona la capacidad de tu teléfono para optimizar la fluidez, animaciones y uso de memoria:
              </p>
              <DeviceModeSelector
                currentMode={deviceMode}
                onSelectMode={setDeviceMode}
                isModal={false}
              />
            </div>
          </div>
        ) : activeTab === 'history' ? (
          <HistoryView
            history={history}
            deviceMode={deviceMode}
            onResume={handleResumeHistory}
            onRemoveItem={removeFromHistory}
            onClearHistory={clearHistory}
            onExploreCatalog={() => handleTabChange('all')}
          />
        ) : (
          <>
            {/* Filter and Search Bar */}
            <FilterBar
              categories={activeCategories}
              filters={filters}
              onFilterChange={handleFilterChange}
              totalCount={filteredItems.length}
              shownCount={visibleItems.length}
              activeTab={
                activeTab === 'series'
                  ? 'series'
                  : activeTab === 'favorites'
                  ? 'favorites'
                  : activeTab === 'movies'
                  ? 'movies'
                  : 'all'
              }
              availableYears={availableYears}
              onSelectMediaType={(type) => {
                setActiveTab(type);
                handleFilterChange({ categoryId: 'all' });
              }}
              moviesCount={movies.length}
              seriesCount={series.length}
            />

            {/* Loading Indicator */}
            {loadingContent && (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <span className="text-xs text-gray-400">
                  Cargando catálogo en alta definición...
                </span>
              </div>
            )}

            {/* Empty State */}
            {!loadingContent && visibleItems.length === 0 && (
              <div className="py-16 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto text-gray-500">
                  <Film className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  No se encontraron títulos
                </h3>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  {filters.query
                    ? `No hay resultados para "${filters.query}". Intenta con otra palabra clave.`
                    : activeTab === 'favorites'
                    ? 'Aún no has guardado favoritos. Toca el corazón en cualquier título para guardarlo aquí.'
                    : 'Prueba cambiando de categoría o ajustando los filtros.'}
                </p>
                {filters.query && (
                  <button
                    onClick={() => handleFilterChange({ query: '', categoryId: 'all' })}
                    className="px-4 py-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-semibold"
                  >
                    Limpiar Búsqueda
                  </button>
                )}
              </div>
            )}

            {/* Media Grid: Responsive layout for mobile (2 columns), tablet (3-4 columns), desktop (5-6 columns) */}
            {!loadingContent && visibleItems.length > 0 && (
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
                {visibleItems.map((item) => {
                  const itemMediaType = detectMediaType(item);
                  const isMovie = itemMediaType === 'movie';
                  const id = isMovie ? (item as MovieStream).stream_id : (item as SeriesStream).series_id;
                  const catName = categoryMap.get(String(item.category_id));

                  return (
                    <MediaCard
                      key={`${itemMediaType}-${id}`}
                      item={item}
                      mediaType={itemMediaType}
                      categoryName={catName}
                      deviceMode={deviceMode}
                      isFavorite={isFavorite(id)}
                      onToggleFavorite={() => toggleFavorite(item, itemMediaType)}
                      onSelect={() => {
                        setSelectedItem({
                          item,
                          mediaType: itemMediaType,
                        });
                        window.history.pushState({ appNav: true, tab: activeTab }, '');
                      }}
                      onQuickPlay={() => {
                        if (isMovie) {
                          handlePlayMovie(item as MovieStream);
                        } else {
                          setSelectedItem({ item, mediaType: 'series' });
                          window.history.pushState({ appNav: true, tab: activeTab }, '');
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* Load More 60 in 60 Button ("haz que las peliculas carguen de 60 en 60") */}
            {!loadingContent && hasMoreItems && (
              <div className="pt-6 pb-4 flex flex-col items-center justify-center gap-2">
                <button
                  id="load-more-60-btn"
                  onClick={handleLoadMore}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-950/90 to-blue-950/90 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/40 text-cyan-200 text-xs sm:text-sm font-extrabold tracking-wide transition shadow-lg shadow-cyan-950/50 flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-cyan-400" />
                  <span>Cargar 60 títulos más</span>
                </button>
                <span className="text-[11px] text-gray-500">
                  Mostrando {visibleItems.length} de {filteredItems.length} disponibles
                </span>
              </div>
            )}

            {/* Apoyar al creador Banner at bottom of catalog */}
            {!loadingContent && visibleItems.length > 0 && (
              <div className="pt-6 pb-2 max-w-xl mx-auto">
                <SupportCreatorCard />
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        favoritesCount={favorites.length}
        historyCount={history.length}
      />

      {/* Detail Modal */}
      {selectedItem && (
        <MediaDetailModal
          item={selectedItem.item}
          mediaType={selectedItem.mediaType}
          categoryName={categoryMap.get(String(selectedItem.item.category_id))}
          deviceMode={deviceMode}
          isFavorite={isFavorite(
            'stream_id' in selectedItem.item
              ? selectedItem.item.stream_id
              : selectedItem.item.series_id
          )}
          onToggleFavorite={() =>
            toggleFavorite(selectedItem.item, selectedItem.mediaType)
          }
          onClose={() => setSelectedItem(null)}
          onPlayMovie={handlePlayMovie}
          onPlayEpisode={handlePlayEpisode}
        />
      )}

      {/* Video Player Modal */}
      {activePlayback && (
        <VideoPlayer
          title={activePlayback.title}
          subtitle={activePlayback.subtitle}
          streamUrl={activePlayback.streamUrl}
          directXtreamUrl={activePlayback.directXtreamUrl}
          deviceMode={deviceMode}
          initialTime={activePlayback.initialTime}
          onProgressUpdate={(currentTime, duration) => {
            if (activePlayback) {
              updateProgress(activePlayback.id, currentTime, duration);
            }
          }}
          onClose={() => setActivePlayback(null)}
        />
      )}

      {/* Device Mode Selector Modal */}
      {showDeviceSelector && (
        <DeviceModeSelector
          currentMode={deviceMode}
          onSelectMode={setDeviceMode}
          onClose={() => setShowDeviceSelector(false)}
          isModal={true}
        />
      )}

      {/* Support Creator Modal */}
      {showSupportModal && (
        <SupportCreatorModal onClose={() => setShowSupportModal(false)} />
      )}

      {/* Exit Confirmation Modal ("aviso preguntando si quiere salir de la app") */}
      {showExitPrompt && (
        <ExitConfirmModal
          onCancel={() => setShowExitPrompt(false)}
          onConfirmExit={() => {
            setShowExitPrompt(false);
            try {
              CapacitorApp.exitApp();
            } catch (_e) {
              try {
                window.close();
              } catch (_err) {}
            }
          }}
        />
      )}

      {/* Login Modal for zonacero.lat:8080 */}
      {!isAuthenticated && (
        <LoginModal
          onLoginSuccess={(loggedUser, isDemo, loggedUserInfo) => {
            setUsername(loggedUser);
            setIsDemoUser(Boolean(isDemo));
            if (loggedUserInfo) {
              setUserInfo(loggedUserInfo);
            }
            setIsAuthenticated(true);
          }}
          deviceMode={deviceMode}
          onSelectDeviceMode={setDeviceMode}
        />
      )}
    </div>
  );
}
