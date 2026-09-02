/**
 * Stremio Addon Server
 * 
 * Parallel Real Torrent Scraper (Anti-Ban Engine v2)
 * Bypasses Cloudflare blocks on datacenter IPs by querying multiple sources simultaneously.
 */

const http = require('http');
const https = require('https');
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

const DEFAULT_TRACKERS = [
  "tracker:http://tracker.opentrackr.org:1337/announce",
  "tracker:udp://open.demonii.com:1337/announce"
];

function fetchJson(targetUrl, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const parsed = url.parse(targetUrl);
    const client = parsed.protocol === 'https:' ? https : http;

    const req = client.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      timeout: timeoutMs
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(fetchJson(res.headers.location, timeoutMs));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) return resolve(null);
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function parseConfig(configStr) {
  if (!configStr) return {};
  try { return JSON.parse(Buffer.from(configStr, 'base64').toString('utf-8')); } catch (e) { return {}; }
}

function buildManifest(config = {}) {
  return {
    id: config.addonId || "org.stremio.google.novastream",
    version: "1.0.2",
    name: `${config.addonName || "Nova Stream Addon"} 🇮🇹`,
    description: "Motore Multi-Scraper Parallelo Anti-Ban",
    logo: config.logoUrl || `${PUBLIC_BASE_URL}/logo.svg`,
    resources: ["catalog", "stream", "meta"],
    types: ["movie", "series"],
    catalogs: [
      { type: "movie", id: "top_movies", name: "Top Film Italiani (Nova)" },
      { type: "series", id: "top_series", name: "Top Serie TV (Nova)" }
    ],
    idPrefixes: ["tt"]
  };
}

function formatRealStream(rawStream, config = {}) {
  const isInstant = Boolean(rawStream.url);
  const nameHeader = `1080p P2P ${isInstant ? 'Instant' : 'Download'}`;
  const streamObj = {
    name: nameHeader,
    title: rawStream.title || 'Flusso Video',
    behaviorHints: { filename: rawStream.behaviorHints?.filename || 'video.mkv' }
  };
  if (rawStream.url) streamObj.url = rawStream.url;
  if (rawStream.infoHash) {
    streamObj.infoHash = rawStream.infoHash;
    streamObj.fileIdx = 0;
    streamObj.sources = [...DEFAULT_TRACKERS, `dht:${rawStream.infoHash}`];
  }
  return streamObj;
}

async function scrapeRealStreams(type, id, config = {}) {
  let rawStreams = [];
  const promises = [];

  // 1. Torrentio (Primary)
  let torrentioUrl = `https://torrentio.strem.fun/stream/${type}/${id}.json`;
  if (config.debridProvider && config.debridProvider !== 'none' && config.apiKey) {
    torrentioUrl = `https://torrentio.strem.fun/${config.debridProvider}=${config.apiKey.trim()}/stream/${type}/${id}.json`;
  }
  promises.push(fetchJson(torrentioUrl, 6000).then(res => {
    if (res && res.streams) return res.streams;
    return [];
  }));

  // 2. YTS (Movies only)
  if (type === 'movie' && id.startsWith('tt')) {
    promises.push(fetchJson(`https://yts.mx/api/v2/list_movies.json?query_term=${id}`, 6000).then(res => {
      const yStreams = [];
      if (res && res.data && res.data.movies && res.data.movies[0]) {
        res.data.movies[0].torrents.forEach(t => {
          yStreams.push({
            name: `YTS\n${t.quality}`,
            title: `🗳️\n${res.data.movies[0].title_long} [${t.quality}]\n💾 ${t.size}\n🔗 💾 YTS 👥 ${t.seeds} seeds`,
            infoHash: t.hash_lower || t.hash,
            behaviorHints: { filename: `${res.data.movies[0].title_long}.mp4` }
          });
        });
      }
      return yStreams;
    }));
  }

  // 3. EZTV (Series only)
  if (type === 'series' && id.startsWith('tt')) {
    const cleanId = id.split(':')[0].replace('tt', '');
    const s = parseInt(id.split(':')[1]);
    const e = parseInt(id.split(':')[2]);
    promises.push(fetchJson(`https://eztvx.to/api/get-torrents?imdb_id=${cleanId}`, 6000).then(res => {
      const eStreams = [];
      if (res && res.torrents) {
        res.torrents.filter(t => parseInt(t.season) === s && parseInt(t.episode) === e).forEach(t => {
          eStreams.push({
            name: `EZTV\nHD`,
            title: `🗳️\n${t.title}\n💾 ${(t.size_bytes / 1024 / 1024).toFixed(2)} MB\n🔗 💾 EZTV 👥 ${t.seeds} seeds`,
            infoHash: t.hash,
            behaviorHints: { filename: t.filename }
          });
        });
      }
      return eStreams;
    }));
  }

  // Execute in parallel
  const results = await Promise.allSettled(promises);
  results.forEach(r => {
    if (r.status === 'fulfilled' && r.value.length > 0) {
      rawStreams = rawStreams.concat(r.value);
    }
  });

  return rawStreams.map(raw => formatRealStream(raw, config));
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

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const pathname = url.parse(req.url).pathname || '/';

  if (pathname === '/health') return res.writeHead(200), res.end(JSON.stringify({ status: 'ok', v: '1.0.2' }));
  if (pathname === '/manifest.json') return res.writeHead(200), res.end(JSON.stringify(buildManifest({})));
  
  const manifestMatch = pathname.match(/^\/(.+)\/manifest\.json$/);
  if (manifestMatch) return res.writeHead(200), res.end(JSON.stringify(buildManifest(parseConfig(manifestMatch[1]))));

  const catMatch = pathname.match(/catalog\/([^\/]+)\/([^\/\.]+)\.json$/);
  if (catMatch) return res.writeHead(200), res.end(JSON.stringify({ metas: getCatalogMetas(catMatch[1]) }));

  const streamMatch = pathname.match(/^(?:\/([^\/]+))?\/stream\/([^\/]+)\/([^\/\.]+)\.json$/);
  if (streamMatch) {
    const streams = await scrapeRealStreams(streamMatch[2], streamMatch[3], parseConfig(streamMatch[1]));
    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
    return res.end(JSON.stringify({ streams }));
  }

  if (pathname === '/' || pathname === '/configure') return serveStaticFile(res, path.join(PUBLIC_DIR, 'index.html'));
  
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  fs.stat(path.join(PUBLIC_DIR, safePath), (err, stats) => {
    if (!err && stats.isFile()) serveStaticFile(res, path.join(PUBLIC_DIR, safePath));
    else serveStaticFile(res, path.join(PUBLIC_DIR, 'index.html'));
  });
});

server.listen(PORT, () => console.log(`🚀 NOVA STREAM v1.0.2 (Parallel Anti-Ban) su porta ${PORT}`));
