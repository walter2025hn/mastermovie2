import React from 'react';
import { UserX, ShieldBan, LogOut } from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';

interface BlockedUserScreenProps {
  username: string;
  reason?: string;
  onLogout: () => void;
}

export const BlockedUserScreen: React.FC<BlockedUserScreenProps> = ({
  username,
  reason,
  onLogout,
}) => {
  const handleExit = () => {
    try {
      CapacitorApp.exitApp();
    } catch (_e) {
      window.close();
    }
  };

  return (
    <div
      id="blocked-user-screen"
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950 text-white select-none animate-fadeIn"
    >
      <div className="w-full max-w-md bg-zinc-900/90 border border-red-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-red-950/50 relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400 mb-5 shadow-lg shadow-red-500/10">
          <UserX className="w-10 h-10" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 mb-3">
          <ShieldBan className="w-3.5 h-3.5" />
          Cuenta Suspendida
        </span>

        <h1 className="text-xl font-bold text-white mb-1">
          Acceso Denegado
        </h1>
        <p className="text-xs text-zinc-400 mb-5">
          Usuario: <span className="font-mono text-white font-semibold">{username}</span>
        </p>

        <div className="p-4 rounded-xl bg-zinc-950/80 border border-red-500/20 text-left text-xs text-zinc-300 mb-6 leading-relaxed">
          <div className="font-semibold text-red-400 mb-1">Motivo del bloqueo:</div>
          <p className="text-zinc-300">
            {reason || 'Esta cuenta ha sido bloqueada por la administración de Master Movie.'}
          </p>
        </div>

        <div className="space-y-3">
          <button
            id="blocked-logout-btn"
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs tracking-wide transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión / Cambiar Usuario
          </button>

          <button
            id="blocked-exit-btn"
            onClick={handleExit}
            className="w-full py-2.5 px-4 text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            Salir de la Aplicación
          </button>
        </div>
      </div>
    </div>
  );
};
