import React, { useState } from 'react';
import { Hammer, ShieldCheck, RefreshCw, KeyRound } from 'lucide-react';

interface MaintenanceScreenProps {
  message: string;
  onOpenAdmin: () => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  message,
  onOpenAdmin,
}) => {
  const [checking, setChecking] = useState(false);

  const handleRefresh = () => {
    setChecking(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div
      id="maintenance-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-zinc-950 text-white select-none animate-fadeIn"
    >
      <div className="w-full max-w-md bg-zinc-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-amber-950/40 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-6 shadow-lg shadow-amber-500/10">
          <Hammer className="w-10 h-10 animate-pulse" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Mantenimiento de Servidores
        </span>

        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
          Master Movie en Optimización
        </h1>

        <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
          {message || 'Estamos realizando tareas de mantenimiento para ofrecerte mayor velocidad y estabilidad. Por favor, vuelve a intentar más tarde.'}
        </p>

        <div className="space-y-3">
          <button
            id="maintenance-refresh-btn"
            onClick={handleRefresh}
            disabled={checking}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold tracking-wide transition shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Comprobando estado...' : 'Reintentar Conexión'}
          </button>

          <button
            id="maintenance-admin-btn"
            onClick={onOpenAdmin}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition py-2 flex items-center justify-center gap-1 mx-auto"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Acceso Propietario / Administrador
          </button>
        </div>
      </div>
    </div>
  );
};
