var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var app = (0, import_express.default)();
var PORT = 3e3;
var XTREAM_BASE_URL = "http://zonacero.lat:8080";
app.use(import_express.default.json());
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", server: XTREAM_BASE_URL, app: "Master Movie" });
});
async function safeFetchJson(url, timeoutMs = 15e3) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "MasterMovie/1.0" }
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
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}
app.post("/api/xtream/auth", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Usuario y contrase\xF1a son requeridos" });
    }
    const targetUrl = `${XTREAM_BASE_URL}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    const result = await safeFetchJson(targetUrl, 12e3);
    if (result.data) {
      return res.json(result.data);
    }
    return res.status(401).json({
      error: "Cuenta Inv\xE1lida",
      user_info: { auth: 0 }
    });
  } catch (error) {
    console.error("Auth proxy error:", error?.message);
    return res.status(401).json({
      error: "Cuenta Inv\xE1lida",
      details: error?.message
    });
  }
});
app.post("/api/xtream/categories", async (req, res) => {
  try {
    const { username, password, type } = req.body;
    const action = type === "series" ? "get_series_categories" : "get_vod_categories";
    const targetUrl = `${XTREAM_BASE_URL}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=${action}`;
    const result = await safeFetchJson(targetUrl, 12e3);
    if (result.data) {
      return res.json(result.data);
    }
    return res.json([]);
  } catch (error) {
    return res.status(500).json({ error: "Error de conexi\xF3n", details: error?.message });
  }
});
app.post("/api/xtream/streams", async (req, res) => {
  try {
    const { username, password, type, category_id } = req.body;
    const action = type === "series" ? "get_series" : "get_vod_streams";
    let targetUrl = `${XTREAM_BASE_URL}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=${action}`;
    if (category_id && category_id !== "all") {
      targetUrl += `&category_id=${encodeURIComponent(category_id)}`;
    }
    const result = await safeFetchJson(targetUrl, 25e3);
    if (result.data) {
      return res.json(result.data);
    }
    return res.json([]);
  } catch (error) {
    return res.status(500).json({ error: "Error de conexi\xF3n", details: error?.message });
  }
});
app.post("/api/xtream/info", async (req, res) => {
  try {
    const { username, password, type, id } = req.body;
    const action = type === "series" ? `get_series_info&series_id=${id}` : `get_vod_info&vod_id=${id}`;
    const targetUrl = `${XTREAM_BASE_URL}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&action=${action}`;
    const result = await safeFetchJson(targetUrl, 15e3);
    if (result.data) {
      return res.json(result.data);
    }
    return res.status(404).json({ error: "Informaci\xF3n no encontrada" });
  } catch (error) {
    return res.status(500).json({ error: "Error de conexi\xF3n", details: error?.message });
  }
});
app.get("/api/proxy-image", async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).send("Missing url parameter");
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8e3);
    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0" }
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
app.get("/api/stream/:type/:streamId/:ext", async (req, res) => {
  try {
    const { type, streamId, ext } = req.params;
    const username = req.query.u;
    const password = req.query.p;
    if (!username || !password) {
      return res.status(401).send("Credenciales no proporcionadas");
    }
    const targetUrl = `${XTREAM_BASE_URL}/${type}/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${streamId}.${ext}`;
    const headers = {
      "User-Agent": "MasterMovie/1.0 (Mobile Android/iOS)"
    };
    if (req.headers.range) {
      headers["Range"] = req.headers.range;
    }
    const response = await fetch(targetUrl, {
      headers
    });
    res.status(response.status);
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (lower === "content-type" || lower === "content-length" || lower === "content-range" || lower === "accept-ranges") {
        res.setHeader(key, value);
      }
    });
    if (!res.getHeader("accept-ranges")) {
      res.setHeader("Accept-Ranges", "bytes");
    }
    if (!response.body) {
      return res.end();
    }
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
      reader.cancel().catch(() => {
      });
    });
    await pump();
  } catch (error) {
    console.error("Stream proxy error:", error?.message);
    if (!res.headersSent) {
      res.status(500).send("Error en el stream");
    }
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Master Movie server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
