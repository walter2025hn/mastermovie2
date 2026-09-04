import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  X,
  ExternalLink,
  Smartphone,
  Sun,
  Lock,
  Unlock,
  PictureInPicture2,
  Crop,
  Zap,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import Hls from 'hls.js';
import { DevicePerformanceMode } from '../types';

interface VideoPlayerProps {
  title: string;
  subtitle?: string;
  streamUrl: string;
  directXtreamUrl?: string;
  deviceMode: DevicePerformanceMode;
  initialTime?: number;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  onClose: () => void;
}

type AspectRatioMode = 'contain' | 'cover' | 'fill';

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  title,
  subtitle,
  streamUrl,
  directXtreamUrl,
  deviceMode,
  initialTime = 0,
  onProgressUpdate,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Audio Context & Gain for Super Booster (up to 200%)
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const mediaSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Initial resume seek and notification
  const initialSeekDoneRef = useRef<boolean>(false);
  const [resumeNotification, setResumeNotification] = useState<{
    time: number;
    formatted: string;
  } | null>(null);

  const lastProgressReportRef = useRef<number>(0);
  const onProgressUpdateRef = useRef(onProgressUpdate);

  useEffect(() => {
    onProgressUpdateRef.current = onProgressUpdate;
  }, [onProgressUpdate]);

  const reportProgress = useCallback((cur: number, dur: number) => {
    if (onProgressUpdateRef.current && cur >= 0) {
      onProgressUpdateRef.current(cur, dur);
    }
  }, []);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isBuffering, setIsBuffering] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Advanced features
  const [brightness, setBrightness] = useState(1); // 0.2 to 1.5
  const [aspectMode, setAspectMode] = useState<AspectRatioMode>('contain');
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [audioBoost, setAudioBoost] = useState<1 | 1.5 | 2>(1); // 100%, 150%, 200%
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // HUD Gestures Feedback
  const [hudFeedback, setHudFeedback] = useState<{
    type: 'volume' | 'brightness' | 'seek-forward' | 'seek-backward' | 'boost';
    value: string | number;
  } | null>(null);
  const hudTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Double tap tracking
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; startVal: number; side: 'left' | 'right' } | null>(null);

  const showHud = useCallback((type: 'volume' | 'brightness' | 'seek-forward' | 'seek-backward' | 'boost', value: string | number) => {
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    setHudFeedback({ type, value });
    hudTimeoutRef.current = setTimeout(() => {
      setHudFeedback(null);
    }, 1100);
  }, []);

  // Screen WakeLock to keep mobile screen awake
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && isPlaying) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          setWakeLockActive(true);
          wakeLock.addEventListener('release', () => setWakeLockActive(false));
        }
      } catch (_err) {
        setWakeLockActive(false);
      }
    };

    if (isPlaying) {
      requestWakeLock();
    } else if (wakeLock) {
      wakeLock.release().catch(() => {});
    }

    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, [isPlaying]);

  // Report progress on player unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        const cur = videoRef.current.currentTime;
        const dur = videoRef.current.duration || 0;
        if (cur > 0) {
          reportProgress(cur, dur);
        }
      }
    };
  }, [reportProgress]);

  // Seek to initialTime if resuming
  const checkAndApplyInitialSeek = useCallback(() => {
    if (initialSeekDoneRef.current || !videoRef.current) return;
    if (initialTime && initialTime > 5) {
      initialSeekDoneRef.current = true;
      try {
        videoRef.current.currentTime = initialTime;
        setCurrentTime(initialTime);
        const mins = Math.floor(initialTime / 60);
        const secs = Math.floor(initialTime % 60);
        const formatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        setResumeNotification({ time: initialTime, formatted });
        setTimeout(() => setResumeNotification(null), 5000);
      } catch (_e) {}
    }
  }, [initialTime]);

  // Audio Booster Setup (Web Audio API)
  const initAudioBooster = useCallback(() => {
    if (!videoRef.current || audioContextRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const gainNode = ctx.createGain();
      const compressor = ctx.createDynamicsCompressor();
      
      // Setup soft-knee compressor to prevent audio distortion
      compressor.threshold.setValueAtTime(-12, ctx.currentTime);
      compressor.knee.setValueAtTime(30, ctx.currentTime);
      compressor.ratio.setValueAtTime(12, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      const source = ctx.createMediaElementSource(videoRef.current);
      source.connect(gainNode);
      gainNode.connect(compressor);
      compressor.connect(ctx.destination);

      audioContextRef.current = ctx;
      gainNodeRef.current = gainNode;
      mediaSourceNodeRef.current = source;
    } catch (_e) {
      // AudioContext might already be linked or restricted by CORS
    }
  }, []);

  // Apply audio boost level
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
      gainNodeRef.current.gain.setTargetAtTime(audioBoost, audioContextRef.current.currentTime, 0.05);
    }
  }, [audioBoost]);

  const cycleAudioBoost = () => {
    initAudioBooster();
    setAudioBoost((prev) => {
      const next = prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1;
      showHud('boost', next === 1 ? '100% (Normal)' : next === 1.5 ? '150% (Reforzado)' : '200% (Super Boost)');
      return next;
    });
  };

  // Video stream initialization with auto-recovery
  const initStream = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setIsBuffering(true);
    setErrorMsg(null);

    const isHlsStream = streamUrl.includes('.m3u8');

    // Buffer configuration according to device capacity
    const bufferSeconds = deviceMode === 'alto' ? 30 : deviceMode === 'medio' ? 18 : 8;

    if (isHlsStream && Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: bufferSeconds,
        maxMaxBufferLength: bufferSeconds * 2,
        enableWorker: true,
        backBufferLength: 10,
        lowLatencyMode: false,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setErrorMsg('No se pudo reproducir este formato. Intenta con reproductor externo.');
              hls.destroy();
              break;
          }
        }
      });
    } else {
      video.src = streamUrl;
      video.load();
      video.play().catch(() => setIsPlaying(false));
    }
  }, [streamUrl, deviceMode]);

  useEffect(() => {
    initStream();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [initStream]);

  // Controls auto-hide timer
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying && showControls && !isScreenLocked) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls, isScreenLocked]);

  // Time & Buffer progress
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || duration;
      setCurrentTime(cur);

      // Throttled progress report every 3.5 seconds
      const now = Date.now();
      if (now - lastProgressReportRef.current > 3500) {
        lastProgressReportRef.current = now;
        reportProgress(cur, dur);
      }

      // Calculate buffer progress
      const b = videoRef.current.buffered;
      if (b.length > 0) {
        for (let i = b.length - 1; i >= 0; i--) {
          if (b.start(i) <= cur && cur <= b.end(i)) {
            setBufferedEnd(b.end(i));
            break;
          }
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setIsBuffering(false);
      checkAndApplyInitialSeek();
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    initAudioBooster();
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      reportProgress(videoRef.current.currentTime, videoRef.current.duration || duration);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const skipSeconds = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(
      0,
      Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds)
    );
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    showHud(seconds > 0 ? 'seek-forward' : 'seek-backward', `${seconds > 0 ? '+' : ''}${seconds}s`);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    initAudioBooster();
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    showHud('volume', !isMuted ? 'Silenciado' : `${Math.round(volume * 100)}%`);
  };

  const changeVolume = (newVol: number) => {
    if (!videoRef.current) return;
    initAudioBooster();
    const v = Math.max(0, Math.min(1, newVol));
    videoRef.current.volume = v;
    videoRef.current.muted = false;
    setVolume(v);
    setIsMuted(false);
    showHud('volume', `${Math.round(v * 100)}%`);
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const togglePictureInPicture = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (_e) {}
  };

  const cycleAspectRatio = () => {
    setAspectMode((prev) => {
      const next = prev === 'contain' ? 'cover' : prev === 'cover' ? 'fill' : 'contain';
      return next;
    });
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScreenLocked) {
        if (e.key === 'l' || e.key === 'L') setIsScreenLocked(false);
        return;
      }
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skipSeconds(10);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skipSeconds(-10);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        changeVolume(volume + 0.1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        changeVolume(volume - 0.1);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'l' || e.key === 'L') {
        setIsScreenLocked((prev) => !prev);
      } else if (e.key === 'Escape' && !isFullscreen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isFullscreen, isScreenLocked, onClose]);

  // Touch Gesture Handlers (Brightness on Left, Volume on Right, Double Tap for +/-10s)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isScreenLocked) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const isLeft = x < rect.width / 2;

    touchStartRef.current = {
      x,
      y,
      startVal: isLeft ? brightness : volume,
      side: isLeft ? 'left' : 'right',
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isScreenLocked || !touchStartRef.current) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const currentY = touch.clientY - rect.top;
    const deltaY = touchStartRef.current.y - currentY; // Up is positive

    const sensitivity = 0.005;

    if (touchStartRef.current.side === 'left') {
      // Adjust Brightness (0.2 to 1.5)
      const newBright = Math.max(0.2, Math.min(1.5, touchStartRef.current.startVal + deltaY * sensitivity));
      setBrightness(newBright);
      showHud('brightness', `${Math.round(newBright * 100)}%`);
    } else {
      // Adjust Volume (0 to 1)
      const newVol = Math.max(0, Math.min(1, touchStartRef.current.startVal + deltaY * sensitivity));
      changeVolume(newVol);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isScreenLocked) return;
    const now = Date.now();
    const touch = e.changedTouches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    touchStartRef.current = null;

    // Check for double tap
    if (lastTapRef.current && now - lastTapRef.current.time < 300) {
      const diffX = Math.abs(x - lastTapRef.current.x);
      const diffY = Math.abs(y - lastTapRef.current.y);

      if (diffX < 50 && diffY < 50) {
        // Valid double tap
        if (x < rect.width * 0.4) {
          skipSeconds(-10);
        } else if (x > rect.width * 0.6) {
          skipSeconds(10);
        } else {
          togglePlay();
        }
        lastTapRef.current = null;
        return;
      }
    }

    lastTapRef.current = { time: now, x, y };
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={() => !isScreenLocked && setShowControls(true)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        if (!isScreenLocked) {
          setShowControls((prev) => !prev);
        }
      }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden touch-none"
    >
      {/* Video Element with Dynamic Aspect Ratio & Brightness Filter */}
      <video
        ref={videoRef}
        playsInline
        webkit-playsinline="true"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          checkAndApplyInitialSeek();
        }}
        onError={() => {
          setIsBuffering(false);
          setErrorMsg('Error de reproducción en el motor de video');
        }}
        style={{
          filter: `brightness(${brightness})`,
        }}
        className={`w-full h-full transition-all duration-200 ${
          aspectMode === 'cover'
            ? 'object-cover'
            : aspectMode === 'fill'
            ? 'object-fill'
            : 'object-contain'
        }`}
      />

      {/* Resume Notification Banner with "Empezar de nuevo" button */}
      {resumeNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-auto max-w-[90vw]">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-black/90 backdrop-blur-md border border-cyan-500/50 shadow-2xl shadow-cyan-950/80">
            <RotateCw className="w-4 h-4 text-cyan-400 animate-pulse flex-shrink-0" />
            <span className="text-xs text-white font-medium whitespace-nowrap">
              Reanudando en <strong className="text-cyan-300 font-mono font-bold">{resumeNotification.formatted}</strong>
            </span>
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  setCurrentTime(0);
                  reportProgress(0, duration);
                  setResumeNotification(null);
                  showHud('seek-backward', '00:00');
                }
              }}
              className="px-2.5 py-1 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-[11px] font-bold text-cyan-200 transition active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Reiniciar
            </button>
            <button
              onClick={() => setResumeNotification(null)}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Gesture HUD Feedback */}
      {hudFeedback && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in fade-in zoom-in-90 duration-150">
          <div className="px-5 py-3.5 rounded-2xl bg-black/85 backdrop-blur-md border border-cyan-500/40 shadow-2xl flex flex-col items-center gap-1.5 min-w-[120px]">
            {hudFeedback.type === 'volume' && (
              <>
                {volume === 0 || isMuted ? (
                  <VolumeX className="w-7 h-7 text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-7 h-7 text-cyan-400" />
                ) : (
                  <Volume2 className="w-7 h-7 text-cyan-400" />
                )}
                <span className="text-xs font-bold text-white tracking-wide">
                  Volumen: {hudFeedback.value}
                </span>
              </>
            )}

            {hudFeedback.type === 'brightness' && (
              <>
                <Sun className="w-7 h-7 text-amber-400" />
                <span className="text-xs font-bold text-white tracking-wide">
                  Brillo: {hudFeedback.value}
                </span>
              </>
            )}

            {hudFeedback.type === 'seek-forward' && (
              <>
                <RotateCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-sm font-extrabold text-white">
                  {hudFeedback.value}
                </span>
              </>
            )}

            {hudFeedback.type === 'seek-backward' && (
              <>
                <RotateCcw className="w-8 h-8 text-cyan-400" />
                <span className="text-sm font-extrabold text-white">
                  {hudFeedback.value}
                </span>
              </>
            )}

            {hudFeedback.type === 'boost' && (
              <>
                <Zap className="w-7 h-7 text-yellow-400" />
                <span className="text-xs font-bold text-white tracking-wide">
                  Audio Boost: {hudFeedback.value}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/40 z-20">
          <div className="relative">
            <div className="w-14 h-14 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
            <Play className="w-5 h-5 fill-cyan-400 text-cyan-400 absolute inset-0 m-auto" />
          </div>
          <span className="mt-4 text-xs font-semibold text-cyan-300 tracking-wider">
            Iniciando motor MasterPlayer Ultra HD...
          </span>
        </div>
      )}

      {/* Error Fallback Box */}
      {errorMsg && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center z-40">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <p className="text-white font-black text-base mb-1">{errorMsg}</p>
          <p className="text-gray-400 text-xs max-w-sm mb-5">
            Puedes reintentar la conexión o utilizar una aplicación externa instalada en tu teléfono.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => initStream()}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reintentar</span>
            </button>
            {directXtreamUrl && (
              <a
                href={`intent:${directXtreamUrl}#Intent;type=video/*;end`}
                className="px-4 py-2.5 rounded-xl bg-gray-800 text-cyan-300 hover:bg-gray-700 font-bold text-xs flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir en VLC / MX Player</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 font-medium text-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Screen Locked Floating Button */}
      {isScreenLocked && (
        <div className="absolute top-6 left-6 z-50">
          <button
            onClick={() => setIsScreenLocked(false)}
            className="p-3 rounded-full bg-cyan-500/90 text-black font-extrabold shadow-2xl flex items-center gap-2 active:scale-95 transition"
            title="Toca para desbloquear pantalla"
          >
            <Lock className="w-5 h-5" />
            <span className="text-xs font-bold pr-1">Desbloquear</span>
          </button>
        </div>
      )}

      {/* Main Overlay UI Controls */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute inset-0 flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-black/85 via-transparent to-black/95 transition-opacity duration-300 z-30 ${
          showControls && !isScreenLocked
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 max-w-[70%]">
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 transition flex-shrink-0"
              title="Salir del reproductor"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-white truncate drop-shadow-md">
                {title}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                {subtitle && (
                  <span className="text-xs text-cyan-400 truncate font-medium">
                    {subtitle}
                  </span>
                )}
                <span className="hidden xs:inline-flex text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                  Master Engine v2.5
                </span>
              </div>
            </div>
          </div>

          {/* Quick Player Tool Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Booster Button (100% -> 150% -> 200%) */}
            <button
              onClick={cycleAudioBoost}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition active:scale-95 ${
                audioBoost > 1
                  ? 'bg-yellow-500 text-black border-yellow-400 shadow-md shadow-yellow-500/30'
                  : 'bg-black/60 backdrop-blur-md border-gray-800 text-gray-300 hover:text-white'
              }`}
              title="Refuerzo de audio para celulares (hasta 200%)"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{audioBoost === 1 ? '100%' : audioBoost === 1.5 ? '150%' : '200%'}</span>
            </button>

            {/* Aspect Ratio Switcher */}
            <button
              onClick={cycleAspectRatio}
              className="p-2 rounded-xl bg-black/60 backdrop-blur-md border border-gray-800 text-gray-300 hover:text-white transition"
              title={`Modo de pantalla: ${aspectMode === 'contain' ? '16:9 Original' : aspectMode === 'cover' ? 'Zoom Completo (sin bordes)' : 'Estirar'}`}
            >
              <Crop className="w-4 h-4" />
            </button>

            {/* Picture in Picture */}
            <button
              onClick={togglePictureInPicture}
              className="hidden sm:block p-2 rounded-xl bg-black/60 backdrop-blur-md border border-gray-800 text-gray-300 hover:text-white transition"
              title="Ventana flotante (PiP)"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            {/* Lock Screen Controls */}
            <button
              onClick={() => {
                setIsScreenLocked(true);
                setShowControls(false);
              }}
              className="p-2 rounded-xl bg-black/60 backdrop-blur-md border border-gray-800 text-gray-300 hover:text-cyan-300 transition"
              title="Bloquear toques en pantalla"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Direct External Player (VLC / MX Player) without leaking URL */}
            {directXtreamUrl && (
              <a
                href={`intent:${directXtreamUrl}#Intent;type=video/*;end`}
                className="hidden xs:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition"
                title="Abrir en VLC o reproductor de tu celular"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Externo</span>
              </a>
            )}
          </div>
        </div>

        {/* Center Large Transport Controls */}
        <div className="flex items-center justify-center gap-8 sm:gap-12">
          <button
            onClick={() => skipSeconds(-10)}
            className="p-3.5 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition active:scale-90"
            title="Retroceder 10s"
          >
            <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-black flex items-center justify-center shadow-2xl shadow-cyan-500/50 hover:scale-105 active:scale-95 transition"
            title={isPlaying ? 'Pausa' : 'Reproducir'}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 sm:w-9 sm:h-9 fill-black" />
            ) : (
              <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-black ml-1" />
            )}
          </button>

          <button
            onClick={() => skipSeconds(10)}
            className="p-3.5 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition active:scale-90"
            title="Adelantar 10s"
          >
            <RotateCw className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>

        {/* Bottom Timeline & Control Bar */}
        <div className="space-y-2.5">
          {/* Dual Progress Timeline (Current Playback + Buffer Range) */}
          <div className="space-y-1">
            <div className="relative flex items-center h-4 cursor-pointer">
              {/* Background track */}
              <div className="absolute inset-x-0 h-1.5 bg-gray-800/90 rounded-full overflow-hidden">
                {/* Buffered track */}
                {duration > 0 && (
                  <div
                    style={{ width: `${Math.min(100, (bufferedEnd / duration) * 100)}%` }}
                    className="h-full bg-cyan-900/60 transition-all duration-300"
                  />
                )}
              </div>

              {/* Interactive seek input */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-x-0 w-full h-4 opacity-0 cursor-pointer z-10"
              />

              {/* Active played track overlay */}
              <div
                style={{
                  width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                }}
                className="absolute left-0 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full pointer-events-none"
              >
                {/* Scrubber thumb circle */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md shadow-cyan-400/50 scale-100" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-gray-300 px-0.5">
              <span>{formatTime(currentTime)}</span>
              <div className="flex items-center gap-2 text-[11px] text-gray-400 font-sans">
                <span className="hidden sm:inline">
                  {aspectMode === 'contain' ? '16:9' : aspectMode === 'cover' ? 'Zoom Lleno' : 'Estirado'}
                </span>
                <span>•</span>
                <span className="font-mono">{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-between pt-1">
            {/* Volume and Mute */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="text-white hover:text-cyan-400 transition"
                title={isMuted ? 'Desactivar silencio' : 'Silenciar'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-16 sm:w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Playback Speeds */}
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-xl border border-gray-800 text-xs font-semibold text-gray-300">
              {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => changeSpeed(s)}
                  className={`px-1.5 py-0.5 rounded transition ${
                    playbackSpeed === s
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-white hover:text-cyan-400 transition"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
