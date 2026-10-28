/* sw.js — 홈 화면에 추가(PWA)용 최소 서비스 워커. 캐시하지 않고 그대로 네트워크로 보낸다.
   크롬이 "앱처럼 설치"(주소창 없는 전체화면)를 허용하려면 fetch 핸들러가 있는 서비스 워커가 필요해서 둔 것. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function () { /* 네트워크 그대로 */ });
