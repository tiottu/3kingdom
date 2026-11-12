// 삼국지 꼬마 장수 - 앱으로 설치했을 때 쓰는 서비스 워커 (ui 담당)
// 인터넷이 되면 늘 새 파일을 받아 오고(바로 업데이트), 안 되면 저장해 둔 파일로 연다.
// 서버(Supabase) 요청은 건드리지 않는다. 게임 파일을 새로 만들면 아래 FILES 에도 넣는다.
const CACHE = 'samguk-kids-v1';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'core/config.js', 'core/util.js', 'core/server.js', 'core/save.js',
  'data/generals.js', 'data/generals-more.js', 'data/generals-more-2.js',
  'ui/ui.css', 'ui/ui.js', 'ui/art.js', 'ui/dex.js', 'ui/install.js',
  'games/quiz/quiz.css', 'games/quiz/quiz-data.js', 'games/quiz/quiz-1.js', 'games/quiz/quiz-2.js', 'games/quiz/quiz-3.js', 'games/quiz/quiz.js',
  'games/battle/battle.css', 'games/battle/rules.js', 'games/battle/team.js',
  'games/online/online.css', 'games/online/room.js',
  'games/conquest/conquest.css', 'games/conquest/map-data.js', 'games/conquest/conquest.js', 'games/conquest/conquest-map.js', 'games/conquest/conquest-tribes.js','games/conquest/conquest-net.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // 서버 요청은 그대로
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('index.html')))
  );
});
