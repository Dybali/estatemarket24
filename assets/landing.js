// City pre-registration pages (scripts/build-landing.mjs): language and chat demos, the form at the bottom.
// Answers go to the EstateMarket24 system (POST /api/on-kayit), which stores them for the team.
(() => {
  const body = document.body;
  const API = body.dataset.api, city = { slug: body.dataset.city, name: body.dataset.name, locative: body.dataset.locative };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 8 languages demo: the sample listing title cycles through the languages.
  const TITLES = {
    TR: ["Deniz manzaralı 3+1 daire", "Satılık"], DE: ["3-Zimmer-Wohnung mit Meerblick", "Zu verkaufen"], EN: ["3-bedroom flat with sea view", "For sale"],
    AR: ["شقة 3+1 بإطلالة على البحر", "للبيع"], RU: ["Квартира 3+1 с видом на море", "Продажа"], FR: ["Appartement 3+1 vue mer", "À vendre"],
    FA: ["آپارتمان ۳+۱ با چشم‌انداز دریا", "فروشی"], NL: ["3+1 appartement met zeezicht", "Te koop"],
  };
  const chip = document.querySelector("[data-lang-chip]"), title = document.querySelector("[data-lang-title]"), meta = document.querySelector("[data-lang-meta]");
  const tabs = [...document.querySelectorAll("[data-langs] span")];
  const metaBase = meta ? meta.textContent.replace(/ · [^·]+$/, "") : "";
  let li = 0;
  const showLang = (code) => {
    if (!title) return;
    const [text, purpose] = TITLES[code];
    title.textContent = text; title.dir = code === "AR" || code === "FA" ? "rtl" : "ltr";
    if (chip) chip.textContent = code;
    if (meta) meta.textContent = `${metaBase} · ${purpose}`;
    tabs.forEach((tab) => tab.classList.toggle("on", tab.textContent === code));
  };
  tabs.forEach((tab) => tab.addEventListener("click", () => { li = Object.keys(TITLES).indexOf(tab.textContent); showLang(tab.textContent); }));
  if (!reduce && title) setInterval(() => { li = (li + 1) % 8; showLang(Object.keys(TITLES)[li]); }, 2200);

  // Chat demo: always fully visible (an empty box in between confused visitors); messages appear once, in order.
  const chat = document.querySelector("[data-chat]");
  if (chat) chat.querySelectorAll(".lpx-msg").forEach((m, i) => setTimeout(() => m.classList.add("show", "translated"), reduce ? 0 : 150 + i * 250));

  // Form.
  const form = document.querySelector("#lpf");
  if (!form) return;
  const errorBox = form.querySelector(".lpf-error"), submit = form.querySelector(".lpf-submit");
  const districtLabel = form.querySelector("[data-district-label]"), districtBase = districtLabel ? districtLabel.textContent : "";
  const MSG = {
    role: "Lütfen emlakçı mı yoksa bireysel mülk sahibi mi olduğunuzu seçin.", name: "Adınızı ve soyadınızı girin.", company: "Emlak ofisinizin adını girin.",
    phone: "Geçerli bir cep telefonu numarası girin.", email: "Geçerli bir e-posta adresi girin.", notice: "Devam etmek için Aydınlatma Metni’ni onaylayın.",
    failed: "Kayıt şu anda gönderilemedi. Lütfen birkaç dakika sonra tekrar deneyin.",
  };
  const EMAIL = /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[^\s@<>()",;]{2,}$/;
  const tracking = {};
  const q = new URLSearchParams(location.search);
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"]) if (q.get(key)) tracking[key] = q.get(key).slice(0, 200);
  const setRole = (role) => {
    form.dataset.role = role;
    form.querySelectorAll("[data-role-only]").forEach((el) => { el.hidden = el.dataset.roleOnly !== role; });
    if (districtLabel) districtLabel.textContent = role ? `${role === "agent" ? "Ofisiniz" : "Mülkünüz"} ${districtBase}` : districtBase;
  };
  form.querySelectorAll('input[name="role"]').forEach((radio) => radio.addEventListener("change", () => setRole(radio.value)));
  setRole("");
  const fail = (message, field) => { errorBox.textContent = message; errorBox.hidden = false; if (field) form.querySelector(`[name="${field}"]`)?.focus(); };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorBox.hidden = true;
    const data = Object.fromEntries(new FormData(form));
    const role = data.role;
    if (role !== "agent" && role !== "owner") return fail(MSG.role);
    if (String(data.name || "").trim().length < 3) return fail(MSG.name, "name");
    if (role === "agent" && String(data.company || "").trim().length < 2) return fail(MSG.company, "company");
    const digits = String(data.phone || "").replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) return fail(MSG.phone, "phone");
    if (!EMAIL.test(String(data.email || "").trim())) return fail(MSG.email, "email");
    if (!form.notice.checked) return fail(MSG.notice, "notice");
    const payload = { ...tracking, role, city: city.slug, source: `landing-${city.slug}`, notice: true, marketing: form.marketing.checked, website: data.website || "" };
    for (const key of ["name", "company", "phone", "email", "district", "portfolio", "foreignSales", "package", "propertyType", "propertyCount", "purpose", "timeline"])
      if (data[key] && !(form.querySelector(`[name="${key}"]`)?.closest("[data-role-only]")?.hidden)) payload[key] = data[key];
    submit.disabled = true;
    try {
      const response = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(response.status >= 500 ? MSG.failed : result.error || MSG.failed);
      (window.dataLayer = window.dataLayer || []).push({ event: "pre_registration", city: city.slug, role });
      if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { city: city.slug, role });
      const thanks = document.querySelector(".lpf-thanks");
      thanks.querySelector("[data-thanks-text]").textContent = role === "agent"
        ? `${city.locative} ilk emlakçılar arasındasınız. ${result.gift ? "%50 hediyeniz tanımlandı. " : ""}Ekibimiz en kısa sürede sizinle iletişime geçecek.`
        : `${city.locative} ilk mülk sahipleri arasındasınız. Mülkünüzü dünyanın dört bir yanındaki alıcılara ulaştırmak için ekibimiz en kısa sürede sizinle iletişime geçecek.`;
      const share = thanks.querySelector("[data-share]"), page = location.origin + location.pathname;
      const text = role === "agent"
        ? `${city.locative} mülkleri 8 dilde yabancı alıcılara ulaştıran EstateMarket24’e ön kayıt yaptım. Sen de yerini ayırt: ${page}`
        : `Mülkünü 8 dilde yabancı alıcılara ulaştırmak için EstateMarket24’e ön kayıt yap: ${page}`;
      share.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
      thanks.querySelector("[data-share-label]").textContent = role === "agent" ? "Meslektaşınızı davet edin" : "Tanıdıklarınızla paylaşın";
      form.hidden = true; thanks.hidden = false; thanks.focus();
      thanks.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    } catch (cause) {
      fail(cause.message && cause.message !== "Failed to fetch" ? cause.message : MSG.failed);
    } finally { submit.disabled = false; }
  });
})();
