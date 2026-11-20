# EstateMarket24 ön kayıt sayfaları

Ana siteden ayrı, statik site (GitHub Pages). 30 büyükşehir için emlakçı ve bireysel mülk sahibi ön kayıt sayfaları `<şehir>/index.html` içinde; `node scripts/build-landing.mjs` ile `data/landing-cities.json` verisinden üretilir. Form `assets/landing.js` ile EstateMarket24 sisteminin `POST /api/on-kayit` ucuna gönderir (adres `scripts/build-landing.mjs` içinde `API`). Kayıtlar ana sistemde Yönetim › Ön kayıtlar ekranında görünür.

Diğer il sayfaları ve kök sayfa eski ön kayıt sitesidir.
