import React from 'react';
import { AlertTriangle, LogOut, ArrowLeft, X } from 'lucide-react';

interface ExitConfirmModalProps {
  onCancel: () => void;
  onConfirmExit: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  onCancel,
  onConfirmExit,
}) => {
  return (
    <div
      id="exit-confirm-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        id="exit-confirm-dialog"
        className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#0e1628] via-[#090f1d] to-[#060913] border border-amber-500/30 p-6 sm:p-7 shadow-2xl shadow-amber-950/40 text-center space-y-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient warning glow */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close icon button */}
        <button
          id="close-exit-modal-x"
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
          aria-label="Cerrar aviso"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Badge */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-red-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
          <AlertTriangle className="w-7 h-7" />
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-black text-white tracking-wide">
            ¿Deseas salir de la app?
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed px-1">
            Has llegado al inicio del catálogo. ¿Quieres salir de{' '}
            <strong className="text-cyan-400">Master Movie</strong> o prefieres continuar viendo?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            id="stay-in-app-btn"
            type="button"
            onClick={onCancel}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs tracking-wide shadow-lg shadow-cyan-500/30 transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continuar en la app</span>
          </button>

          <button
            id="confirm-exit-app-btn"
            type="button"
            onClick={onConfirmExit}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-200 hover:text-white font-bold text-xs transition active:scale-95"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Sí, salir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
