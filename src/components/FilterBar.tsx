import React, { useState } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Calendar,
  Star,
  Layers,
  Sparkles,
  Film,
  Tv
} from 'lucide-react';
import { MediaCategory, FilterOptions } from '../types';
import { POPULAR_GENRES } from '../utils/mediaClassifier';

interface FilterBarProps {
  categories: MediaCategory[];
  filters: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  totalCount: number;
  shownCount: number;
  activeTab: 'all' | 'movies' | 'series' | 'favorites';
  availableYears?: { year: string; count: number }[];
  onSelectMediaType?: (type: 'all' | 'movies' | 'series') => void;
  moviesCount?: number;
  seriesCount?: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  filters,
  onFilterChange,
  totalCount,
  shownCount,
  activeTab,
  availableYears = [],
  onSelectMediaType,
  moviesCount,
  seriesCount,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Ratings preset list
  const ratings = [
    { label: 'Todas las calificaciones', value: 'all' },
    { label: '★ 8.0 o más (Excelente)', value: '8' },
    { label: '★ 7.0 o más (Muy buena)', value: '7' },
    { label: '★ 6.0 o más (Buena)', value: '6' },
  ];

  // Check if any filter is active
  const isFilterActive =
    filters.genre !== 'all' ||
    filters.year !== 'all' ||
    filters.rating !== 'all' ||
    (filters.sortBy !== 'recent' && filters.sortBy !== 'year-desc') ||
    filters.categoryId !== 'all';

  return (
    <div className="space-y-3">
      {/* Media Type Switcher: Películas y Series (Todo) | Películas | Series */}
      {activeTab !== 'favorites' && onSelectMediaType && (
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#090f1d] border border-cyan-950/70 text-xs">
          <button
            id="tab-media-all"
            type="button"
            onClick={() => onSelectMediaType('all')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-bold transition active:scale-95 ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold shadow-md shadow-cyan-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todo</span>
            {typeof moviesCount === 'number' && typeof seriesCount === 'number' && (
              <span className="text-[10px] opacity-75 font-mono">
                ({moviesCount + seriesCount})
              </span>
            )}
          </button>

          <button
            id="tab-media-movies"
            type="button"
            onClick={() => onSelectMediaType('movies')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-bold transition active:scale-95 ${
              activeTab === 'movies'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold shadow-md shadow-cyan-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Películas</span>
            {typeof moviesCount === 'number' && (
              <span className="text-[10px] opacity-75 font-mono">({moviesCount})</span>
            )}
          </button>

          <button
            id="tab-media-series"
            type="button"
            onClick={() => onSelectMediaType('series')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-bold transition active:scale-95 ${
              activeTab === 'series'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-extrabold shadow-md shadow-purple-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Series</span>
            {typeof seriesCount === 'number' && (
              <span className="text-[10px] opacity-75 font-mono">({seriesCount})</span>
            )}
          </button>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="quick-search-input"
            type="text"
            value={filters.query}
            onChange={(e) => onFilterChange({ query: e.target.value })}
            placeholder={
              activeTab === 'series'
                ? 'Buscar series por título, año (ej: 2024), terror, suspenso...'
                : activeTab === 'movies'
                ? 'Buscar películas por título, año (ej: 2024), terror, suspenso...'
                : 'Buscar películas y series por título, año, terror, suspenso...'
            }
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0d1424] border border-cyan-950/80 focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-gray-500 outline-none transition shadow-inner"
          />
          {filters.query && (
            <button
              onClick={() => onFilterChange({ query: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          id="toggle-filters-btn"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`ml-2 p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition active:scale-95 ${
            showAdvancedFilters || isFilterActive
              ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/30'
              : 'bg-[#0d1424] border-cyan-950/80 text-gray-400 hover:text-gray-200'
          }`}
          title="Filtros avanzados de año, género y orden"
        >
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Filtros</span>
          {isFilterActive && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Genre Chips (Quick access for Terror, Suspenso, Acción, etc.) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1 text-[11px] text-gray-400 font-medium">
          <span className="flex items-center gap-1.5 text-cyan-400/90 font-semibold uppercase tracking-wider text-[10px]">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Géneros y Temáticas:
          </span>
          {filters.genre !== 'all' && (
            <button
              onClick={() => onFilterChange({ genre: 'all' })}
              className="text-[10px] text-cyan-400 hover:text-cyan-200 underline"
            >
              Ver todos
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
          {POPULAR_GENRES.map((g) => {
            const isSelected = filters.genre === g.id || (!filters.genre && g.id === 'all');
            return (
              <button
                key={g.id}
                onClick={() => onFilterChange({ genre: g.id })}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition active:scale-95 whitespace-nowrap ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold shadow-md shadow-cyan-500/30 ring-1 ring-white/20'
                    : g.id === 'terror' || g.id === 'suspenso'
                    ? 'bg-[#121c33] hover:bg-[#1a284a] text-cyan-200 border border-cyan-700/50'
                    : 'bg-[#0e1628] hover:bg-[#152038] text-gray-300 border border-cyan-950/60'
                }`}
              >
                <span>{g.emoji}</span>
                <span>{g.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories Horizontal Scroll Chips */}
      {categories.length > 1 && (
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between px-1 text-[11px] text-gray-400 font-medium">
            <span className="flex items-center gap-1.5 text-gray-400 uppercase tracking-wider text-[10px]">
              {activeTab === 'all' ? (
                <Layers className="w-3 h-3 text-cyan-400" />
              ) : activeTab === 'series' ? (
                <Tv className="w-3 h-3 text-purple-400" />
              ) : (
                <Film className="w-3 h-3 text-gray-500" />
              )}
              {activeTab === 'all'
                ? 'Categorías (Películas y Series):'
                : activeTab === 'series'
                ? 'Categorías de Series:'
                : 'Categorías de Películas:'}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
            {categories.map((cat) => {
              const isSelected =
                filters.categoryId === cat.category_id ||
                (!filters.categoryId && cat.category_id === 'all');

              return (
                <button
                  key={cat.category_id}
                  onClick={() => onFilterChange({ categoryId: cat.category_id })}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition active:scale-95 whitespace-nowrap ${
                    isSelected
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-400 font-bold shadow-sm'
                      : 'bg-[#0a0f1d] hover:bg-[#11192e] text-gray-400 border border-gray-800/80'
                  }`}
                >
                  {cat.category_name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Advanced Filters Expandable Drawer */}
      {showAdvancedFilters && (
        <div className="p-4 rounded-2xl bg-[#0a101f] border border-cyan-950/80 space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Year Filter */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Año de Estreno:
              </label>
              <select
                id="filter-year-select"
                value={filters.year}
                onChange={(e) => onFilterChange({ year: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#060a14] border border-gray-800 text-xs text-white focus:border-cyan-400 outline-none"
              >
                <option value="all">Todos los años</option>
                <optgroup label="Rangos de época">
                  <option value="2020s">Década 2020s (2020 - Actual)</option>
                  <option value="2010s">Década 2010s (2010 - 2019)</option>
                  <option value="2000s">Década 2000s (2000 - 2009)</option>
                  <option value="clasicos">Clásicos (Antes del 2000)</option>
                </optgroup>
                <optgroup label="Años específicos detectados">
                  {availableYears.length > 0 ? (
                    availableYears.map((y) => (
                      <option key={y.year} value={y.year}>
                        {y.year} ({y.count} {y.count === 1 ? 'título' : 'títulos'})
                      </option>
                    ))
                  ) : (
                    ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2015', '2010'].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))
                  )}
                </optgroup>
              </select>
            </div>

            {/* Sort Order (By Year, Rating, Alphabetical) */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5 mb-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
                Ordenar Por:
              </label>
              <select
                id="filter-sort-select"
                value={filters.sortBy}
                onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-[#060a14] border border-gray-800 text-xs text-white focus:border-cyan-400 outline-none"
              >
                <option value="recent">📅 Año: Más recientes primero (2025 → 2020)</option>
                <option value="year-asc">⏳ Año: Más antiguas primero (Clásicos)</option>
                <option value="rating">★ Mayor calificación (Top IMDb)</option>
                <option value="az">🔤 Alfabético A - Z</option>
                <option value="za">🔤 Alfabético Z - A</option>
              </select>
            </div>

            {/* Genre Filter */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Género / Temática:
              </label>
              <select
                id="filter-genre-select"
                value={filters.genre}
                onChange={(e) => onFilterChange({ genre: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#060a14] border border-gray-800 text-xs text-white focus:border-cyan-400 outline-none"
              >
                {POPULAR_GENRES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.emoji} {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5 mb-1.5">
                <Star className="w-3.5 h-3.5 text-yellow-400" />
                Calificación Mínima:
              </label>
              <select
                id="filter-rating-select"
                value={filters.rating}
                onChange={(e) => onFilterChange({ rating: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#060a14] border border-gray-800 text-xs text-white focus:border-cyan-400 outline-none"
              >
                {ratings.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Filters button */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-800/80">
            <span className="text-[11px] text-gray-400">
              Ordenando automáticamente por año y relevancia detectada.
            </span>
            <button
              onClick={() =>
                onFilterChange({
                  categoryId: 'all',
                  genre: 'all',
                  year: 'all',
                  rating: 'all',
                  sortBy: 'recent',
                  query: '',
                })
              }
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition"
            >
              Restablecer todos los filtros
            </button>
          </div>
        </div>
      )}

      {/* Batch Counter & Batch Indicator */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            Mostrando <strong className="text-cyan-300">{shownCount}</strong> de{' '}
            <strong className="text-white">{totalCount}</strong> títulos
            {activeTab === 'all' && typeof moviesCount === 'number' && typeof seriesCount === 'number' && (
              <span className="hidden sm:inline text-gray-400 text-[11px] ml-1 font-mono">
                ({moviesCount} películas, {seriesCount} series)
              </span>
            )}
          </span>
          {filters.genre !== 'all' && (
            <span className="ml-1 text-[11px] text-cyan-400 font-medium">
              ({POPULAR_GENRES.find((g) => g.id === filters.genre)?.name})
            </span>
          )}
          {filters.year !== 'all' && (
            <span className="ml-1 text-[11px] text-amber-400 font-medium">
              [Año: {filters.year}]
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-bold">
          Carga: 60 en 60
        </span>
      </div>
    </div>
  );
};
