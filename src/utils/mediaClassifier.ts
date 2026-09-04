import { MovieStream, SeriesStream } from '../types';

export interface GenreDefinition {
  id: string;
  name: string;
  emoji: string;
  keywords: string[];
}

export const POPULAR_GENRES: GenreDefinition[] = [
  {
    id: 'all',
    name: 'Todos los géneros',
    emoji: '🎬',
    keywords: [],
  },
  {
    id: 'terror',
    name: 'Terror / Horror',
    emoji: '👻',
    keywords: [
      'terror', 'horror', 'miedo', 'paranormal', 'gore', 'slasher', 'screamer',
      'demonio', 'demon', 'fantasmas', 'ghost', 'espíritu', 'espiritu', 'pesadilla',
      'nightmare', 'haunting', 'zombie', 'walking dead', 'the walking dead', 'bruja', 'witch',
      'evil', 'conjuring', 'saw', 'exorcist', 'exorcismo', 'siniestro', 'siniestra',
      'maldicion', 'maldición', 'creepy', 'posesion', 'posesión', 'dracula', 'vampiro',
      'vampiros', 'poltergeist', 'annabelle', 'nun', 'monja', 'it', 'pennywise', 'chucky',
      'freddy', 'jason', 'insidious', 'ouija', 'stranger things', 'from', 'hill house',
      'bly manor', 'midnight mass', 'curiosidades', 'american horror', 'penny dreadful',
      'bates motel', 'hannibal', 'the last of us', 'supernatural', 'sobrenatural',
      'apocalipsis zombie', 'infectados', 'demoniaco', 'demoníaco', 'ocultismo', 'monstruo',
      'monstruos', 'guillermo del toro', 'alien', 'hellbound', 'them', 'archive 81'
    ],
  },
  {
    id: 'suspenso',
    name: 'Suspenso / Thriller',
    emoji: '🔍',
    keywords: [
      'suspenso', 'suspense', 'thriller', 'misterio', 'mystery', 'psicologico', 'psicológico',
      'psychological', 'crimen', 'crime', 'intriga', 'detective', 'policial', 'policia',
      'policía', 'secuestro', 'kidnap', 'asesino', 'serial killer', 'investigacion',
      'investigación', 'tension', 'tensión', 'conspiracion', 'conspiración', 'chantaje',
      'espia', 'espía', 'espionaje', 'desaparicion', 'desaparición', 'venganza', 'persecucion',
      'persecución', 'secreto', 'oscuro', 'escape', 'severance', 'separacion', 'separación',
      'true detective', 'pinguino', 'pingüino', 'penguin', 'mindhunter', 'fargo', 'silo',
      'baby reindeer', 'bebe reno', 'ripley', 'presumed innocent', 'presunto inocente',
      'slow horses', 'mare of easttown', 'yellowjackets', 'black mirror', 'dexter',
      'breaking bad', 'better call saul', 'peaky blinders', 'ozark', 'narcos', 'dark',
      'fbi', 'cia', 'homicidio', 'asesinato', 'asesinatos', 'juicio', 'forense', 'mafia',
      'cartel', 'trampa', 'trap', 'gone girl', 'seven', 'mindhunter'
    ],
  },
  {
    id: 'accion',
    name: 'Acción / Adrenalina',
    emoji: '💥',
    keywords: [
      'accion', 'acción', 'action', 'artes marciales', 'marcial', 'combate', 'pelea',
      'disparos', 'pistolas', 'mision', 'misión', 'guerra', 'war', 'militar', 'explosivo',
      'superheroe', 'superhéroe', 'avengers', 'marvel', 'dc', 'batman', 'spider-man',
      'rapidos', 'furious', 'john wick', 'tom cruise', 'comando', 'furia', 'asalto',
      'sniper', 'the boys', 'daredevil', 'reacher', 'jack ryan', 'fallout', 'peacemaker'
    ],
  },
  {
    id: 'ciencianficcion',
    name: 'Ciencia Ficción',
    emoji: '🚀',
    keywords: [
      'ciencia ficcion', 'ciencia ficción', 'sci-fi', 'scifi', 'alien', 'extraterrestre',
      'espacial', 'space', 'futuro', 'futurista', 'cyborg', 'robot', 'inteligencia artificial',
      'multiverso', 'tiempo', 'viaje en el tiempo', 'apocalipsis', 'apocaliptico', 'distopia',
      'galaxia', 'planeta', 'star wars', 'star trek', 'matrix', 'avatar', 'dune', 'cyberpunk',
      'foundation', 'fundacion', 'fundación', '3 body problem', 'tres cuerpos', 'halo',
      'mandalorian', 'andor', 'silo'
    ],
  },
  {
    id: 'comedia',
    name: 'Comedia / Humor',
    emoji: '😂',
    keywords: [
      'comedia', 'comedy', 'humor', 'risas', 'divertida', 'parodia', 'satira', 'sátira',
      'graciosa', 'chistes', 'stand-up', 'romcom', 'comica', 'cómica', 'absurdo',
      'ted lasso', 'the bear', 'office', 'friends', 'brooklyn 99', 'modern family', 'sitcom'
    ],
  },
  {
    id: 'drama',
    name: 'Drama / Emoción',
    emoji: '🎭',
    keywords: [
      'drama', 'dramatico', 'dramático', 'melodrama', 'emocional', 'tragedia', 'conmovedora',
      'vida real', 'superacion', 'superación', 'familia', 'lagrimas', 'conflictos',
      'shogun', 'succession', 'crown', 'the crown', 'euphoria', 'telenovela', 'novela'
    ],
  },
  {
    id: 'animacion',
    name: 'Animación / Anime',
    emoji: '🍿',
    keywords: [
      'animacion', 'animación', 'animation', 'animated', 'anime', 'infantil', 'kids', 'niños',
      'disney', 'pixar', 'dreamworks', 'caricatura', 'cartoon', 'dibujos', 'familiar', 'family',
      'shrek', 'minions', 'mario', 'sonic', 'dragon ball', 'naruto', 'one piece', 'arcane',
      'invincible', 'rick and morty', 'attack on titan', 'shingeki', 'jujutsu', 'kimetsu'
    ],
  },
  {
    id: 'aventura',
    name: 'Aventura / Épica',
    emoji: '🗺️',
    keywords: [
      'aventura', 'adventure', 'expedicion', 'expedición', 'selva', 'tesoro', 'viaje',
      'supervivencia', 'survival', 'isla', 'montaña', 'explorador', 'safari', 'indiana jones',
      'jurassic', 'pirata', 'gladiador', 'epica', 'épica', 'one piece'
    ],
  },
  {
    id: 'romance',
    name: 'Romance / Amor',
    emoji: '💖',
    keywords: [
      'romance', 'romantica', 'romántica', 'romantico', 'romántico', 'amor', 'love', 'pareja',
      'boda', 'novios', 'enamorados', 'pasion', 'pasión', 'corazon', 'corazón', 'bridgerton'
    ],
  },
  {
    id: 'fantasia',
    name: 'Fantasía / Magia',
    emoji: '🧙',
    keywords: [
      'fantasia', 'fantasía', 'fantasy', 'magia', 'magic', 'hechicero', 'mago', 'brujeria',
      'dragon', 'dragones', 'medieval', 'reino', 'espadas', 'lotr', 'señor de los anillos',
      'harry potter', 'mitologia', 'mitología', 'hadas', 'elfos', 'house of the dragon',
      'casa del dragon', 'casa del dragón', 'game of thrones', 'juego de tronos',
      'rings of power', 'anillos de poder', 'witcher', 'shadow and bone'
    ],
  },
  {
    id: 'crimen',
    name: 'Crimen / Policial',
    emoji: '🕵️',
    keywords: [
      'crimen', 'crime', 'mafia', 'narco', 'narcotrafico', 'cartel', 'robo', 'atraco',
      'heist', 'gangster', 'policia', 'policía', 'corrupcion', 'corrupción', 'drogas',
      'peaky blinders', 'sopranos', 'godfather', 'el padrino', 'scarface', 'narcos'
    ],
  },
  {
    id: 'documental',
    name: 'Documental / Real',
    emoji: '📜',
    keywords: [
      'documental', 'documentary', 'biografia', 'biografía', 'historia real', 'true story',
      'naturaleza', 'planeta tierra', 'investigativo', 'docuserie'
    ],
  },
];

/**
 * Normalizes text removing accents and special symbols for reliable matching
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Accurately extracts the 4-digit release year from a movie or series item.
 * Searches in:
 * 1. item.year
 * 2. item.release_date / item.releaseDate
 * 3. title / name using multiple regex passes (parentheses, brackets, series season prefixes or standalone 19xx/20xx)
 * 4. categoryName (e.g. "SERIES 2024", "ESTRENOS 2023")
 * 5. item.last_modified (if ISO date string or unix timestamp)
 * 6. item.plot
 */
export function extractMediaYear(
  item: MovieStream | SeriesStream,
  categoryName?: string
): number | null {
  const currentYear = new Date().getFullYear() + 2; // Allow upcoming announcements up to 2028

  // 1. Check explicit year field
  if ('year' in item && item.year) {
    const parsed = parseInt(String(item.year).trim(), 10);
    if (!isNaN(parsed) && parsed >= 1900 && parsed <= currentYear) {
      return parsed;
    }
  }

  // 2. Check release_date or releaseDate (Very common in Xtream Series: e.g. "2024-03-01" or "2023")
  const relDate =
    ('release_date' in item && item.release_date) ||
    ('releaseDate' in item && item.releaseDate);

  if (relDate) {
    const match = String(relDate).match(/\b(19\d{2}|20\d{2})\b/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (parsed >= 1900 && parsed <= currentYear) {
        return parsed;
      }
    }
  }

  // 3. Check title / name (Series format: "True Detective (2024)", "Stranger Things [2016]", "Silo 2023 S01")
  const title = item.name || ('title' in item ? (item as any).title : '');
  if (title) {
    // Priority A: Inside parentheses or brackets e.g. (2024) or [2023]
    const bracketMatch = title.match(/[(\[]\s*(19\d{2}|20\d{2})\s*[)\]]/);
    if (bracketMatch) {
      const parsed = parseInt(bracketMatch[1], 10);
      if (parsed >= 1900 && parsed <= currentYear) {
        return parsed;
      }
    }

    // Priority B: Separated by dash, slash, dot or space
    const boundaryMatches = Array.from(
      title.matchAll(/(?:^|[\s\-_./|])(19\d{2}|20\d{2})(?:$|[\s\-_./|])/g)
    );
    if (boundaryMatches.length > 0) {
      // Find valid release year, avoiding common video resolution numbers like 1080 or 2160
      for (let i = boundaryMatches.length - 1; i >= 0; i--) {
        const parsed = parseInt(boundaryMatches[i][1], 10);
        if (parsed !== 1080 && parsed !== 2160 && parsed >= 1900 && parsed <= currentYear) {
          return parsed;
        }
      }
    }
  }

  // 4. Check categoryName if provided (e.g. "SERIES 2024", "SERIES ESTRENOS 2023", "RETRO 80s")
  if (categoryName) {
    const catMatch = categoryName.match(/\b(19\d{2}|20\d{2})\b/);
    if (catMatch) {
      const parsed = parseInt(catMatch[1], 10);
      if (parsed >= 1950 && parsed <= currentYear) {
        return parsed;
      }
    }
  }

  // 5. Check last_modified if available (sometimes format is '2024-02-15 14:00:00' or Unix timestamp)
  if ('last_modified' in item && item.last_modified) {
    const lmStr = String(item.last_modified);
    const dateMatch = lmStr.match(/\b(20\d{2})\b/);
    if (dateMatch) {
      const parsed = parseInt(dateMatch[1], 10);
      if (parsed >= 2000 && parsed <= currentYear) {
        return parsed;
      }
    }
  }

  // 6. Fallback check in plot if present
  if (item.plot) {
    const plotMatch = item.plot.match(
      /(?:serie|estreno|estrenada|lanzada|del|ano|año|temporada)\s*(?:en|de)?\s*(19\d{2}|20\d{2})\b/i
    );
    if (plotMatch) {
      const parsed = parseInt(plotMatch[1], 10);
      if (parsed >= 1900 && parsed <= currentYear) {
        return parsed;
      }
    }
  }

  return null;
}

/**
 * Cleans noisy IPTV suffixes from media titles for cleaner display and sorting
 * e.g. "Stranger Things (2016) [Dual Latino] 1080p S01" -> "Stranger Things"
 */
export function cleanMediaTitle(name: string): string {
  if (!name) return '';
  return name
    .replace(/[(\[]\s*(19\d{2}|20\d{2})\s*[)\]]/g, '')
    .replace(/[(\[](?:latino|subtitulado|sub|dual|castellano|hd|fhd|4k|1080p|720p|hevc|x265|x264)[^)\]]*[)\]]/gi, '')
    .replace(/\b(?:1080p|720p|4k|fhd|uhd|hevc|x265|x264|latino|dual|s\d+|t\d+|temp\s*\d+|temporada\s*\d+)\b/gi, '')
    .replace(/[-_|/]\s*$/g, '')
    .trim();
}

/**
 * Detects if a media item (movie or series) matches a given genre category
 */
export function matchesGenre(
  item: MovieStream | SeriesStream,
  genreId: string,
  categoryName?: string
): boolean {
  if (!genreId || genreId === 'all') return true;

  const genreDef = POPULAR_GENRES.find((g) => g.id === genreId);
  if (!genreDef) return true;

  // Build searchable text corpus combining title, item genre, category name and synopsis/plot
  const corpus = normalizeText(
    `${item.name || ''} ${item.genre || ''} ${categoryName || ''} ${item.plot || ''}`
  );

  return genreDef.keywords.some((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    return corpus.includes(normalizedKeyword);
  });
}

/**
 * Returns all detected genres for a media item (movie or series)
 */
export function getDetectedGenres(
  item: MovieStream | SeriesStream,
  categoryName?: string
): GenreDefinition[] {
  const corpus = normalizeText(
    `${item.name || ''} ${item.genre || ''} ${categoryName || ''} ${item.plot || ''}`
  );

  return POPULAR_GENRES.filter((g) => {
    if (g.id === 'all') return false;
    return g.keywords.some((keyword) => corpus.includes(normalizeText(keyword)));
  });
}

/**
 * Accurately determines if an item is a Movie or a Series.
 * Inspects:
 * 1. Explicit properties (series_id vs stream_id)
 * 2. Series indicator patterns in title (S01, T1, Temporada, Season, Cap, Episode)
 * 3. Fallback defaults
 */
export function detectMediaType(item: MovieStream | SeriesStream): 'movie' | 'series' {
  if ('series_id' in item && item.series_id !== undefined && item.series_id !== null) {
    return 'series';
  }
  if ('stream_id' in item && !('series_id' in item)) {
    return 'movie';
  }

  const name = item.name || '';
  if (/\b(?:s\d{1,2}|t\d{1,2}|temporada\s*\d+|season\s*\d+|cap\s*\d+|episodio\s*\d+)\b/i.test(name)) {
    return 'series';
  }

  return 'movie';
}

/**
 * Checks whether a user search query specifically specifies "series" or "peliculas".
 * Allows searches like:
 * - "series" -> all series
 * - "peliculas" -> all movies
 * - "series de terror" -> series with terror
 * - "peliculas de suspenso" -> movies with suspenso
 * - "series 2024" -> series of year 2024
 */
export function matchMediaTypeQuery(
  itemMediaType: 'movie' | 'series',
  query: string
): { isMediaTypeSpecified: boolean; matches: boolean; cleanQuery: string } {
  const norm = normalizeText(query);
  if (!norm) {
    return { isMediaTypeSpecified: false, matches: true, cleanQuery: '' };
  }

  const seriesTriggers = ['series', 'serie', 'temporadas', 'temporada'];
  const movieTriggers = ['peliculas', 'pelicula', 'pelis', 'peli', 'movies', 'movie', 'films', 'film'];

  const hasSeriesWord = seriesTriggers.some((t) => new RegExp(`\\b${t}\\b`, 'i').test(norm));
  const hasMovieWord = movieTriggers.some((t) => new RegExp(`\\b${t}\\b`, 'i').test(norm));

  if (hasSeriesWord && !hasMovieWord) {
    let remaining = norm;
    seriesTriggers.forEach((t) => {
      remaining = remaining.replace(new RegExp(`\\b${t}\\b`, 'gi'), '');
    });
    remaining = remaining.replace(/\b(?:de|del|en|para|con)\b/gi, '').trim();
    return {
      isMediaTypeSpecified: true,
      matches: itemMediaType === 'series',
      cleanQuery: remaining,
    };
  }

  if (hasMovieWord && !hasSeriesWord) {
    let remaining = norm;
    movieTriggers.forEach((t) => {
      remaining = remaining.replace(new RegExp(`\\b${t}\\b`, 'gi'), '');
    });
    remaining = remaining.replace(/\b(?:de|del|en|para|con)\b/gi, '').trim();
    return {
      isMediaTypeSpecified: true,
      matches: itemMediaType === 'movie',
      cleanQuery: remaining,
    };
  }

  return {
    isMediaTypeSpecified: false,
    matches: true,
    cleanQuery: norm,
  };
}

