// 배지 칩 탭 TO-BE 로컬 미리보기 서버 (tools/ds-preview). v7 화면에 조작판(TO-BE, 정보 보기, 달라진 곳)을 덧붙여 보여 준다.
// 쓰기: 저장소 루트에서 node tools/ds-preview/serve.mjs [포트, 기본 5321]  (다른 사본을 보려면 node tools/ds-preview/serve.mjs 5321 <aprism-web 폴더>)
import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2]) || 5321; const ROOT = path.resolve(process.argv[3] || path.join(HERE, '..', '..'));
const PV = { '/__pv/sizes.css': 'ds-preview.css', '/__pv/pv-inspect.js': 'pv-inspect.js' };
const T = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary' };
http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  let f = PV[u] ? path.join(HERE, PV[u]) : path.normalize(path.join(ROOT, u));
  if (!PV[u] && !f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  fs.readFile(f, (e, b) => {
    if (e) { res.writeHead(404); return res.end('not found'); }
    if (/-v7[^/]*\.html$/.test(f)) b = Buffer.from(b.toString('utf8').replace('</head>', '<script src="/__pv/pv-inspect.js"></script></head>'));
    res.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(b);
  });
}).listen(PORT, '127.0.0.1', () => console.log(`미리보기 http://localhost:${PORT}/screens/main-v7.html?theme=light#critical`));
