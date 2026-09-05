import React, { useState } from 'react';
import { Lock, User, AlertCircle, Loader2, Smartphone, Play, Sparkles } from 'lucide-react';
import { DevicePerformanceMode, XtreamUserInfo } from '../types';
import { xtreamService } from '../services/xtreamApi';

interface LoginModalProps {
  onLoginSuccess: (username: string, isDemo?: boolean, userInfo?: XtreamUserInfo) => void;
  deviceMode: DevicePerformanceMode;
  onSelectDeviceMode: (mode: DevicePerformanceMode) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onLoginSuccess,
  deviceMode,
  onSelectDeviceMode,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await xtreamService.authenticate(username.trim(), password.trim());
    setLoading(false);

    if (result.success) {
      onLoginSuccess(result.user_info?.username || username.trim(), false, result.user_info);
    } else {
      setError('Cuenta Inválida');
    }
  };

  const handleDemoLogin = () => {
    const demoUser: XtreamUserInfo = {
      username: 'Master VIP',
      status: 'Active',
      exp_date: '1798761600',
      max_connections: '3',
      auth: 1,
    };
    xtreamService.saveCredentials('demo', 'demo', true, demoUser);
    onLoginSuccess('Master VIP (Demo)', true, demoUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03060f]/95 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#0b1222] to-[#060913] border border-cyan-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 relative overflow-hidden my-auto">
        {/* Ambient glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="text-center relative z-10">
          <div className="relative w-20 h-20 mx-auto mb-3 rounded-2xl overflow-hidden shadow-xl shadow-cyan-500/30 border border-cyan-400/40 bg-black">
            <img
              src="/logo.png"
              alt="Master Movie Logo"
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white">
            MASTER MOVIE
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Tu portal exclusivo para Películas y Series en alta definición
          </p>
        </div>

        {/* Device Capability Selector inside Login */}
        <div className="mt-5 pt-4 border-t border-cyan-950/60">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              Rendimiento de tu Celular:
            </label>
            <span className="text-[10px] text-cyan-400 uppercase font-bold">
              Modo {deviceMode}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['bajo', 'medio', 'alto'] as DevicePerformanceMode[]).map((mode) => {
              const isSelected = deviceMode === mode;
              return (
                <button
                  type="button"
                  key={mode}
                  onClick={() => onSelectDeviceMode(mode)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold capitalize transition border text-center ${
                    isSelected
                      ? mode === 'bajo'
                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20'
                        : mode === 'medio'
                        ? 'bg-amber-950/70 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20'
                        : 'bg-cyan-950/70 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                      : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5 relative z-10">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5 animate-shake shadow-lg shadow-red-950/50">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="font-bold tracking-wide">
                {error.toLowerCase().includes('servidor') ||
                error.toLowerCase().includes('zonacero') ||
                error.toLowerCase().includes('http') ||
                error.toLowerCase().includes('red') ||
                error.toLowerCase().includes('credenciales')
                  ? 'Cuenta Inválida'
                  : error}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Usuario
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-gray-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-gray-600 outline-none transition"
                autoCapitalize="none"
                autoCorrect="off"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-gray-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-gray-600 outline-none transition"
                required
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-sm tracking-wide transition shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black text-black" />
                <span>Entrar a Master Movie</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Mode Button for Instant Testing */}
        <div className="mt-4 pt-3 border-t border-gray-800/80 text-center">
          <button
            id="login-demo-btn"
            type="button"
            onClick={handleDemoLogin}
            className="text-xs text-cyan-400/90 hover:text-cyan-300 flex items-center justify-center gap-1.5 mx-auto py-1 px-3 rounded-lg hover:bg-cyan-950/30 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>¿Sin cuenta a mano? Probar Modo Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
