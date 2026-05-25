import { readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';

const DC_STATE_FILE = '.design-canvas.state.json';

function readJsonBody(req, onDone) {
  let body = '';
  req.on('data', (d) => { body += d; });
  req.on('end', () => {
    try { onDone(null, JSON.parse(body)); }
    catch (e) { onDone(e); }
  });
}

function containedPath(root, urlPath) {
  if (typeof urlPath !== 'string' || urlPath.includes('..')) return null;
  const clean = urlPath.replace(/^\/+/, '');
  const target = resolve(root, clean);
  const rel = relative(resolve(root), target);
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) return null;
  return target;
}

function isCanvasStatePath(urlPath) {
  return typeof urlPath === 'string' && urlPath.split('/').pop() === DC_STATE_FILE;
}

function canvasStateReadPlugin(root) {
  return {
    name: 'design-tool-canvas-state-read',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0];
        if (!isCanvasStatePath(url)) return next();
        const filePath = containedPath(root, url);
        if (!filePath) { res.statusCode = 403; res.end('Forbidden'); return; }
        try {
          res.setHeader('Content-Type', 'application/json');
          res.end(readFileSync(filePath, 'utf8'));
        } catch {
          next();
        }
      });
    },
  };
}

function canvasStatePlugin(root) {
  return {
    name: 'design-tool-canvas-state',
    configureServer(server) {
      server.middlewares.use('/__canvas/write', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
        readJsonBody(req, (err, payload) => {
          if (err) { res.statusCode = 400; res.end(err.message); return; }
          const { path: urlPath, content } = payload;
          if (typeof content !== 'string' || !isCanvasStatePath(urlPath)) {
            res.statusCode = 403;
            res.end('Forbidden');
            return;
          }
          const filePath = containedPath(root, urlPath);
          if (!filePath) { res.statusCode = 403; res.end('Forbidden'); return; }
          writeFileSync(filePath, content, 'utf8');
          res.end('ok');
        });
      });
    },
  };
}

export function designToolDevPlugins({ root }) {
  return [
    canvasStateReadPlugin(root),
    canvasStatePlugin(root),
  ];
}
