import { useState, useEffect } from 'react';
import { DevicePerformanceMode, DeviceModeConfig } from '../types';

export const DEVICE_CONFIGS: Record<DevicePerformanceMode, DeviceModeConfig> = {
  bajo: {
    id: 'bajo',
    name: 'Modo Bajo',
    tagline: 'Gama Baja / Ahorro Máximo',
    description: 'Para celulares económicos o batería baja. Desactiva animaciones y desenfoques para fluidez total.',
    color: 'emerald',
    enableAnimations: false,
    enableBlur: false,
    imageQuality: 'low',
    bufferSize: 8,
  },
  medio: {
    id: 'medio',
    name: 'Modo Medio',
    tagline: 'Gama Media / Equilibrado',
    description: 'Rendimiento equilibrado con animaciones suaves y consumo controlado de memoria.',
    color: 'amber',
    enableAnimations: true,
    enableBlur: false,
    imageQuality: 'medium',
    bufferSize: 15,
  },
  alto: {
    id: 'alto',
    name: 'Modo Alto',
    tagline: 'Gama Alta / Máxima Calidad',
    description: 'Efectos cinematográficos completos, glassmorphism, reflejos neón y búfer extendido.',
    color: 'cyan',
    enableAnimations: true,
    enableBlur: true,
    imageQuality: 'high',
    bufferSize: 30,
  },
};

const STORAGE_KEY = 'master_movie_device_mode';

export function useDeviceMode() {
  const [mode, setModeState] = useState<DevicePerformanceMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as DevicePerformanceMode;
      if (saved && (saved === 'bajo' || saved === 'medio' || saved === 'alto')) {
        return saved;
      }
    } catch (_e) {}
    // Default to 'medio'
    return 'medio';
  });

  const setMode = (newMode: DevicePerformanceMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch (_e) {}
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-device-mode', mode);

    if (mode === 'bajo') {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [mode]);

  return {
    mode,
    setMode,
    config: DEVICE_CONFIGS[mode],
    allConfigs: DEVICE_CONFIGS,
  };
}
