import React, { useState, useMemo } from 'react';
import {
  Clock,
  Play,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Film,
  Tv,
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { HistoryItem, DevicePerformanceMode } from '../types';
import { formatTimeSeconds, formatRelativeTime } from '../utils/dateFormatter';

interface HistoryViewProps {
  history: HistoryItem[];
  deviceMode: DevicePerformanceMode;
  onResume: (item: HistoryItem, resumeTime: number) => void;
  onRemoveItem: (id: string | number) => void;
  onClearHistory: () => void;
  onExploreCatalog: () => void;
}

type HistoryFilterType = 'all' | 'movies' | 'series' | 'in_progress' | 'completed';

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  deviceMode,
  onResume,
  onRemoveItem,
  onClearHistory,
  onExploreCatalog,
}) => {
  const [filterType, setFilterType] = useState<HistoryFilterType>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | number | null>(null);

  // Filtered and sorted items
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (filterType === 'movies') return item.mediaType === 'movie';
      if (filterType === 'series') return item.mediaType === 'series';
      if (filterType === 'in_progress') return !item.completed && item.progressPercentage > 0;
      if (filterType === 'completed') return item.completed || item.progressPercentage >= 95;
      return true;
    });
  }, [history, filterType]);

  const inProgressCount = useMemo(
    () => history.filter((h) => !h.completed && h.progressPercentage > 0).length,
    [history]
  );

  return (
    <div className="space-y-4 pt-1 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0a101f] border border-cyan-950/60 shadow-lg shadow-cyan-950/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <span>Historial de Reproducción</span>
              {history.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50 font-mono">
                  {history.length}
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-400">
              Ordenado cronológicamente con guardado automático para reanudar donde te quedaste
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              id="clear-history-trigger-btn"
              onClick={() => setShowClearConfirm(true)}
              className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-900/50 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Borrar historial</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal to Clear All History */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-[#0a101f] border border-red-900/60 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">¿Borrar todo el historial?</h3>
                <p className="text-xs text-gray-400">Se eliminará el progreso guardado de {history.length} títulos.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-300 hover:bg-gray-800 transition"
              >
                Cancelar
              </button>
              <button
                id="confirm-clear-history-btn"
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-extrabold text-white transition shadow-lg shadow-red-900/50"
              >
                Sí, borrar todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Chips Bar */}
      {history.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'all' as HistoryFilterType, label: 'Todos', count: history.length },
            {
              id: 'in_progress' as HistoryFilterType,
              label: 'En progreso',
              count: inProgressCount,
            },
            {
              id: 'movies' as HistoryFilterType,
              label: 'Películas',
              count: history.filter((h) => h.mediaType === 'movie').length,
            },
            {
              id: 'series' as HistoryFilterType,
              label: 'Series',
              count: history.filter((h) => h.mediaType === 'series').length,
            },
            {
              id: 'completed' as HistoryFilterType,
              label: 'Completadas',
              count: history.filter((h) => h.completed || h.progressPercentage >= 95).length,
            },
          ].map((tab) => {
            const isActive = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border whitespace-nowrap transition cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300 font-bold shadow-sm shadow-cyan-950/50'
                    : 'bg-[#080d1a] border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-cyan-800/60 text-cyan-200' : 'bg-gray-800 text-gray-400'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {history.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-2xl bg-[#0a101f]/60 border border-cyan-950/40 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center mx-auto text-cyan-400">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-extrabold text-white">
              Aún no tienes títulos en tu historial
            </h3>
            <p className="text-xs text-gray-400">
              Cada película o serie que comiences a reproducir se guardará aquí ordenadamente. Podrás continuar viéndola justo donde la dejaste en cualquier momento.
            </p>
          </div>
          <button
            id="history-explore-catalog-btn"
            onClick={onExploreCatalog}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs tracking-wide shadow-lg shadow-cyan-500/20 inline-flex items-center gap-2 active:scale-95 transition cursor-pointer"
          >
            <span>Explorar catálogo de películas y series</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="py-12 text-center rounded-2xl bg-[#0a101f]/40 border border-gray-800 space-y-2">
          <p className="text-xs text-gray-400">
            No hay títulos en el filtro "{filterType}" seleccionado.
          </p>
          <button
            onClick={() => setFilterType('all')}
            className="text-xs text-cyan-400 font-semibold hover:underline"
          >
            Ver todos los títulos del historial
          </button>
        </div>
      ) : (
        /* History Item List */
        <div className="space-y-3">
          {filteredHistory.map((item, index) => {
            const isCompleted = item.completed || item.progressPercentage >= 95;
            const hasProgress = item.currentTime > 10;

            return (
              <div
                key={`${item.mediaType}-${item.id}-${index}`}
                className="group relative p-3 sm:p-4 rounded-2xl bg-[#0a101f] border border-cyan-950/50 hover:border-cyan-500/40 transition-all duration-200 shadow-md shadow-black/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
              >
                {/* Left info: Poster + Details */}
                <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto flex-1">
                  {/* Poster Thumbnail */}
                  <div className="relative w-16 h-22 sm:w-18 sm:h-24 rounded-xl overflow-hidden bg-black/60 border border-gray-800 flex-shrink-0">
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to icon
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-600">
                      {item.mediaType === 'movie' ? (
                        <Film className="w-6 h-6 opacity-30" />
                      ) : (
                        <Tv className="w-6 h-6 opacity-30" />
                      )}
                    </div>

                    {/* Progress bar overlay at bottom of thumbnail */}
                    {item.progressPercentage > 0 && (
                      <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/80">
                        <div
                          style={{ width: `${item.progressPercentage}%` }}
                          className={`h-full ${isCompleted ? 'bg-emerald-400' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border flex items-center gap-1 ${
                          item.mediaType === 'movie'
                            ? 'bg-blue-950/80 text-blue-300 border-blue-800/40'
                            : 'bg-purple-950/80 text-purple-300 border-purple-800/40'
                        }`}
                      >
                        {item.mediaType === 'movie' ? (
                          <>
                            <Film className="w-3 h-3" />
                            <span>Película</span>
                          </>
                        ) : (
                          <>
                            <Tv className="w-3 h-3" />
                            <span>Serie</span>
                          </>
                        )}
                      </span>

                      {isCompleted ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completada</span>
                        </span>
                      ) : item.progressPercentage > 0 ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {item.progressPercentage}% visto
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-gray-800 text-gray-400">
                          Recién iniciada
                        </span>
                      )}
                    </div>

                    <h2 className="text-sm sm:text-base font-extrabold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h2>

                    {item.subtitle && (
                      <p className="text-xs text-cyan-400/90 truncate font-medium">
                        {item.subtitle}
                      </p>
                    )}

                    {/* Time Progress & Timestamp */}
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 flex-wrap">
                      {item.duration > 0 && (
                        <span className="font-mono text-gray-300">
                          {formatTimeSeconds(item.currentTime)} / {formatTimeSeconds(item.duration)}
                        </span>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3 h-3 text-cyan-500" />
                        {formatRelativeTime(item.lastWatched)}
                      </span>
                    </div>

                    {/* Visual Progress Bar on mobile */}
                    {item.progressPercentage > 0 && (
                      <div className="w-full bg-gray-800/80 h-1 rounded-full overflow-hidden mt-1">
                        <div
                          style={{ width: `${item.progressPercentage}%` }}
                          className={`h-full ${isCompleted ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Actions: Reanudar + Restart + Delete */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-800/60 sm:border-none">
                  {/* Reanudar / Reproducir Primary Button */}
                  <button
                    id={`resume-history-${item.id}`}
                    onClick={() => onResume(item, hasProgress ? item.currentTime : 0)}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-black tracking-wide flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>
                      {isCompleted
                        ? 'Ver de nuevo'
                        : hasProgress
                        ? `Reanudar (${formatTimeSeconds(item.currentTime)})`
                        : 'Reproducir'}
                    </span>
                  </button>

                  {/* Reiniciar desde el inicio */}
                  {hasProgress && !isCompleted && (
                    <button
                      onClick={() => onResume(item, 0)}
                      className="p-2 rounded-xl bg-[#080d1a] hover:bg-cyan-950/80 border border-gray-800 hover:border-cyan-800 text-gray-400 hover:text-cyan-300 text-xs font-medium transition active:scale-95 cursor-pointer"
                      title="Comenzar desde el inicio (00:00)"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  {/* Eliminar de historial */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 rounded-xl bg-[#080d1a] hover:bg-red-950/60 border border-gray-800 hover:border-red-900 text-gray-500 hover:text-red-400 transition active:scale-95 cursor-pointer"
                    title="Eliminar de mi historial"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
