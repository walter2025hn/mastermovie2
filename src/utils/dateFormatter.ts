export interface ExpirationInfo {
  formatted: string;
  shortDate: string;
  isExpired: boolean;
  isUnlimited: boolean;
  daysRemaining?: number;
  statusLabel: string;
  badgeColor: string;
}

/**
 * Formats Xtream Codes user expiration date
 * Typically a unix timestamp in seconds (e.g. "1798761600") or milliseconds,
 * or "null", "0", "Unlimited", or standard date string.
 */
export function formatExpirationDate(expDate?: string | number | null): ExpirationInfo {
  if (
    expDate === undefined ||
    expDate === null ||
    expDate === 'null' ||
    expDate === '0' ||
    expDate === '' ||
    expDate === 'Unlimited' ||
    expDate === 'unlimited'
  ) {
    return {
      formatted: 'Ilimitada (Sin fecha de vencimiento)',
      shortDate: 'Ilimitada',
      isExpired: false,
      isUnlimited: true,
      statusLabel: 'Plan Activo Permanente',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    };
  }

  let timestamp: number;
  if (typeof expDate === 'number') {
    timestamp = expDate > 1e11 ? expDate : expDate * 1000;
  } else {
    const numericVal = Number(expDate.trim());
    if (!isNaN(numericVal) && numericVal > 0) {
      timestamp = numericVal > 1e11 ? numericVal : numericVal * 1000;
    } else {
      timestamp = Date.parse(expDate);
    }
  }

  if (isNaN(timestamp)) {
    return {
      formatted: String(expDate),
      shortDate: String(expDate),
      isExpired: false,
      isUnlimited: false,
      statusLabel: 'Cuenta Activa',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    };
  }

  const exp = new Date(timestamp);
  const now = new Date();
  const diffMs = exp.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isExpired = diffMs <= 0;

  // Spanish full date, e.g.: "1 de enero de 2027"
  const formatted = exp.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Short format, e.g.: "01/01/2027"
  const day = String(exp.getDate()).padStart(2, '0');
  const month = String(exp.getMonth() + 1).padStart(2, '0');
  const year = exp.getFullYear();
  const shortDate = `${day}/${month}/${year}`;

  let statusLabel = 'Cuenta Activa';
  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  if (isExpired) {
    statusLabel = 'Cuenta Expirada';
    badgeColor = 'bg-red-500/20 text-red-300 border-red-500/30';
  } else if (daysRemaining <= 7) {
    statusLabel = `Vence en ${daysRemaining} ${daysRemaining === 1 ? 'día' : 'días'}`;
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  } else {
    statusLabel = `Activa (${daysRemaining} días restantes)`;
    badgeColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
  }

  return {
    formatted,
    shortDate,
    isExpired,
    isUnlimited: false,
    daysRemaining,
    statusLabel,
    badgeColor,
  };
}

/**
 * Formats a duration in seconds into mm:ss or hh:mm:ss
 */
export function formatTimeSeconds(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * Formats a timestamp into relative Spanish time (e.g. "Hace 5 minutos", "Hoy a las 14:30", "Ayer a las...")
 */
export function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return 'Reciente';

  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);

  if (diffSec < 45) {
    return 'Hace unos instantes';
  }
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return `Hace ${mins} ${mins === 1 ? 'minuto' : 'minutos'}`;
  }

  const date = new Date(timestamp);
  const nowDate = new Date(now);

  const isToday =
    date.getDate() === nowDate.getDate() &&
    date.getMonth() === nowDate.getMonth() &&
    date.getFullYear() === nowDate.getFullYear();

  const timeStr = date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) {
    return `Hoy a las ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(nowDate.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Ayer a las ${timeStr}`;
  }

  return `${date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • ${timeStr}`;
}

