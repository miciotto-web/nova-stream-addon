/**
 * Stremio Addon Server
 * Redirect Mode Engine (Bypass Cloudflare Server Blocks)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = parseInt(process.env.PORT, 10) || 7000;
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml'
};

function parseConfig(configStr) {
  if (!configStr) return {};
  try { return JSON.parse(Buffer.from(configStr, 'base64').toString('utf-8')); } catch (e) { return {}; }
}

function buildManifest(config = {}) {
  return {
    id: config.addonId || "org.stremio.google.novastream",
    version: "1.0.3",
    name: `${config.addonName || "Nova Stream Addon"} (Online)`,
    description: "Motore Reindirizzamento Diretto (Bypass Cloudflare)",
    logo: config.logoUrl || `${PUBLIC_BASE_URL}/logo.jpg`,
    resources: ["catalog", "stream"],
    types: ["movie", "series"],
    catalogs: [
      { type: "movie", id: "top_movies", name: "Top Film (Nova)" },
      { type: "series", id: "top_series", name: "Top Serie TV (Nova)" }
    ],
    idPrefixes: ["tt"]
  };
}

function getCatalogMetas(type) {
  return [
    { id: "tt1375666", type: "movie", name: "Inception", year: 2010 },
    { id: "tt0903747", type: "series", name: "Breaking Bad", year: 2008 }
  ].filter(m => m.type === type);
}

function serveStaticFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) return res.writeHead(404), res.end('Not Found');
    res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname || '/';

  if (pathname === '/health') return res.writeHead(200), res.end(JSON.stringify({ status: 'ok', v: '1.0.3' }));
  if (pathname === '/manifest.json') return res.writeHead(200), res.end(JSON.stringify(buildManifest({})));
  
  const manifestMatch = pathname.match(/^\/(.+)\/manifest\.json$/);
  if (manifestMatch) return res.writeHead(200), res.end(JSON.stringify(buildManifest(parseConfig(manifestMatch[1]))));

  const catMatch = pathname.match(/catalog\/([^\/]+)\/([^\/\.]+)\.json$/);
  if (catMatch) return res.writeHead(200), res.end(JSON.stringify({ metas: getCatalogMetas(catMatch[1]) }));

  // REDIRECT LOGIC FOR STREAMS
  const streamMatch = pathname.match(/^(?:\/([^\/]+))?\/stream\/([^\/]+)\/([^\/\.]+)\.json$/);
  if (streamMatch) {
    const config = parseConfig(streamMatch[1]);
    const type = streamMatch[2];
    const id = streamMatch[3];
    
    // Filtri Torrentio: lingua italiana prioritaria, ordinati per qualità
    const torrentioFilters = 'language=italian|sort=qualitysize';

    // Supporto per account Debrid (RealDebrid, TorBox, ecc.)
    let torrentioUrl = `https://torrentio.strem.fun/${torrentioFilters}/stream/${type}/${id}.json`;
    if (config.debridProvider && config.debridProvider !== 'none' && config.apiKey) {
       torrentioUrl = `https://torrentio.strem.fun/${torrentioFilters}|${config.debridProvider}=${config.apiKey.trim()}/stream/${type}/${id}.json`;
    }

    console.log(`[Redirect] → Torrentio (ITA filter) per: ${id}`);
    
    // HTTP 302 Redirect
    res.writeHead(302, { 'Location': torrentioUrl });
    return res.end();
  }

  if (pathname === '/' || pathname === '/configure') return serveStaticFile(res, path.join(PUBLIC_DIR, 'index.html'));
  
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  fs.stat(path.join(PUBLIC_DIR, safePath), (err, stats) => {
    if (!err && stats.isFile()) serveStaticFile(res, path.join(PUBLIC_DIR, safePath));
    else serveStaticFile(res, path.join(PUBLIC_DIR, 'index.html'));
  });
});

server.listen(PORT, () => console.log(`🚀 NOVA STREAM v1.0.3 (Redirect Mode) su porta ${PORT}`));
