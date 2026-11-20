// Builds the 30 city pre-registration pages (<slug>/index.html) from data/landing-cities.json.
// Run: node scripts/build-landing.mjs   (the data is exported from the main app's lib/landing-cities.ts)
// One long page: hero, platform showcase (8 languages, live chat translation), trust, the form at the bottom.
// The form posts to the EstateMarket24 system; change API when the final domain is live.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const API = "https://p-r9al26.project.space/api/on-kayit";
const SITE = ""; // "EstateMarket24’ü keşfedin" button target; empty hides it until the main site is public.
const WHATSAPP = "905443055751"; // public Türkiye number from the main site's Yasal künye
const cities = JSON.parse(readFileSync(new URL("../data/landing-cities.json", import.meta.url), "utf8"));
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const svg = (path, size = 20, width = 2.2) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const ICON = {
  check: svg('<path d="M20 6 9 17l-5-5"/>', 16, 2.6), arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  shield: svg('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z"/><path d="m9 12 2 2 4-4"/>'),
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>'),
  lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  gift: svg('<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18M12 8S9 3 7 5s5 3 5 3zm0 0s3-5 5-3-5 3-5 3z"/>'),
  chat: svg('<path d="M21 12a8 8 0 0 1-11.7 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>'),
  langs: svg('<path d="M4 5h8M8 3v2M6 5c0 4 3 7 6 8M10 5c0 4-3 7-6 8M13 20l4-9 4 9M14.5 17h5"/>'),
};
const WA_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>';
const HIGHLIGHTS = [["109", "ülke"], ["8", "dil"], ["Canlı", "çeviriyle mesajlaşma"], ["%50", "ilk 1000 emlakçıya hediye"]];
const FEATURES = ["Tek tıkla 3,2 milyar insana ulaşım", "İlanlarınız otomatik olarak 8 dilde yayında", "Canlı çeviri ile yabancı alıcılarla kendi dilinizde mesajlaşma",
  "İlk 1000 emlakçıya %50 hediye", "Bireysel mülk sahiplerine erken kayıt ayrıcalığı", "Onaylı ve doğrulanmış ilanlarla güvenilir profil"];
const option = (list) => `<option value="">Seçin</option>${list.map((v) => `<option>${esc(v)}</option>`).join("")}`;
const field = (name, label, attrs = "") => `<label class="lpf-field" data-for="${name}"><span>${label}</span><input name="${name}" ${attrs}></label>`;
const select = (name, label, list, role) => `<label class="lpf-field" data-role-only="${role}"><span>${label}</span><select name="${name}">${option(list)}</select></label>`;

for (const city of cities) {
  const label = `${city.locative.toLocaleUpperCase("tr")} EMLAKÇILARA VE MÜLK SAHİPLERİNE ÖZEL`;
  const alt = city.imageShowsLandmark ? `${city.name} · ${city.landmark}` : city.name;
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Merhaba, EstateMarket24 ön kaydı hakkında bilgi almak istiyorum (${city.name}).`)}`;
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(city.name)} ön kayıt | EstateMarket24</title><meta name="description" content="${esc(city.locative)} emlakçılar ve mülk sahipleri için EstateMarket24 ön kaydı. Mülklerinizi 8 dilde yayınlayın, yabancı alıcılarla canlı çeviriyle mesajlaşın.">
<meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#0B5F63"><link rel="icon" href="../favicon.svg" type="image/svg+xml">
<meta property="og:title" content="Tek tıkla 3,2 milyar insana ulaşın | EstateMarket24"><meta property="og:description" content="${esc(city.locative)} mülklerinizi 8 dilde yayınlayın."><meta property="og:image" content="${esc(city.image)}">
<script>document.documentElement.classList.add("js")</script><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap"><link rel="stylesheet" href="../assets/landing.css"><link rel="preload" as="image" href="${esc(city.image)}">
</head><body class="lpx" data-api="${esc(API)}" data-city="${esc(city.slug)}" data-name="${esc(city.name)}" data-locative="${esc(city.locative)}" data-site="${esc(SITE)}">
<header class="lpx-top"><div class="lpx-wrap"><img src="../assets/logo-horizontal.svg" alt="EstateMarket24" width="180" height="35"><a class="lpx-top-cta" href="#kayit">Yerinizi ayırtın</a></div></header>

<section class="lpx-hero"><div class="lpx-wrap lpx-hero-grid">
 <div class="lpx-hero-copy">
  <p class="lpx-eyebrow">${esc(label)}</p>
  <h1>Tek tıkla 3,2 milyar insana ulaşın</h1>
  <p class="lpx-sub">${esc(city.locative)} mülklerinizi 8 dilde yayınlayın, yabancı alıcılarla canlı çeviriyle anında mesajlaşın.</p>
  <div class="lpx-highlights">${HIGHLIGHTS.map(([b, s]) => `<div><strong>${esc(b)}</strong><span>${esc(s)}</span></div>`).join("")}</div>
  <div class="lpx-hero-actions"><a class="lpx-cta" href="#kayit">Hemen yerinizi ayırtın ${ICON.arrow}</a><p class="lpx-urgency">Kontenjan sınırlı. ${esc(city.name)} için yerinizi şimdi ayırtın.</p></div>
 </div>
 <figure class="lpx-photo"><img src="${esc(city.image)}" alt="${esc(alt)}" fetchpriority="high" onerror="this.remove()"><figcaption><strong>${esc(city.name)}</strong>${city.imageShowsLandmark ? `<span>${esc(city.landmark)}</span>` : ""}</figcaption></figure>
</div></section>

<section class="lpx-trust"><div class="lpx-wrap"><span>${ICON.shield}Almanya merkezli Exxelmedia güvencesi</span><span>${ICON.lock}KVKK uyumlu, veriler Almanya’da saklanır</span><span>${ICON.gift}Ön kayıt ücretsizdir</span><span>${ICON.globe}8 dil, 109 ülke</span></div></section>

<section class="lpx-show"><div class="lpx-wrap">
 <h2>Mülkünüz dünyanın dört bir yanında, siz kendi dilinizde.</h2>
 <div class="lpx-show-grid">
  <article class="lpx-demo">
   <p class="lpx-kicker">${ICON.langs} 8 dilde ilan</p>
   <h3>Bir kez yazın, ilanınız 8 dilde yayında.</h3>
   <div class="lpx-listing" aria-label="Örnek ilan önizlemesi">
    <div class="lpx-listing-photo" style="background-image:url(&quot;${esc(city.image)}&quot;),linear-gradient(135deg,#9fd3cf,#0b5f63)"><span class="lpx-chip" data-lang-chip>TR</span></div>
    <div class="lpx-listing-body"><strong data-lang-title>Deniz manzaralı 3+1 daire</strong><span data-lang-meta>${esc(city.name)} · 145 m² · Satılık</span></div>
    <div class="lpx-langs" data-langs>${["TR", "DE", "EN", "AR", "RU", "FR", "FA", "NL"].map((l, i) => `<span${i === 0 ? ' class="on"' : ""}>${l}</span>`).join("")}</div>
   </div>
   <p class="lpx-demo-note">Örnek ilan önizlemesidir.</p>
  </article>
  <article class="lpx-demo">
   <p class="lpx-kicker">${ICON.chat} Canlı çeviri ile mesajlaşma</p>
   <h3>Alıcı Almanca yazar, siz Türkçe okursunuz.</h3>
   <div class="lpx-chat" data-chat>
    <div class="lpx-chat-head"><span class="lpx-avatar">M</span><span><strong>Markus · Münih</strong><small>Deniz manzaralı 3+1 daire</small></span></div>
    <div class="lpx-msg in"><span class="lpx-orig">Guten Tag! Ist die Wohnung noch verfügbar? Kann ich sie nächste Woche besichtigen?</span><span class="lpx-tr">İyi günler! Daire hâlâ müsait mi? Gelecek hafta görebilir miyim?</span><small>🇩🇪 Almancadan çevrildi</small></div>
    <div class="lpx-msg out"><span class="lpx-orig">Evet, müsait. Salı günü saat 14:00 uygun mu?</span><span class="lpx-tr">Ja, sie ist verfügbar. Passt Ihnen Dienstag um 14 Uhr?</span><small>🇹🇷 Almancaya çevrilerek gönderildi</small></div>
    <div class="lpx-msg in"><span class="lpx-orig">Perfekt, bis Dienstag!</span><span class="lpx-tr">Harika, salı görüşmek üzere!</span><small>🇩🇪 Almancadan çevrildi</small></div>
   </div>
   <p class="lpx-demo-note">Örnek yazışmadır.</p>
  </article>
 </div>
 <ul class="lpx-features">${FEATURES.map((f) => `<li>${ICON.check}${esc(f)}</li>`).join("")}</ul>
</div></section>

<section class="lpx-form-section" id="kayit"><div class="lpx-wrap lpx-form-wrap">
 <div class="lpx-form-intro"><h2>${esc(city.name)} için yerinizi ayırtın</h2><p>Bir dakikadan kısa sürer. Açılışta ilk sizinle iletişime geçeceğiz.</p><p class="lpx-urgency">Kontenjan sınırlı.</p></div>
 <form class="lpf" id="lpf" novalidate>
  <fieldset class="lpf-roles"><legend>Size nasıl yardımcı olabiliriz? *</legend>
   <label><input type="radio" name="role" value="agent"><span><strong>Emlakçıyım</strong><small>Emlak ofisi sahibi veya danışman</small></span></label>
   <label><input type="radio" name="role" value="owner"><span><strong>Bireysel mülk sahibiyim</strong><small>Kendi mülkümü ilana çıkarmak istiyorum</small></span></label>
  </fieldset>
  <div class="lpf-grid">
   ${field("name", "Adınız soyadınız *", 'autocomplete="name" maxlength="100"')}
   <label class="lpf-field" data-role-only="agent"><span>Emlak ofisinizin adı *</span><input name="company" autocomplete="organization" maxlength="120"></label>
   ${field("phone", "Cep telefonunuz *", 'type="tel" inputmode="tel" autocomplete="tel" placeholder="05xx xxx xx xx" maxlength="40"')}
   ${field("email", "E-posta adresiniz *", 'type="email" inputmode="email" autocomplete="email" placeholder="ornek@eposta.com" maxlength="200"')}
   <label class="lpf-field"><span data-district-label>${esc(city.genitive)} hangi ilçesinde?</span><input name="district" maxlength="80"></label>
  </div>
  <details class="lpf-more"><summary>Birkaç soru daha <small>(isteğe bağlı, 20 saniye)</small></summary><div class="lpf-grid">
   ${select("portfolio", "Portföyünüzde yaklaşık kaç ilan var?", ["1–10", "11–50", "51–200", "200+"], "agent")}
   ${select("foreignSales", "Daha önce yabancı müşteriye satış yaptınız mı?", ["Evet", "Hayır"], "agent")}
   ${select("package", "Hangi paketle ilgileniyorsunuz?", ["Başlangıç", "Standart", "Gelişmiş", "Profesyonel", "Kurumsal", "Premium", "Henüz karar vermedim"], "agent")}
   ${select("propertyType", "Mülkünüzün türü nedir?", ["Daire", "Villa", "Müstakil ev", "Arsa", "İşyeri", "Diğer"], "owner")}
   ${select("propertyCount", "Kaç mülkünüzü ilana çıkarmayı düşünüyorsunuz?", ["1", "2–3", "4 ve üzeri"], "owner")}
   ${select("purpose", "Mülkünüzü ne için ilana çıkarmak istiyorsunuz?", ["Satılık", "Kiralık", "Her ikisi"], "owner")}
   ${select("timeline", "Ne zaman ilana çıkmayı planlıyorsunuz?", ["Hemen", "3 ay içinde", "6 ay içinde", "Sadece bilgi almak istiyorum"], "owner")}
  </div></details>
  <label class="lpf-check"><input type="checkbox" name="notice"><span>KVKK Aydınlatma Metni’ni okudum ve kabul ediyorum. <a href="../gizlilik/" target="_blank" rel="noopener">Aydınlatma Metni</a> *</span></label>
  <label class="lpf-check"><input type="checkbox" name="marketing"><span>Kampanya ve bilgilendirme mesajları almak istiyorum.</span></label>
  <input class="lpf-honeypot" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
  <button type="submit" class="lpx-cta lpf-submit">Hemen yerinizi ayırtın ${ICON.arrow}</button>
  <p class="lpf-error" role="alert" hidden></p>
 </form>
 <div class="lpf-thanks" hidden tabindex="-1"><h2>Yeriniz ayrıldı! 🎉</h2><p data-thanks-text></p>
  <a class="lpx-cta lpf-share" data-share target="_blank" rel="noopener">${WA_ICON} <span data-share-label>Meslektaşınızı davet edin</span></a>
  ${SITE ? `<a class="lpx-link" href="${esc(SITE)}">EstateMarket24’ü keşfedin</a>` : ""}</div>
</div></section>

<section class="lpx-faq"><div class="lpx-wrap"><h2>Aklınızdaki sorular</h2>
 <details><summary>Ön kayıt ücretli mi?</summary><p>Hayır, ön kayıt ücretsizdir ve sizi hiçbir pakete bağlamaz.</p></details>
 <details><summary>Site ne zaman açılıyor?</summary><p>Açılış tarihini ön kayıt yaptıranlara ilk olarak bildireceğiz. Ekibimiz sizinle telefon veya e-postayla iletişime geçecek.</p></details>
 <details><summary>İlk 1000 emlakçıya %50 hediye nasıl işliyor?</summary><p>Ön kayıt sırasına göre ilk 1000 emlakçı kaydına %50 hediye tanımlanır; ayrıntılar açılışta paketlerle birlikte açıklanır.</p></details>
 <details><summary>Bilgilerim nerede saklanıyor?</summary><p>Ön kayıt bilgileriniz Almanya’daki sunucularda saklanır ve yalnızca sizinle iletişim kurmak için kullanılır. Ayrıntılar <a href="../gizlilik/">Aydınlatma Metni</a>’nde.</p></details>
</div></section>

<footer class="lpx-footer"><div class="lpx-wrap"><span>© 2026 EstateMarket24 · Exxelmedia</span><span>Fotoğraf: ${esc(city.credit.author)} · <a href="${esc(city.credit.source)}" target="_blank" rel="noopener">${esc(city.credit.license)}</a></span><a href="../gizlilik/">Aydınlatma Metni</a></div></footer>
<a class="lpx-wa" href="${esc(wa)}" target="_blank" rel="noopener" aria-label="WhatsApp ile soru sorun">${WA_ICON}</a>
<script src="../assets/landing.js" defer></script>
</body></html>
`;
  mkdirSync(new URL(`../${city.slug}/`, import.meta.url), { recursive: true });
  writeFileSync(new URL(`../${city.slug}/index.html`, import.meta.url), html);
}
console.log(`built ${cities.length} pages`);
