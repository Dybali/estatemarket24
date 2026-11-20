// Builds the 30 city pre-registration pages (<slug>/index.html) from data/landing-cities.json.
// Run: node scripts/build-landing.mjs   (the data is exported from the main app's lib/landing-cities.ts)
// The form posts to the EstateMarket24 system; change API when the final domain is live.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const API = "https://p-r9al26.project.space/api/on-kayit";
const SITE = ""; // "EstateMarket24’ü keşfedin" button target; empty hides it until the main site is public.
const cities = JSON.parse(readFileSync(new URL("../data/landing-cities.json", import.meta.url), "utf8"));
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const HIGHLIGHTS = [["109", "ülke"], ["8", "dil"], ["Canlı", "çeviriyle mesajlaşma"], ["%50", "ilk 1000 emlakçıya hediye"]];
const FEATURES = ["Tek tıkla 3,2 milyar insana ulaşım", "İlanlarınız otomatik olarak 8 dilde yayında", "Canlı çeviri ile yabancı alıcılarla kendi dilinizde mesajlaşma",
  "İlk 1000 emlakçıya %50 hediye", "Bireysel mülk sahiplerine erken kayıt ayrıcalığı", "Onaylı ve doğrulanmış ilanlarla güvenilir profil"];
const check = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const arrow = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
for (const city of cities) {
  const label = `${city.locative.toLocaleUpperCase("tr")} EMLAKÇILARA VE MÜLK SAHİPLERİNE ÖZEL`;
  const alt = city.imageShowsLandmark ? `${city.name} · ${city.landmark}` : city.name;
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(city.name)} ön kayıt | EstateMarket24</title><meta name="description" content="${esc(city.locative)} emlakçılar ve mülk sahipleri için EstateMarket24 ön kaydı. Mülklerinizi 8 dilde yayınlayın.">
<meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#0B5F63"><link rel="icon" href="../favicon.svg" type="image/svg+xml">
<meta property="og:title" content="Tek tıkla 3,2 milyar insana ulaşın | EstateMarket24"><meta property="og:description" content="${esc(city.locative)} mülklerinizi 8 dilde yayınlayın."><meta property="og:image" content="${esc(city.image)}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap"><link rel="stylesheet" href="../assets/landing.css"><link rel="preload" as="image" href="${esc(city.image)}">
</head><body>
<main class="lp lp-welcome">
 <header class="lp-top"><img class="lp-logo-dark" src="../assets/logo-horizontal.svg" alt="EstateMarket24" width="190" height="37"></header>
 <section class="lp-grid">
  <figure class="lp-photo"><img src="${esc(city.image)}" alt="${esc(alt)}" fetchpriority="high" onerror="this.remove()"><figcaption><strong>${esc(city.name)}</strong>${city.imageShowsLandmark ? `<span>${esc(city.landmark)}</span>` : ""}</figcaption></figure>
  <div class="lp-copy">
   <p class="lp-eyebrow">${esc(label)}</p>
   <h1>Tek tıkla 3,2 milyar insana ulaşın</h1>
   <p class="lp-sub">${esc(city.locative)} mülklerinizi 8 dilde yayınlayın, yabancı alıcılarla canlı çeviriyle anında mesajlaşın.</p>
   <div class="lp-highlights">${HIGHLIGHTS.map(([b, s]) => `<div><strong>${esc(b)}</strong><span>${esc(s)}</span></div>`).join("")}</div>
   <ul class="lp-features">${FEATURES.map((f) => `<li>${check}${esc(f)}</li>`).join("")}</ul>
   <p class="lp-urgency">Kontenjan sınırlı. ${esc(city.name)} için yerinizi şimdi ayırtın.</p>
   <button type="button" class="lp-cta" data-start>Hemen yerinizi ayırtın ${arrow}</button>
  </div>
 </section>
 <p class="lp-credit">Fotoğraf: ${esc(city.credit.author)} · <a href="${esc(city.credit.source)}" target="_blank" rel="noopener">${esc(city.credit.license)}</a> · <a href="../gizlilik/">Aydınlatma Metni</a></p>
</main>
<div id="lp-flow" data-api="${esc(API)}" data-city="${esc(city.slug)}" data-name="${esc(city.name)}" data-genitive="${esc(city.genitive)}" data-locative="${esc(city.locative)}" data-privacy="../gizlilik/" data-site="${esc(SITE)}"></div>
<script src="../assets/landing.js" defer></script>
</body></html>
`;
  mkdirSync(new URL(`../${city.slug}/`, import.meta.url), { recursive: true });
  writeFileSync(new URL(`../${city.slug}/index.html`, import.meta.url), html);
}
console.log(`built ${cities.length} pages`);
