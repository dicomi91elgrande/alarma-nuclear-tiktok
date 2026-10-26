import http from 'node:http';
import { readFileSync } from 'node:fs';

const port = Number(process.env.PORT || process.env.RED_FLASH_PORT || 3191);
const cloud = Boolean(process.env.RENDER);
const token = process.env.OVERLAY_TOKEN || '';
if (cloud && token.length < 24) throw new Error('Configura OVERLAY_TOKEN (mínimo 24 caracteres)');
const clients = new Set();
let activeUntil = 0;
let lastGift = null;
const seen = new Map();
const state = () => ({ activeUntil, remaining: Math.max(0, activeUntil - Date.now()), lastGift });
const publish = () => { for (const res of clients) res.write(`data: ${JSON.stringify(state())}\n\n`); };
const files = { '/': 'red-flash-control.html', '/overlay': 'red-flash-overlay.html' };

const server = http.createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  const hosts = [`127.0.0.1:${port}`, `localhost:${port}`, process.env.RENDER_EXTERNAL_HOSTNAME].filter(Boolean);
  if (!hosts.includes(req.headers.host) || (req.headers.origin && !hosts.some(h => req.headers.origin === `http://${h}` || req.headers.origin === `https://${h}`))) {
    res.writeHead(403).end(); return;
  }
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  if (req.method === 'GET' && url.pathname === '/health') { res.end('ok'); return; }
  if (token && (req.headers['x-overlay-token'] || url.searchParams.get('key')) !== token) { res.writeHead(401).end('Enlace privado requerido'); return; }
  if (req.method === 'GET' && files[url.pathname]) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(readFileSync(new URL(files[url.pathname], import.meta.url))); return;
  }
  if (req.method === 'GET' && url.pathname === '/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', Connection: 'keep-alive' });
    res.write(`data: ${JSON.stringify(state())}\n\n`);
    clients.add(res); res.on('close', () => clients.delete(res)); return;
  }
  if (req.method === 'POST' && url.pathname === '/interactive/gift') {
    try {
      let raw = '';
      for await (const chunk of req) { raw += chunk; if (raw.length > 16384) throw new Error('Mensaje demasiado grande'); }
      const body = JSON.parse(raw);
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('JSON inválido');
      const coins = Number(body.coins);
      const count = body.countMode === 'combo' ? Number(body.repeatCount ?? 1) : 1;
      if (!Number.isSafeInteger(coins) || coins <= 0 || !Number.isSafeInteger(count) || count <= 0 || !Number.isSafeInteger(coins * count)) throw new Error('Monedas o cantidad inválidas');
      if (body.countMode && !['unit', 'combo'].includes(body.countMode)) throw new Error('countMode debe ser unit o combo');
      // Only a completed combo may count; Interactive must send one webhook per delivery.
      const pending = body.countMode === 'combo' && [false, 'false', 0, '0'].includes(body.repeatEnd);
      const now = Date.now();
      for (const [id, time] of seen) if (now - time > 600000) seen.delete(id);
      const key = body.eventId ? `${String(body.username || '')}:${String(body.eventId)}` : null;
      const duplicate = key !== null && seen.has(key);
      const triggered = !pending && !duplicate && coins * count >= 1000;
      if (!pending && !duplicate) {
        if (key) { seen.set(key, now); if (seen.size > 10000) seen.delete(seen.keys().next().value); }
        lastGift = { coins: coins * count, username: String(body.username || 'Usuario').slice(0, 100), triggered, time: now };
        if (triggered) activeUntil = now + 5000;
        publish();
      }
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: true, triggered, duplicate, pending, coins: coins * count }));
    } catch (error) { res.writeHead(400, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: error.message })); }
    return;
  }
  res.writeHead(404).end('No encontrado');
});
setInterval(() => { for (const res of clients) res.write(': heartbeat\n\n'); }, 15000).unref();
server.on('error', error => { console.error(`No se pudo iniciar el overlay: ${error.message}`); process.exitCode = 1; });
server.listen(port, cloud ? '0.0.0.0' : '127.0.0.1', () => console.log(`Panel: http://127.0.0.1:${port}\nOverlay: http://127.0.0.1:${port}/overlay (1080 x 1920)`));


