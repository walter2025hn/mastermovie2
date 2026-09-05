import React from 'react';
import { Download, Sparkles, AlertCircle, X } from 'lucide-react';
import { AppRemoteConfig } from '../types';
import { CURRENT_APP_VERSION } from '../services/remoteControl';

interface ForceUpdateModalProps {
  isOpen: boolean;
  onClose?: () => void;
  config: AppRemoteConfig;
  isForced: boolean;
}

export const ForceUpdateModal: React.FC<ForceUpdateModalProps> = ({
  isOpen,
  onClose,
  config,
  isForced,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (config.updateUrl) {
      window.open(config.updateUrl, '_blank');
    }
  };

  return (
    <div
      id="update-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
    >
      <div
        id="update-modal-card"
        className="w-full max-w-md bg-zinc-950 border border-cyan-500/40 rounded-3xl p-6 sm:p-7 text-center shadow-2xl shadow-cyan-950/60 relative overflow-hidden"
      >
        {!isForced && onClose && (
          <button
            id="close-update-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-4 shadow-lg shadow-cyan-500/10">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-2">
          {isForced ? 'Actualización Obligatoria' : 'Nueva Versión Disponible'}
        </div>

        <h2 className="text-xl font-bold text-white mb-1">
          Master Movie v{config.latestVersion || '2.2.0'}
        </h2>
        <p className="text-xs text-zinc-400 mb-4">
          Tu versión actual: <span className="font-mono text-zinc-300">v{CURRENT_APP_VERSION}</span>
        </p>

        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-left text-xs text-zinc-300 mb-6 leading-relaxed">
          <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
            Novedades de esta versión:
          </div>
          <p className="text-zinc-400">
            {config.updateMessage || 'Mejoras de rendimiento, controles táctiles y compatibilidad de video.'}
          </p>
        </div>

        <div className="space-y-2.5">
          <button
            id="download-update-btn"
            onClick={handleDownload}
            className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold tracking-wide transition shadow-lg shadow-cyan-500/25 active:scale-95 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar e Instalar APK
          </button>

          {!isForced && onClose && (
            <button
              id="later-update-btn"
              onClick={onClose}
              className="w-full py-2.5 px-4 text-xs text-zinc-400 hover:text-white transition"
            >
              Recordármelo más tarde
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
