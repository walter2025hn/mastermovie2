import React from 'react';
import { Smartphone, LogOut, Sparkles, Heart, Calendar } from 'lucide-react';
import { DevicePerformanceMode } from '../types';

interface HeaderProps {
  deviceMode: DevicePerformanceMode;
  onOpenDeviceSelector: () => void;
  onOpenSupportModal?: () => void;
  onLogout: () => void;
  username?: string;
  isDemo?: boolean;
  expirationFormatted?: string;
  expirationFull?: string;
}

export const Header: React.FC<HeaderProps> = ({
  deviceMode,
  onOpenDeviceSelector,
  onOpenSupportModal,
  onLogout,
  username,
  isDemo,
  expirationFormatted,
  expirationFull,
}) => {
  const getModeBadge = () => {
    switch (deviceMode) {
      case 'bajo':
        return {
          label: 'Bajo',
          bg: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
      case 'medio':
        return {
          label: 'Medio',
          bg: 'bg-amber-950/80 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
        };
      case 'alto':
      default:
        return {
          label: 'Alto',
          bg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20',
          dot: 'bg-cyan-400 animate-pulse',
        };
    }
  };

  const badge = getModeBadge();

  return (
    <header className="sticky top-0 z-40 bg-[#070c18]/95 backdrop-blur-md border-b border-cyan-950/40 px-3.5 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-cyan-500/20 border border-cyan-400/30 bg-black flex-shrink-0">
            <img
              src="/logo.png"
              alt="Master Movie Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-base bg-gradient-to-r from-white via-gray-200 to-cyan-300 bg-clip-text text-transparent">
                MASTER MOVIE
              </span>
              {isDemo && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                  Demo
                </span>
              )}
            </div>
            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-mono tracking-tight -mt-0.5">
              <span className="text-cyan-400/90 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>{username ? `Usuario: ${username}` : 'Ultra HD • En línea'}</span>
              </span>
              {expirationFormatted && (
                <span
                  id="user-expiration-badge"
                  className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 font-sans font-semibold tracking-normal shadow-xs"
                  title={`Fecha de expiración de cuenta: ${expirationFull || expirationFormatted}`}
                >
                  <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>Vence: <strong className="text-white font-bold">{expirationFormatted}</strong></span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Device Capability Selector Button */}
          <button
            id="device-mode-toggle-btn"
            onClick={onOpenDeviceSelector}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition active:scale-95 ${badge.bg}`}
            title="Cambiar capacidad del dispositivo (Bajo, Medio, Alto)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Modo:</span>
            <span className="font-semibold">{badge.label}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
          </button>

          {/* Support Creator Button */}
          {onOpenSupportModal && (
            <button
              id="support-creator-header-btn"
              onClick={onOpenSupportModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-pink-950/70 to-rose-950/70 hover:from-pink-900/80 hover:to-rose-900/80 border border-pink-500/40 text-pink-200 text-xs font-semibold transition active:scale-95 shadow-sm shadow-pink-500/20"
              title="Apoyar al creador"
            >
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-500/50" />
              <span className="hidden sm:inline">Apoyar</span>
            </button>
          )}

          {/* Logout / User Info */}
          {username && (
            <button
              id="logout-btn"
              onClick={onLogout}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/40 transition active:scale-95"
              title={`Cerrar sesión de ${username}`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
