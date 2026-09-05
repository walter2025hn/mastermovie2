import { XtreamUserInfo, MediaCategory, MovieStream, SeriesStream, SeriesDetails } from '../types';
import { MOCK_CATEGORIES, MOCK_SERIES_CATEGORIES, generateMockMovies, generateMockSeries } from './mockData';

export const XTREAM_SERVER_HOST = "http://zonacero.lat:8080";

class XtreamService {
  private userCredentials: { username: string; password: string } | null = null;
  private isDemoMode = false;
  private currentUserInfo: XtreamUserInfo | null = null;

  constructor() {
    this.loadSavedCredentials();
  }

  public loadSavedCredentials(): { username: string; password: string; isDemo?: boolean; userInfo?: XtreamUserInfo } | null {
    try {
      const saved = localStorage.getItem("master_movie_auth");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.username && parsed.password) {
          this.userCredentials = parsed;
          this.isDemoMode = parsed.isDemo || false;
          this.currentUserInfo = parsed.userInfo || null;
          return parsed;
        }
      }
    } catch (_e) {}
    return null;
  }

  public saveCredentials(username: string, password: string, isDemo = false, userInfo?: XtreamUserInfo) {
    this.userCredentials = { username, password };
    this.isDemoMode = isDemo;
    if (userInfo) {
      this.currentUserInfo = userInfo;
    }
    localStorage.setItem(
      "master_movie_auth",
      JSON.stringify({ username, password, isDemo, userInfo: this.currentUserInfo })
    );
  }

  public logout() {
    this.userCredentials = null;
    this.isDemoMode = false;
    this.currentUserInfo = null;
    localStorage.removeItem("master_movie_auth");
  }

  public getCredentials() {
    return this.userCredentials;
  }

  public getUserInfo(): XtreamUserInfo | null {
    return this.currentUserInfo;
  }

  public isDemo(): boolean {
    return this.isDemoMode;
  }

  // Authenticate user with zonacero.lat:8080
  public async authenticate(username: string, password: string): Promise<{ success: boolean; user_info?: XtreamUserInfo; error?: string }> {
    if (username.trim().toLowerCase() === "demo" || username.trim().toLowerCase() === "master") {
      const demoUser: XtreamUserInfo = {
        username: "Master VIP",
        status: "Active",
        exp_date: "1798761600", // Year 2027
        max_connections: "3",
        auth: 1
      };
      this.saveCredentials(username, password, true, demoUser);
      return {
        success: true,
        user_info: demoUser
      };
    }

    try {
      const response = await fetch("/api/xtream/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return { success: false, error: errJson.error || "Cuenta Inválida" };
      }

      const data = await response.json();
      const auth = data?.user_info?.auth;
      const status = data?.user_info?.status;

      if (auth === 1 || auth === "1" || status === "Active" || status === "active") {
        this.saveCredentials(username, password, false, data.user_info);
        return {
          success: true,
          user_info: data.user_info
        };
      } else {
        return {
          success: false,
          error: "Cuenta Inválida"
        };
      }
    } catch (e: any) {
      console.error("Auth request failed:", e);
      return {
        success: false,
        error: "Cuenta Inválida"
      };
    }
  }

  // Refresh user info if credentials are saved
  public async refreshUserInfo(): Promise<XtreamUserInfo | null> {
    if (!this.userCredentials) return null;
    if (this.isDemoMode) {
      return this.currentUserInfo;
    }
    const res = await this.authenticate(this.userCredentials.username, this.userCredentials.password);
    if (res.success && res.user_info) {
      this.currentUserInfo = res.user_info;
      return res.user_info;
    }
    return this.currentUserInfo;
  }

  // Fetch Categories for VOD Movies
  public async getVodCategories(): Promise<MediaCategory[]> {
    if (this.isDemoMode || !this.userCredentials) {
      return MOCK_CATEGORIES;
    }

    try {
      const response = await fetch("/api/xtream/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: this.userCredentials.username,
          password: this.userCredentials.password,
          type: "vod"
        })
      });

      if (!response.ok) throw new Error("Failed to fetch categories");
      const categories: MediaCategory[] = await response.json();

      if (Array.isArray(categories) && categories.length > 0) {
        return [
          { category_id: "all", category_name: "Todas las Películas" },
          ...categories
        ];
      }
      return MOCK_CATEGORIES;
    } catch (_e) {
      return MOCK_CATEGORIES;
    }
  }

  // Fetch Categories for Series
  public async getSeriesCategories(): Promise<MediaCategory[]> {
    if (this.isDemoMode || !this.userCredentials) {
      return MOCK_SERIES_CATEGORIES;
    }

    try {
      const response = await fetch("/api/xtream/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: this.userCredentials.username,
          password: this.userCredentials.password,
          type: "series"
        })
      });

      if (!response.ok) throw new Error("Failed to fetch series categories");
      const categories: MediaCategory[] = await response.json();

      if (Array.isArray(categories) && categories.length > 0) {
        return [
          { category_id: "all", category_name: "Todas las Series" },
          ...categories
        ];
      }
      return MOCK_SERIES_CATEGORIES;
    } catch (_e) {
      return MOCK_SERIES_CATEGORIES;
    }
  }

  // Fetch Movies list
  public async getMovies(categoryId?: string): Promise<MovieStream[]> {
    if (this.isDemoMode || !this.userCredentials) {
      const all = generateMockMovies();
      if (!categoryId || categoryId === "all") return all;
      return all.filter(m => m.category_id === categoryId);
    }

    try {
      const response = await fetch("/api/xtream/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: this.userCredentials.username,
          password: this.userCredentials.password,
          type: "vod",
          category_id: categoryId === "all" ? undefined : categoryId
        })
      });

      if (!response.ok) throw new Error("Failed to load movies");
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return generateMockMovies();
    } catch (_e) {
      return generateMockMovies();
    }
  }

  // Fetch Series list
  public async getSeries(categoryId?: string): Promise<SeriesStream[]> {
    if (this.isDemoMode || !this.userCredentials) {
      const all = generateMockSeries();
      if (!categoryId || categoryId === "all") return all;
      return all.filter(s => s.category_id === categoryId);
    }

    try {
      const response = await fetch("/api/xtream/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: this.userCredentials.username,
          password: this.userCredentials.password,
          type: "series",
          category_id: categoryId === "all" ? undefined : categoryId
        })
      });

      if (!response.ok) throw new Error("Failed to load series");
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return generateMockSeries();
    } catch (_e) {
      return generateMockSeries();
    }
  }

  // Fetch Series Info (seasons and episodes)
  public async getSeriesInfo(seriesId: string | number): Promise<SeriesDetails> {
    if (this.isDemoMode || !this.userCredentials) {
      return {
        seasons: [
          { season_number: 1, name: "Temporada 1", episode_count: 8 },
          { season_number: 2, name: "Temporada 2", episode_count: 8 }
        ],
        info: {
          name: "Serie Master",
          cover: "",
          plot: "Episodios de alta calidad transmitidos desde zonacero.lat:8080.",
          cast: "Reparto Principal",
          director: "Director",
          genre: "Acción, Drama",
          releaseDate: "2024",
          rating: "8.5"
        },
        episodes: {
          "1": [
            { id: `${seriesId}_1_1`, episode_num: 1, title: "Capítulo 1: El Comienzo", container_extension: "mp4" },
            { id: `${seriesId}_1_2`, episode_num: 2, title: "Capítulo 2: El Ascenso", container_extension: "mp4" },
            { id: `${seriesId}_1_3`, episode_num: 3, title: "Capítulo 3: La Traición", container_extension: "mp4" },
            { id: `${seriesId}_1_4`, episode_num: 4, title: "Capítulo 4: Punto Sin Retorno", container_extension: "mp4" }
          ],
          "2": [
            { id: `${seriesId}_2_1`, episode_num: 1, title: "Capítulo 1: Un Nuevo Amanecer", container_extension: "mp4" },
            { id: `${seriesId}_2_2`, episode_num: 2, title: "Capítulo 2: Venganza", container_extension: "mp4" }
          ]
        }
      };
    }

    try {
      const response = await fetch("/api/xtream/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: this.userCredentials.username,
          password: this.userCredentials.password,
          type: "series",
          id: String(seriesId)
        })
      });

      if (!response.ok) throw new Error("Failed to load series info");
      return await response.json();
    } catch (_e) {
      return {
        seasons: [{ season_number: 1, name: "Temporada 1", episode_count: 4 }],
        info: {
          name: "Serie",
          cover: "",
          plot: "Disfruta de este contenido en Master Movie en alta definición.",
          cast: "",
          director: "",
          genre: "",
          releaseDate: "2024",
          rating: "8.0"
        },
        episodes: {
          "1": [
            { id: `${seriesId}_1`, episode_num: 1, title: "Episodio 1", container_extension: "mp4" },
            { id: `${seriesId}_2`, episode_num: 2, title: "Episodio 2", container_extension: "mp4" }
          ]
        }
      };
    }
  }

  // Get stream URL for movie or episode
  public getStreamUrl(type: 'movie' | 'series', streamId: string | number, extension = 'mp4'): string {
    const creds = this.userCredentials;
    if (this.isDemoMode || !creds) {
      // Demo streaming video (Big Buck Bunny high quality trailer for testing)
      return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    }

    // In web environment, use proxy to support Range headers, avoid CORS and mixed-content
    return `/api/stream/${type}/${streamId}/${extension}?u=${encodeURIComponent(creds.username)}&p=${encodeURIComponent(creds.password)}`;
  }

  // Direct APK stream URL for Android native player (VLC, MX Player, or ExoPlayer)
  public getDirectXtreamStreamUrl(type: 'movie' | 'series', streamId: string | number, extension = 'mp4'): string {
    const creds = this.userCredentials;
    if (!creds) return "";
    return `${XTREAM_SERVER_HOST}/${type}/${encodeURIComponent(creds.username)}/${encodeURIComponent(creds.password)}/${streamId}.${extension}`;
  }

  // Resolve safe poster URL (passes through /api/proxy-image if needed)
  public getSafePosterUrl(url?: string): string {
    if (!url) return "";
    if (url.startsWith("http://")) {
      return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }
    return url;
  }
}

export const xtreamService = new XtreamService();
