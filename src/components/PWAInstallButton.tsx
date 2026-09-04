import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-2 rounded-xl">
        <Smartphone className="w-4 h-4" />
        <span>Master Movie ya está instalada en este dispositivo</span>
      </div>
    );
  }

  return (
    <div>
      {deferredPrompt ? (
        <button
          onClick={handleInstall}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/30 transition active:scale-95"
        >
          <Download className="w-4 h-4 text-black" />
          <span>Instalar Master Movie en Pantalla Principal</span>
        </button>
      ) : isIOS ? (
        <>
          <button
            onClick={() => setShowIOSGuide(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition border border-gray-700"
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Instalar en iPhone / iPad</span>
          </button>

          {showIOSGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="w-full max-w-sm bg-[#0e1628] border border-cyan-900/60 rounded-2xl p-5 text-white space-y-3 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-cyan-300">
                    Instalar en iPhone o iPad
                  </h3>
                  <button onClick={() => setShowIOSGuide(false)}>
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <p className="text-xs text-gray-300">
                  1. En Safari, toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba).<br />
                  2. Baja y pulsa <strong>"Agregar a Inicio"</strong>.<br />
                  3. ¡Listo! Master Movie se abrirá a pantalla completa.
                </p>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full py-2 rounded-xl bg-cyan-600 text-black font-bold text-xs"
                >
                  Entendido
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <button
          onClick={() => {
            alert('Para instalar, abre el menú de tu navegador (los 3 puntos) y selecciona "Agregar a la pantalla principal" o "Instalar aplicación".');
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Instalar como App en este Teléfono</span>
        </button>
      )}
    </div>
  );
};
