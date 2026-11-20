// One-question-per-screen pre-registration for the city landing pages (scripts/build-landing.mjs).
// Answers are sent to the EstateMarket24 system (POST /api/on-kayit), which stores them and lists them for
// the team. Turkish only: the copy is the owner's campaign brief.
(() => {
  const root = document.querySelector("#lp-flow");
  if (!root) return;
  const API = root.dataset.api;
  const city = { slug: root.dataset.city, name: root.dataset.name, genitive: root.dataset.genitive, locative: root.dataset.locative };
  const PRIVACY = root.dataset.privacy;
  const SITE = root.dataset.site;
  const OPTIONS = {
    portfolio: ["1–10", "11–50", "51–200", "200+"], yesNo: ["Evet", "Hayır"],
    package: ["Başlangıç", "Standart", "Gelişmiş", "Profesyonel", "Kurumsal", "Premium", "Henüz karar vermedim"],
    propertyType: ["Daire", "Villa", "Müstakil ev", "Arsa", "İşyeri", "Diğer"], propertyCount: ["1", "2–3", "4 ve üzeri"],
    purpose: ["Satılık", "Kiralık", "Her ikisi"], timeline: ["Hemen", "3 ay içinde", "6 ay içinde", "Sadece bilgi almak istiyorum"],
  };
  const MSG = {
    name: "Adınızı ve soyadınızı girin.", company: "Emlak ofisinizin adını girin.", phone: "Geçerli bir cep telefonu numarası girin.",
    email: "Geçerli bir e-posta adresi girin.", required: "Bu soru zorunlu.", notice: "Devam etmek için Aydınlatma Metni’ni onaylayın.",
    failed: "Kayıt şu anda gönderilemedi. Lütfen birkaç dakika sonra tekrar deneyin.",
  };
  const EMAIL = /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[^\s@<>()",;]{2,}$/;
  const ROLE = { key: "role", title: "Size nasıl yardımcı olabiliriz?", kind: "choice", required: true, options: [["agent", "Emlakçıyım / emlak ofisi sahibiyim"], ["owner", "Bireysel mülk sahibiyim"]] };
  const contact = [
    { key: "phone", title: "Cep telefonunuz", kind: "tel", required: true, placeholder: "05xx xxx xx xx" },
    { key: "email", title: "E-posta adresiniz", kind: "email", required: true, placeholder: "ornek@eposta.com" },
  ];
  const stepsFor = (role) => role === "agent" ? [
    { key: "name", title: "Adınız soyadınız", kind: "text", required: true },
    { key: "company", title: "Emlak ofisinizin adı", kind: "text", required: true },
    ...contact,
    { key: "district", title: `Ofisiniz ${city.genitive} hangi ilçesinde?`, kind: "text" },
    { key: "portfolio", title: "Portföyünüzde yaklaşık kaç ilan var?", kind: "choice", options: OPTIONS.portfolio },
    { key: "foreignSales", title: "Daha önce yabancı müşteriye satış yaptınız mı?", kind: "choice", options: OPTIONS.yesNo },
    { key: "package", title: "Hangi paketle ilgileniyorsunuz?", kind: "choice", options: OPTIONS.package },
  ] : [
    { key: "name", title: "Adınız soyadınız", kind: "text", required: true },
    ...contact,
    { key: "district", title: `Mülkünüz ${city.genitive} hangi ilçesinde?`, kind: "text" },
    { key: "propertyType", title: "Mülkünüzün türü nedir?", kind: "choice", options: OPTIONS.propertyType },
    { key: "propertyCount", title: "Kaç mülkünüzü ilana çıkarmayı düşünüyorsunuz?", kind: "choice", options: OPTIONS.propertyCount },
    { key: "purpose", title: "Mülkünüzü ne için ilana çıkarmak istiyorsunuz?", kind: "choice", options: OPTIONS.purpose },
    { key: "timeline", title: "Ne zaman ilana çıkmayı planlıyorsunuz?", kind: "choice", options: OPTIONS.timeline },
  ];
  const values = {}, tracking = {};
  const q = new URLSearchParams(location.search);
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"]) if (q.get(key)) tracking[key] = q.get(key).slice(0, 200);
  let screen = 0, busy = false;
  const steps = () => [ROLE, ...(values.role ? stepsFor(values.role) : [])];
  const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const check = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  const arrow = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const back = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';

  function problem(step, value) {
    const v = String(value || "").trim();
    if (step.key === "name" && v.length < 3) return MSG.name;
    if (step.key === "company" && v.length < 2) return MSG.company;
    if (step.kind === "tel") { const d = v.replace(/\D/g, ""); if (d.length < 10 || d.length > 15) return MSG.phone; }
    if (step.kind === "email" && !EMAIL.test(v)) return MSG.email;
    if (step.required && !v) return MSG.required;
    return "";
  }
  function progress() { const total = values.role ? steps().length + 1 : 10; return Math.min(100, Math.round(((screen + 1) / total) * 100)); }
  function render(message = "") {
    const list = steps();
    document.body.classList.add("lp-in-flow");
    let inner;
    if (screen < list.length) {
      const step = list[screen], current = values[step.key] || "";
      const body = step.kind === "choice"
        ? `<div class="lp-choices" role="radiogroup" aria-label="${esc(step.title)}">${step.options.map((o, i) => { const [value, text] = Array.isArray(o) ? o : [o, o];
            return `<button type="button" role="radio" aria-checked="${current === value}" class="lp-choice${current === value ? " selected" : ""}" data-value="${esc(value)}"><span class="lp-key">${"ABCDEFGH"[i]}</span>${esc(text)}${current === value ? check : ""}</button>`; }).join("")}
            ${step.required ? "" : '<button type="button" class="lp-skip" data-skip>Geç</button>'}</div>`
        : `<input class="lp-input" id="lp-input" type="${step.kind === "text" ? "text" : step.kind}" ${step.kind === "tel" ? 'inputmode="tel" autocomplete="tel"' : step.kind === "email" ? 'inputmode="email" autocomplete="email"' : step.key === "name" ? 'autocomplete="name"' : step.key === "company" ? 'autocomplete="organization"' : 'autocomplete="off"'} placeholder="${esc(step.placeholder || "")}" value="${esc(current)}" maxlength="${step.key === "district" ? 80 : 200}">
           <div class="lp-actions"><button type="submit" class="lp-ok">Tamam ${check}</button><span class="lp-hint">Enter ↵</span></div>`;
      inner = `<form id="lp-form" novalidate><p class="lp-step">${screen + 1} →</p><h2>${esc(step.title)}${step.required ? " *" : ""}</h2>${body}${message ? `<p class="lp-error" role="alert">${esc(message)}</p>` : ""}</form>`;
    } else {
      inner = `<form id="lp-consent"><h2>Son adım</h2>
        <label class="lp-check"><input type="checkbox" id="lp-notice" ${values.notice ? "checked" : ""}><span>KVKK Aydınlatma Metni’ni okudum ve kabul ediyorum. <a href="${esc(PRIVACY)}" target="_blank" rel="noopener">Aydınlatma Metni</a> *</span></label>
        <label class="lp-check"><input type="checkbox" id="lp-marketing" ${values.marketing ? "checked" : ""}><span>Kampanya ve bilgilendirme mesajları almak istiyorum.</span></label>
        <input class="lp-honeypot" id="lp-website" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button type="submit" class="lp-cta" ${busy ? "disabled" : ""}>${busy ? "Gönderiliyor…" : "Ön kaydı tamamla"} ${arrow}</button>
        ${message ? `<p class="lp-error" role="alert">${esc(message)}</p>` : ""}</form>`;
    }
    root.innerHTML = `<main class="lp lp-screen"><div class="lp-progress" aria-hidden="true"><span style="width:${progress()}%"></span></div>
      <div class="lp-card"><button type="button" class="lp-back" data-back>${back} Geri</button>${inner}</div></main>`;
    window.scrollTo(0, 0);
    const input = root.querySelector("#lp-input"); if (input) setTimeout(() => input.focus(), 50);
  }
  function thanks(gift) {
    const text = values.role === "agent"
      ? `${city.locative} ilk emlakçılar arasındasınız. ${gift ? "%50 hediyeniz tanımlandı. " : ""}Ekibimiz en kısa sürede sizinle iletişime geçecek.`
      : `${city.locative} ilk mülk sahipleri arasındasınız. Mülkünüzü dünyanın dört bir yanındaki alıcılara ulaştırmak için ekibimiz en kısa sürede sizinle iletişime geçecek.`;
    root.innerHTML = `<main class="lp lp-screen lp-thanks"><div class="lp-card"><img class="lp-logo-dark" src="../assets/logo-horizontal.svg" alt="EstateMarket24" width="190" height="37">
      <h1>Yeriniz ayrıldı! 🎉</h1><p>${esc(text)}</p>${SITE ? `<a class="lp-cta" href="${esc(SITE)}">EstateMarket24’ü keşfedin ${arrow}</a>` : ""}</div></main>`;
    window.scrollTo(0, 0);
  }
  async function send() {
    if (busy) return;
    values.notice = root.querySelector("#lp-notice").checked;
    values.marketing = root.querySelector("#lp-marketing").checked;
    if (!values.notice) { render(MSG.notice); return; }
    busy = true; render();
    try {
      const response = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, ...tracking, city: city.slug, source: `landing-${city.slug}`, website: root.querySelector("#lp-website")?.value || "" }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(response.status >= 500 ? MSG.failed : data.error || MSG.failed);
      busy = false;
      (window.dataLayer = window.dataLayer || []).push({ event: "pre_registration", city: city.slug, role: values.role });
      if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { city: city.slug, role: values.role });
      thanks(Boolean(data.gift));
    } catch (cause) { busy = false; render(cause.message && cause.message !== "Failed to fetch" ? cause.message : MSG.failed); }
  }

  document.querySelectorAll("[data-start]").forEach((button) => button.addEventListener("click", () => { screen = 0; render(); }));
  root.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;
    if (target.hasAttribute("data-back")) { if (screen === 0) { root.innerHTML = ""; document.body.classList.remove("lp-in-flow"); window.scrollTo(0, 0); return; } screen -= 1; render(); return; }
    if (target.hasAttribute("data-skip")) { screen += 1; render(); return; }
    if (target.dataset.value !== undefined) {
      const step = steps()[screen]; values[step.key] = target.dataset.value;
      if (step.key === "role") for (const key of Object.keys(values)) if (!["role", "notice", "marketing"].includes(key) && !stepsFor(values.role).some((s) => s.key === key)) delete values[key];
      render(); setTimeout(() => { screen += 1; render(); }, 160);
    }
  });
  root.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.target.id === "lp-consent") { send(); return; }
    const step = steps()[screen], input = root.querySelector("#lp-input");
    values[step.key] = input ? input.value : values[step.key];
    const issue = problem(step, values[step.key]);
    if (issue) { render(issue); return; }
    screen += 1; render();
  });
})();
