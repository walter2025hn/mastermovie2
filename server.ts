import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const XTREAM_BASE_URL = "http://zonacero.lat:8080";

app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", server: XTREAM_BASE_URL, app: "Master Movie" });
});

// Helper to safely parse JSON from upstream
async function safeFetchJson(url: string, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "MasterMovie/1.0" },
    });
    clearTimeout(timeout);

    const text = await response.text();
    if (!text || text.trim() === "") {
      return { ok: response.ok, data: null, status: response.status };
    }

    try {
      const data = JSON.parse(text);
      return { ok: response.ok, data, status: response.status };
    } catch (_e) {
      return { ok: false, data: null, status: response.status, raw: text };
    }
  } catch (err: any) {
    clearTimeout(timeout);
    throw err;
  }
}

// Xtream Codes Auth Proxy
app.post("/api/xtream/auth", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Usuario y contraseña son requeridos" });
    }

    const targetUrl = `${XTREAM_BASE_URL}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const result = await safeFetchJson(targetUrl, 12000);

    if (result.data) {
      return res.json(result.data);
    }

    return res.status(401).json({
      error: "Cuenta Inválida",
      user_info: { auth: 0 },
    });
  } catch (error: any) {
    console.error("Auth proxy error:", error?.message);
    return res.status(401).json({
      error: "Cuenta Inválida",
      details: error?.message,
    });
  }
});

// Xtream Codes Categories Proxy
app.post("/api/xtream/categories", async (req, res) => {
  try {
    const { username, password, type } = req.body;
    const action = type === "series" ? "get_series_categories" : "get_vod_categories";
    const targetUrl = `${XTREAM_BASE_URL}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=${action}`;

    const result = await safeFetchJson(targetUrl, 12000);
    if (result.data) {
      return res.json(result.data);
    }
    return res.json([]);
  } catch (error: any) {
    return res.status(500).json({ error: "Error de conexión", details: error?.message });
  }
});

// Xtream Codes Streams Proxy (Movies or Series)
app.post("/api/xtream/streams", async (req, res) => {
  try {
    const { username, password, type, category_id } = req.body;
    const action = type === "series" ? "get_series" : "get_vod_streams";
    let targetUrl = `${XTREAM_BASE_URL}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=${action}`;
    if (category_id && category_id !== "all") {
      targetUrl += `&category_id=${encodeURIComponent(category_id)}`;
    }

    const result = await safeFetchJson(targetUrl, 25000);
    if (result.data) {
      return res.json(result.data);
    }
    return res.json([]);
  } catch (error: any) {
    return res.status(500).json({ error: "Error de conexión", details: error?.message });
  }
});

// Xtream Codes Info Proxy (Details for movie or series episodes)
app.post("/api/xtream/info", async (req, res) => {
  try {
    const { username, password, type, id } = req.body;
    const action = type === "series" ? `get_series_info&series_id=${id}` : `get_vod_info&vod_id=${id}`;
    const targetUrl = `${XTREAM_BASE_URL}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=${action}`;

    const result = await safeFetchJson(targetUrl, 15000);
    if (result.data) {
      return res.json(result.data);
    }
    return res.status(404).json({ error: "Información no encontrada" });
  } catch (error: any) {
    return res.status(500).json({ error: "Error de conexión", details: error?.message });
  }
});

// Image Proxy to prevent Mixed-Content (HTTPS site requesting HTTP posters) and CORS issues
app.get("/api/proxy-image", async (req, res) => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send("Missing url parameter");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(404).send("Image not found");
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");

    const arrayBuffer = await response.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (_e) {
    return res.status(404).send("Image failed to load");
  }
});

// Video Stream Proxy with HTTP Range Support for Seamless Streaming
app.get("/api/stream/:type/:streamId/:ext", async (req, res) => {
  try {
    const { type, streamId, ext } = req.params;
    const username = req.query.u as string;
    const password = req.query.p as string;

    if (!username || !password) {
      return res.status(401).send("Credenciales no proporcionadas");
    }

    const targetUrl = `${XTREAM_BASE_URL}/${type}/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${streamId}.${ext}`;

    const headers: Record<string, string> = {
      "User-Agent": "MasterMovie/1.0 (Mobile Android/iOS)",
    };

    if (req.headers.range) {
      headers["Range"] = req.headers.range;
    }

    const response = await fetch(targetUrl, {
      headers,
    });

    res.status(response.status);

    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        lower === "content-type" ||
        lower === "content-length" ||
        lower === "content-range" ||
        lower === "accept-ranges"
      ) {
        res.setHeader(key, value);
      }
    });

    if (!res.getHeader("accept-ranges")) {
      res.setHeader("Accept-Ranges", "bytes");
    }

    if (!response.body) {
      return res.end();
    }

    // Pipe response stream to express response
    const reader = response.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!res.write(value)) {
          await new Promise((resolve) => res.once("drain", resolve));
        }
      }
      res.end();
    };

    req.on("close", () => {
      reader.cancel().catch(() => {});
    });

    await pump();
  } catch (error: any) {
    console.error("Stream proxy error:", error?.message);
    if (!res.headersSent) {
      res.status(500).send("Error en el stream");
    }
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Master Movie server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
