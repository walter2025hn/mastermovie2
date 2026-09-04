import React from 'react';
import { Smartphone, Check, Zap, Battery, Sparkles, X } from 'lucide-react';
import { DevicePerformanceMode, DeviceModeConfig } from '../types';

interface DeviceModeSelectorProps {
  currentMode: DevicePerformanceMode;
  onSelectMode: (mode: DevicePerformanceMode) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const DeviceModeSelector: React.FC<DeviceModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  onClose,
  isModal = true,
}) => {
  const modes: {
    id: DevicePerformanceMode;
    name: string;
    badge: string;
    ram: string;
    icon: typeof Battery;
    desc: string;
    features: string[];
    accentColor: string;
    borderActive: string;
    bgActive: string;
  }[] = [
    {
      id: 'bajo',
      name: 'Bajo',
      badge: 'Gama Baja & Ahorro',
      ram: 'Dispositivos con 1GB - 3GB RAM',
      icon: Battery,
      desc: 'Optimizado para teléfonos con especificaciones modestas o cuando deseas ahorrar batería y datos.',
      features: [
        'Animaciones reducidas al mínimo',
        'Sin desenfoques pesados de fondo',
        'Consumo de memoria ultraligero',
        'Búfer ágil para conexiones lentas'
      ],
      accentColor: 'text-emerald-400',
      borderActive: 'border-emerald-500 shadow-emerald-500/20',
      bgActive: 'bg-emerald-950/30'
    },
    {
      id: 'medio',
      name: 'Medio',
      badge: 'Gama Media / Recomendado',
      ram: 'Dispositivos con 4GB - 6GB RAM',
      icon: Zap,
      desc: 'El balance perfecto entre fluidez visual, efectos sutiles y excelente rendimiento en la mayoría de celulares.',
      features: [
        'Transiciones suaves estándar',
        'Efectos visuales optimizados',
        'Calidad equilibrada de miniaturas',
        'Búfer de 15 segundos balanceado'
      ],
      accentColor: 'text-amber-400',
      borderActive: 'border-amber-500 shadow-amber-500/20',
      bgActive: 'bg-amber-950/30'
    },
    {
      id: 'alto',
      name: 'Alto',
      badge: 'Gama Alta / Ultra Cine',
      ram: 'Dispositivos con 8GB+ RAM',
      icon: Sparkles,
      desc: 'Experiencia cinematográfica completa diseñada para celulares potentes con pantallas AMOLED o 120Hz.',
      features: [
        'Efectos neón y brillo Master Movie',
        'Glassmorphism y desenfoques activos',
        'Animaciones dinámicas completas',
        'Búfer extendido para máxima nitidez'
      ],
      accentColor: 'text-cyan-400',
      borderActive: 'border-cyan-400 shadow-cyan-400/30 shadow-lg',
      bgActive: 'bg-cyan-950/40'
    }
  ];

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Capacidad del Dispositivo
            </h2>
            <p className="text-xs text-gray-400">
              Elige el modo según la potencia de tu celular para optimizar la app
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {modes.map((item) => {
          const isSelected = currentMode === item.id;
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              onClick={() => onSelectMode(item.id)}
              className={`relative p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? `${item.borderActive} ${item.bgActive} border-2`
                  : 'border-gray-800/80 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-900/80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg bg-black/40 border border-white/5 ${item.accentColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">
                        Modo {item.name}
                      </span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-white/10 ${
                        item.id === 'bajo' ? 'bg-emerald-500/20 text-emerald-300' :
                        item.id === 'medio' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {item.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {item.ram}
                    </span>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  isSelected
                    ? 'bg-cyan-500 border-cyan-400 text-black'
                    : 'border-gray-600 bg-gray-800/50'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <p className="mt-2 text-xs text-gray-300 leading-relaxed">
                {item.desc}
              </p>

              <div className="mt-2.5 grid grid-cols-2 gap-1 pt-2 border-t border-white/5">
                {item.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <span className={`w-1 h-1 rounded-full ${isSelected ? item.accentColor.replace('text-', 'bg-') : 'bg-gray-500'}`}></span>
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-sm tracking-wide transition shadow-lg shadow-cyan-500/25 active:scale-[0.98]"
        >
          Guardar y Continuar
        </button>
      )}
    </div>
  );

  if (!isModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0b1120] border border-cyan-950/60 rounded-2xl p-5 shadow-2xl shadow-cyan-950/50 max-h-[90vh] overflow-y-auto">
        {content}
      </div>
    </div>
  );
};
