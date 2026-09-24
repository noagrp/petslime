const CACHE='petslime-shell-v3';
const SHELL=[
  './',
  './index.html',
  './styles.css',
  './script.js',
  './care.js',
  './audio.js',
  './bgm.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon-32x32.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);

  if(url.hostname==='api.github.com'||url.hostname==='raw.githubusercontent.com')return;

  if(request.mode==='navigate'){
    event.respondWith(
      fetch(request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put('./index.html',copy));
          return response;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      if(response&&response.ok&&url.origin===self.location.origin){
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(request,copy));
      }
      return response;
    }))
  );
});