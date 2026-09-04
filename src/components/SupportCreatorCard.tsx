import React, { useState } from 'react';
import { Heart, ExternalLink, Copy, Check, Sparkles, Coffee } from 'lucide-react';

interface SupportCreatorCardProps {
  compact?: boolean;
}

export const SupportCreatorCard: React.FC<SupportCreatorCardProps> = ({ compact = false }) => {
  const [copied, setCopied] = useState(false);
  const paypalUrl = 'https://paypal.me/WalterAntunez2012';

  const handleCopy = () => {
    navigator.clipboard.writeText(paypalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="support-creator-section"
      className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[#0c1527] via-[#09101f] to-[#120f26] border border-cyan-500/30 shadow-lg shadow-cyan-950/40"
    >
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-pink-500/30 shrink-0">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                Apoyar al creador
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              </h3>
              <p className="text-xs text-gray-300">
                Tu donación ayuda a mantener el servicio activo, rápido y actualizado.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30 shrink-0">
            <Coffee className="w-3 h-3 text-pink-400" />
            Comunidad
          </span>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Cuenta PayPal oficial:</span>
            <span className="text-cyan-300 font-mono font-bold">@WalterAntunez2012</span>
          </div>
          <div className="text-[11px] text-gray-400 leading-relaxed">
            Puedes hacer una aportación voluntaria para seguir mejorando el reproductor, optimizar los servidores y añadir más películas y series.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          <a
            id="paypal-donate-btn"
            href={paypalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0070ba] to-[#003087] hover:from-[#0079c1] hover:to-[#00457c] text-white text-xs font-black shadow-md shadow-[#0070ba]/30 transition transform active:scale-95"
          >
            <span className="font-extrabold tracking-wide">Donar con PayPal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            id="copy-paypal-link-btn"
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold transition active:scale-95"
            title="Copiar enlace de PayPal"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-400" />
                <span>Copiar enlace</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
