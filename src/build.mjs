// Builds the static site into the repo root. Run: node src/build.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES = JSON.parse(fs.readFileSync(path.join(ROOT, "src/images.json"), "utf8"));
const SITE = "https://hancockandread.co.uk";
const TITLE_SUFFIX = "Hancock and Read | Designers &amp; Makers of Bespoke Furniture | Bespoke Furniture Fitting";
const VERSION = Date.now().toString(36);

const BIZ = {
  name: "Hancock &amp; Read Ltd",
  street: "Rugby Street",
  town: "Sheffield",
  postcode: "S3 9QH",
  tel: "0114 275 3918",
  telHref: "+441142753918",
  fax: "0114 272 7760",
  email: "info@hancockandread.co.uk",
  facebook: "https://www.facebook.com/pages/Hancock-Read/217795348321134",
  houzz: "https://www.houzz.co.uk/pro/hancock-read/hancock-read",
};

/* ---------- Images ---------- */
const DUPES = new Set(["img-3307-1", "img-3303-1", "img-3304-2", "img-3305", "img-3305-2", "img-3308"]);
const CATS = {
  kitchens: { label: "Kitchens", one: "Kitchen", page: "kitchen-gallery" },
  bedrooms: { label: "Bedrooms", one: "Bedroom", page: "bedroom-gallery" },
  bathrooms: { label: "Bathrooms", one: "Bathroom", page: "bathroom-gallery" },
  studys: { label: "Studies", one: "Study", page: "study-gallery" },
};
function catOf(slug, m) {
  if (slug === "img-3283") return "studys";
  return { kitchen: "kitchens", extra: "kitchens", bedroom: "bedrooms", bathroom: "bathrooms", study: "studys" }[m.cat];
}
const gallery = { kitchens: [], bedrooms: [], bathrooms: [], studys: [] };
Object.keys(IMAGES).sort().forEach((slug) => {
  if (DUPES.has(slug)) return;
  gallery[catOf(slug, IMAGES[slug])].push(slug);
});
// Lead each gallery with a strong image
const LEADS = {
  kitchens: ["img-3278", "img-4667-1", "img-3058", "nef-0189", "img-3307", "img-3431", "img-4670-1", "img-3344", "img-4680-1", "8252198-interior08-800-web"],
  bedrooms: ["img-3292", "img-5874", "img-3290", "img-3287"],
  bathrooms: ["img-3319", "img-2076"],
  studys: ["img-3268", "img-3283"],
};
for (const c in LEADS) {
  gallery[c] = [...LEADS[c].filter((s) => gallery[c].includes(s)), ...gallery[c].filter((s) => !LEADS[c].includes(s))];
}

const ALTS = {
  "img-3278": "Navy hand-painted kitchen with white stone island and bar stools, designed and made by Hancock &amp; Read",
  "img-4667-1": "Bespoke kitchen with a deep blue painted island and dresser on slate floor tiles",
  "img-3058": "Navy Shaker kitchen with a solid oak mantel over the hob and glazed display cabinet",
  "nef-0189": "Blue painted sink unit with Belfast sink and granite worktop against a reclaimed brick wall",
  "img-3307": "Painted dresser with lit glazed cabinets, open shelving and an oak worktop",
  "img-3431": "Long navy painted kitchen island with brushed steel bar handles",
  "img-4670-1": "Kitchen with a bright yellow painted island and built-in wine rack",
  "img-3344": "Classic cream in-frame kitchen with range cooker, mantel and marble-topped island",
  "img-4680-1": "Pale blue painted kitchen island with timber breakfast bar and wine cooler",
  "8252198-interior08-800-web": "Blue painted kitchen against an exposed brick wall with glazed wall cabinet",
  "img-3292": "Floor-to-ceiling fitted wardrobes and a built-in desk in a bright bedroom",
  "img-5874": "Illuminated walk-in wardrobe with glass shelving for shoes and handbags",
  "img-3290": "Fitted dressing table with mirror and matching chair",
  "img-3287": "Full-height panelled wardrobe doors in a soft grey paint finish",
  "img-3291": "Fitted wardrobes built around a sloping ceiling in a child's bedroom",
  "img-3319": "White bathroom vanity unit with twin basins and mirrored cabinets",
  "img-2076": "Walnut-framed bathroom mirror cabinet above a floating vanity unit",
  "img-3268": "Built-in home office with desk, shelving and storage",
  "img-3283": "Fitted study with a long desk and floor-to-ceiling shelving",
  "img-3270": "Stainless steel larder fridge and wine cooler set into navy tall cabinets",
  "img-3348": "Cream painted kitchen with a range cooker beneath a carved mantel",
  "img-3429": "Detail of hand-painted drawer fronts with long brushed steel handles",
};
function altFor(slug, cat, i) {
  if (ALTS[slug]) return ALTS[slug];
  const one = CATS[cat].one.toLowerCase();
  return `Bespoke ${one} furniture handmade in Sheffield by Hancock &amp; Read, photo ${i + 1}`;
}

function widths(slug) {
  const w = IMAGES[slug].w;
  return [640, 1280, 2000].map((s) => ({ file: s, w: Math.min(s, w) })).filter((x, i, a) => a.findIndex((y) => y.w === x.w) === i);
}
function dims(slug, target) {
  const m = IMAGES[slug];
  const w = Math.min(target, m.w);
  return { w, h: Math.round((m.h / m.w) * w) };
}
function src(p, slug, size = 1280) { return `${p}assets/img/${slug}-${size}.webp`; }
function img(p, slug, { alt = "", sizes = "100vw", eager = false, cls = "", attrs = "", base = 1280 } = {}) {
  const ws = widths(slug);
  const srcset = ws.map((x) => `${p}assets/img/${slug}-${x.file}.webp ${x.w}w`).join(", ");
  const d = dims(slug, base);
  return `<img src="${src(p, slug, base)}" srcset="${srcset}" sizes="${sizes}" width="${d.w}" height="${d.h}" alt="${alt}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${cls ? ` class="${cls}"` : ""}${attrs ? " " + attrs : ""}>`;
}

/* ---------- Icons ---------- */
const ICON = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20 12H4M10 6l-6 6 6 6"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z"/></svg>',
  houzz: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h4v5l8 2.3V21h-5v-6h-2v6H6z"/></svg>',
};

/* ---------- Navigation ---------- */
const MENU = [
  ["", "Home"],
  ["about/", "About"],
  ["what-we-do/", "Why Hancock &amp; Read?"],
  ["kitchens/", "Kitchens"],
  ["bedrooms/", "Bedrooms"],
  ["gallery/", "Gallery"],
  ["testimonials/", "Testimonials"],
  ["contact-us/", "Contact Us"],
];
const MENU_IMGS = ["img-3278", "img-3307", "img-3344", "img-4667-1", "img-3292", "img-4680-1", "img-3058", "nef-0189"];
const TOP = [["what-we-do/", "Why Us"], ["gallery/", "Gallery"], ["testimonials/", "Testimonials"], ["contact-us/", "Contact"]];

function header(p, route) {
  const cur = (r) => (r === route ? ' aria-current="page"' : "");
  return `
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="logo" href="${p || "./"}" aria-label="Hancock &amp; Read home">
      <img class="logo-light" src="${p}assets/brand/logo-nostrap-white.png" width="350" height="37" alt="Hancock &amp; Read">
      <img class="logo-dark" src="${p}assets/brand/logo-nostrap.png" width="350" height="37" alt="" aria-hidden="true">
    </a>
    <nav class="nav" aria-label="Main">
      <ul class="nav-links">
        ${TOP.map(([r, l]) => `<li><a href="${p}${r}"${cur(r)}>${l}</a></li>`).join("\n        ")}
      </ul>
      <a class="nav-phone" href="tel:${BIZ.telHref}">${BIZ.tel}</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu"><span class="label">Menu</span><span class="bars" aria-hidden="true"><i></i><i></i></span></button>
    </nav>
  </div>
</header>
<div class="menu" id="menu" aria-hidden="true" inert>
  <div class="menu-inner">
    <div>
      <ul class="menu-list">
        ${MENU.map(([r, l]) => `<li><a href="${p}${r || (p ? "" : "./")}"${cur(r)}>${l}</a></li>`).join("\n        ")}
      </ul>
      <div class="menu-sub">
        <a href="${p}bathrooms/">Bathrooms</a><a href="${p}studys/">Studies</a><a href="${p}kitchen-gallery/">Kitchen Gallery</a><a href="${p}bedroom-gallery/">Bedroom Gallery</a>
      </div>
    </div>
    <div class="menu-foot">
      <div><strong>Call</strong><a href="tel:${BIZ.telHref}">${BIZ.tel}</a></div>
      <div><strong>Email</strong><a href="mailto:${BIZ.email}">${BIZ.email}</a></div>
      <div><strong>Workshop</strong>${BIZ.street}, ${BIZ.town}, ${BIZ.postcode}</div>
    </div>
  </div>
  <div class="menu-media" aria-hidden="true">
    ${MENU_IMGS.map((s, i) => img(p, s, { sizes: "45vw", cls: i === 0 ? "is-active" : "", base: 1280 })).join("\n    ")}
  </div>
</div>`;
}

function footer(p) {
  return `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div class="footer-brand">
        <img class="footer-logo" src="${p}assets/brand/logogrey-white.png" width="450" height="96" alt="Hancock &amp; Read, bespoke furniture makers" loading="lazy">
        <p>Designers and makers of bespoke furniture. Handmade in our Sheffield workshop and fitted by the people who made it, since 1985.</p>
        <div class="socials">
          <a href="${BIZ.facebook}" target="_blank" rel="noopener" aria-label="Hancock &amp; Read on Facebook">${ICON.facebook}</a>
          <a href="${BIZ.houzz}" target="_blank" rel="noopener" aria-label="Hancock &amp; Read on Houzz">${ICON.houzz}</a>
        </div>
      </div>
      <div>
        <h3>Explore</h3>
        <ul>
          <li><a href="${p}about/">About</a></li>
          <li><a href="${p}what-we-do/">Why Hancock and Read?</a></li>
          <li><a href="${p}testimonials/">Testimonials</a></li>
          <li><a href="${p}gallery/">Gallery</a></li>
          <li><a href="${p}contact-us/">Contact Us</a></li>
        </ul>
      </div>
      <div>
        <h3>Our Work</h3>
        <ul>
          <li><a href="${p}kitchens/">Kitchens</a></li>
          <li><a href="${p}bedrooms/">Bedrooms</a></li>
          <li><a href="${p}bathrooms/">Bathrooms</a></li>
          <li><a href="${p}studys/">Studies</a></li>
          <li><a href="${p}kitchen-gallery/">Kitchen Gallery</a></li>
        </ul>
      </div>
      <div>
        <h3>Visit &amp; Call</h3>
        <address>${BIZ.name}<br>${BIZ.street},<br>${BIZ.town},<br>${BIZ.postcode}</address>
        <a class="footer-big" href="tel:${BIZ.telHref}">${BIZ.tel}</a>
        <p style="margin-top:8px">Fax: ${BIZ.fax}<br><a href="mailto:${BIZ.email}">${BIZ.email}</a></p>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; <span data-year>2026</span> ${BIZ.name}. All rights reserved.</span>
      <span><a href="${p}privacy-policy/">Privacy Policy</a></span>
    </div>
  </div>
</footer>`;
}

function crumbs(p, items) {
  return `<ol class="crumbs">${items.map(([r, l], i) => (i < items.length - 1 ? `<li><a href="${p}${r}">${l}</a></li>` : `<li aria-current="page">${l}</li>`)).join("")}</ol>`;
}

function pageHero(p, { h1, intro, image, alt, short, trail }) {
  return `
<section class="page-hero${short ? " page-hero--short" : ""}">
  ${image ? `<div class="hero-media">${img(p, image, { alt: alt || "", eager: true, base: 2000 })}</div>` : ""}
  <div class="wrap">
    ${trail ? crumbs(p, trail) : ""}
    <h1 class="split-lines">${h1}</h1>
    ${intro ? `<p>${intro}</p>` : ""}
  </div>
</section>`;
}

function cta(p, { title = "Talk to us about your project", text } = {}) {
  return `
<section class="cta section">
  <img class="cta-mono" src="${p}assets/brand/icon-512.png" width="512" height="512" alt="" aria-hidden="true" loading="lazy">
  <div class="wrap">
    <h2 class="split-lines" data-split>${title}</h2>
    <p>${text || "Call us or send a message and we'll arrange a time to talk through your ideas."}</p>
    <div class="cta-actions">
      <a class="btn btn--light" href="${p}contact-us/">Get in touch ${ICON.arrow}</a>
      <a class="btn btn--ghost" href="tel:${BIZ.telHref}">${ICON.phone} ${BIZ.tel}</a>
    </div>
  </div>
</section>`;
}

function tiles(p, slugs, { cat, sizes = "(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw", cursor = true } = {}) {
  return slugs.map((s, i) => {
    const c = cat || s.__cat;
    return `<a class="tile" href="${src(p, s, 2000)}" data-cat="${c}" data-label="${CATS[c].one}"${cursor ? ' data-cursor="View"' : ""}>${img(p, s, { alt: altFor(s, c, i), sizes, base: 640 })}</a>`;
  }).join("\n      ");
}

const LIGHTBOX = `
<div class="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer" aria-hidden="true">
  <div class="lb-stage"><img alt=""></div>
  <button class="lb-btn lb-close" type="button" aria-label="Close">${ICON.close}</button>
  <button class="lb-btn lb-prev" type="button" aria-label="Previous image">${ICON.left}</button>
  <button class="lb-btn lb-next" type="button" aria-label="Next image">${ICON.arrow}</button>
  <div class="lb-meta" aria-live="polite"></div>
</div>`;

/* ---------- Structured data ---------- */
function orgLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "@id": `${SITE}/#business`,
    name: "Hancock & Read Ltd",
    alternateName: "Hancock and Read",
    description: "Designers and makers of bespoke fitted and free-standing furniture: kitchens, bedrooms, bathrooms and studies, handmade in Sheffield since 1985.",
    url: `${SITE}/`,
    logo: `${SITE}/assets/brand/icon-512.png`,
    image: `${SITE}/assets/brand/og-image.jpg`,
    telephone: "+44 114 275 3918",
    faxNumber: "+44 114 272 7760",
    email: BIZ.email,
    foundingDate: "1985",
    address: { "@type": "PostalAddress", streetAddress: "Rugby Street", addressLocality: "Sheffield", postalCode: "S3 9QH", addressRegion: "South Yorkshire", addressCountry: "GB" },
    areaServed: ["Sheffield", "Dore", "Whirlow", "Hope Valley", "South Yorkshire", "Derbyshire", "Manchester", "Leicestershire", "Nottinghamshire"],
    sameAs: [BIZ.facebook, BIZ.houzz],
  };
}
function crumbLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([r, l], i) => ({ "@type": "ListItem", position: i + 1, name: l.replace(/&amp;/g, "&"), item: `${SITE}/${r}` })),
  };
}

/* ---------- Layout ---------- */
function layout({ route, title, description, body, hero = true, preload, ld = [], ogImage }) {
  const depth = route && !route.endsWith(".html") ? route.split("/").filter(Boolean).length : 0;
  const p = "../".repeat(depth);
  const canonical = `${SITE}/${route}`;
  const og = ogImage ? `${SITE}/assets/img/${ogImage}-1280.webp` : `${SITE}/assets/brand/og-image.jpg`;
  const pre = preload
    ? `<link rel="preload" as="image" href="${src(p, preload, 2000)}" imagesrcset="${widths(preload).map((x) => `${p}assets/img/${preload}-${x.file}.webp ${x.w}w`).join(", ")}" imagesizes="100vw" fetchpriority="high">`
    : "";
  return `<!doctype html>
<html lang="en-GB" class="${hero ? "" : "no-hero"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${canonical}">
<meta property="og:locale" content="en_GB">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Hancock &amp; Read">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1a1613">
<link rel="icon" href="${p}assets/brand/icon-32.png" sizes="32x32">
<link rel="icon" href="${p}assets/brand/icon-192.png" sizes="192x192">
<link rel="apple-touch-icon" href="${p}assets/brand/icon-180.png">
<link rel="preload" href="${p}assets/fonts/cormorant-garamond-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${p}assets/fonts/jost-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
${pre}
<link rel="stylesheet" href="${p}assets/css/site.css?v=${VERSION}">
<script>(function(d){var m=!matchMedia("(prefers-reduced-motion: reduce)").matches;d.className+=" js"+(m?" motion":"");try{if(m&&sessionStorage.getItem("hr-transition")==="1")d.className+=" arriving"}catch(e){}setTimeout(function(){if(!window.__hr)d.classList.remove("motion","arriving")},3500)})(document.documentElement)</script>
${[orgLd(), ...ld].map((x) => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join("\n")}
</head>
<body>
${body(p)}
<div class="curtain" aria-hidden="true"><img src="${p}assets/brand/icon-192.png" width="192" height="192" alt=""></div>
<script src="${p}assets/vendor/gsap.min.js" defer></script>
<script src="${p}assets/vendor/ScrollTrigger.min.js" defer></script>
<script src="${p}assets/vendor/SplitText.min.js" defer></script>
<script src="${p}assets/js/site.js?v=${VERSION}" defer></script>
</body>
</html>
`;
}

function shell(p, route, main) {
  return `${header(p, route)}
<main id="main">
${main}
</main>
${footer(p)}`;
}

/* ---------- Shared content ---------- */
const TESTIMONIALS = [
  {
    who: "Simon Jackson",
    where: "The Horse and Groom Village Inn",
    short: "From the very beginning you guided us through the design process with your honest, innovative and passionate style. The finished products are amazing.",
    salute: "Dear Mark",
    body: [
      "Please forgive me for not writing earlier to say how delighted Sally and I are with both our kitchen and office furniture. It doesn't seem possible that we started the process some 18 months ago when we paced around the shell of what was to become our new kitchen. From the very beginning you guided us through the design process with your honest, innovative and passionate style. The planning was meticulous and although at times we wavered from believing it, the finished products are amazing. We cannot speak highly enough of Nick and the boys for the quality of the manufacture, installation and the manner in which they undertook the project.",
      "As you know, our kitchen and office are very important to us as we spend most of our time in them. They are almost one year old now, still look the same as the day they were installed and we sit here and admire them. We are the envy of so many of our friends! It truly is a bespoke service and product that you offer.",
      "A huge thank you for your patience and expertise.",
    ],
  },
  {
    who: "Steve Manley",
    where: "Director, Universal Office Products",
    short: "The quality of the workmanship your organisation provides is to the highest possible standard and the level of personal customer service is fantastic.",
    salute: "Dear Mr Read",
    body: [
      "I just wanted to drop you a quick line to congratulate you on the service levels your company provides. The quality of the workmanship your organisation provides is to the highest possible standard and the level of personal customer service is fantastic. I have worked with several members of your team; in particular I have worked recently with Nick on a few projects. His attention to details, dedication and professionalism are all excellent, so please pass on my thanks.",
      "Overall I would have no hesitation whatsoever in recommending your services to any of my friends, family or clients. I look forward to working with Hancock and Read in the future.",
    ],
  },
  {
    who: "Eric Baines",
    where: "Kitchens, wardrobes &amp; bathroom",
    short: "Mark's knowledge and help is exemplary, and the fitting crew have always been punctual, respectful and most of all insistent on cleaning up after finishing the job.",
    salute: "",
    body: [
      "Having used Hancock &amp; Read on several occasions I would have no problem in recommending them to anyone.",
      "Over the last 6 years or so, we have utilised the design and installation service for kitchens, utility room, fitted wardrobes and bathroom refurbishment. Mark's knowledge and help is exemplary, and the fitting crew have always been punctual, respectful and most of all insistent on cleaning up after finishing the job.",
      "Thank you for helping us add value to our property.",
    ],
  },
];

function quoteSlider() {
  return `
<section class="section">
  <div class="wrap">
    <div class="cols-2">
      <div>
        <h2 class="h-l split-lines" data-split style="margin-top:18px">What our customers say</h2>
      </div>
      <div class="quotes" data-reveal>
        <span class="quote-mark" aria-hidden="true">&ldquo;</span>
        <div class="quote-slides" aria-live="polite">
          ${TESTIMONIALS.map((t, i) => `<figure class="quote${i === 0 ? " is-active" : ""}"><blockquote>${t.short}</blockquote><figcaption>${t.who}<span>${t.where}</span></figcaption></figure>`).join("\n          ")}
        </div>
        <div class="quote-nav">
          <button class="q-prev" type="button" aria-label="Previous testimonial">${ICON.left}</button>
          <button class="q-next" type="button" aria-label="Next testimonial">${ICON.arrow}</button>
          <span class="quote-count">1 / ${TESTIMONIALS.length}</span>
          <span class="quote-bar" aria-hidden="true"><i></i></span>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

const AREAS = ["Sheffield", "Dore", "Whirlow", "Hope Valley", "South Yorkshire", "Derbyshire", "Manchester", "Leicestershire", "<em>Nottinghamshire</em>"];

/* ---------- Pages ---------- */
const pages = [];

/* Home */
pages.push({
  route: "",
  title: TITLE_SUFFIX,
  description: "Bespoke kitchens, bedrooms, bathrooms and studies, designed and handmade in our Sheffield workshop since 1985 and fitted by the craftsmen who made them.",
  preload: "img-3278",
  body: (p) => shell(p, "", `
<div class="loader" aria-hidden="true">
  <div class="loader-inner">
    <img class="loader-logo" src="${p}assets/brand/logo-nostrap.png" width="350" height="37" alt="">
    <span class="loader-line"><i></i></span>
    <span class="loader-tag">Bespoke furniture makers</span>
  </div>
</div>
<section class="hero">
  <div class="hero-media">${img(p, "img-3278", { alt: ALTS["img-3278"], eager: true, base: 2000 })}</div>
  <div class="hero-content wrap">
    <h1 class="split-lines">Bespoke furniture, <em>made by hand</em> in Sheffield</h1>
    <div class="hero-bottom">
      <p>Kitchens, bedrooms, bathrooms and studies, designed in our studio, built in our own workshop and fitted by the same craftsmen who made them.</p>
      <div class="hero-actions">
        <a class="btn" href="${p}gallery/">See our work ${ICON.arrow}</a>
        <a class="btn btn--ghost" href="${p}contact-us/">Book a consultation</a>
      </div>
    </div>
  </div>
  <span class="scroll-cue" aria-hidden="true">Scroll</span>
</section>

<div class="marquee" aria-hidden="true">
  <div class="marquee-track">
    ${[0, 1].map(() => ["Kitchens", "Bedrooms", "Bathrooms", "Studies", "Alcove furniture", "Home bars", "Media walls", "Dressers", "Wardrobes"].map((w) => `<span>${w}</span><span class="amp">&amp;</span>`).join("")).join("")}
  </div>
</div>

<section class="section">
  <div class="wrap">
    <div>
      <p class="statement" data-words>We design your furniture, make it in our own workshop in Sheffield, and the craftsmen who made it come and fit it in your home.</p>
      <div style="margin-top:48px" data-reveal><a class="link-line" href="${p}what-we-do/">Why Hancock &amp; Read ${ICON.arrow}</a></div>
    </div>
  </div>
</section>

<section class="section tone">
  <div class="wrap split">
    <div class="split-media">
      <div class="frame frame--tall" data-reveal-img>${img(p, "nef-0189", { alt: ALTS["nef-0189"], sizes: "(max-width: 900px) 100vw, 50vw", attrs: 'data-speed="0.08"' })}</div>
      <div class="badge" aria-hidden="true">
        <svg viewBox="0 0 100 100"><defs><path id="c" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0"/></defs><text font-size="8.6" letter-spacing="2.6" fill="currentColor" font-family="Jost, sans-serif"><textPath href="#c">HANDMADE IN SHEFFIELD SINCE </textPath></text></svg>
        <b>1985</b>
      </div>
    </div>
    <div class="split-copy">
      <h2 class="h-l split-lines" data-split>About us</h2>
      <div class="lede" data-reveal>
        <p>Hancock &amp; Read have provided a prestigious design and making service for decades, and are renowned around Dore, Whirlow, Hope Valley and across South Yorkshire and Derbyshire for quality residential and commercial furniture.</p>
        <p>We started in 1985 handcrafting bars, reception desks and shop interiors. As the demand for kitchens and bedrooms grew, so did our workshop, which now houses our own design studio.</p>
      </div>
      <div data-reveal><a class="link-line" href="${p}about/">Our story ${ICON.arrow}</a></div>
    </div>
  </div>
</section>

<section class="process dark" id="process">
  <div class="section" style="padding-bottom:clamp(80px,10vw,140px)">
    <div class="wrap process-head">
      <div>
        <h2 class="h-l split-lines" data-split style="margin-top:18px">From design to fitting</h2>
      </div>
      <p class="lede" data-reveal style="max-width:26em">The same team looks after your project from the first visit to the final fitting.</p>
    </div>
    <div class="process-track">
      ${[
        ["01", "Design", "We visit, measure up and talk through what you want. Our in-house design studio then draws up your furniture.", "img-3344"],
        ["02", "Make", "Everything is built in our Sheffield workshop the traditional way, with mortise and tenon joints, in hardwoods, veneers, stone, glass and metal.", "img-3429"],
        ["03", "Fit", "The craftsmen who made your furniture are the ones who fit it in your home.", "img-3058"],
        ["04", "Live with it", "The majority of our projects come from repeat customers or recommendation.", "img-3307"],
      ].map(([n, h, t, s]) => `<article class="step">
        <div class="frame">${img(p, s, { alt: ALTS[s] || "", sizes: "(max-width: 900px) 100vw, 560px" })}</div>
        <span class="step-num">${n}</span>
        <h3>${h}</h3>
        <p>${t}</p>
      </article>`).join("\n      ")}
    </div>
    <div class="process-progress" aria-hidden="true"><i></i></div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <h2 class="h-l split-lines" data-split>What we make</h2>
      </div>
      <p data-reveal>From ultra modern to traditional, we can make something that blends in with your existing furniture or intentionally contrasts against it.</p>
    </div>
    <div class="rooms">
      ${[
        ["kitchens/", "Kitchens", "img-4667-1", "Islands, dressers &amp; larders"],
        ["bedrooms/", "Bedrooms", "img-3292", "Wardrobes &amp; dressing rooms"],
        ["bathrooms/", "Bathrooms", "img-3319", "Vanity units &amp; storage"],
        ["studys/", "Studies", "img-3268", "Desks, shelving &amp; libraries"],
      ].map(([r, h, s, sub]) => `<a class="room" href="${p}${r}" data-reveal data-cursor="Explore">
        ${img(p, s, { alt: ALTS[s], sizes: "(max-width: 760px) 100vw, 60vw" })}
        <div class="room-body"><div><small>${sub}</small><h3>${h}</h3></div><span class="arrow" aria-hidden="true">${ICON.arrow}</span></div>
      </a>`).join("\n      ")}
    </div>
    <div class="also" data-reveal>
      <a class="chip" href="${p}what-we-do/">Alcove furniture</a>
      <a class="chip" href="${p}what-we-do/">Console &amp; coffee tables</a>
      <a class="chip" href="${p}what-we-do/">AV cabinets &amp; media suites</a>
      <a class="chip" href="${p}what-we-do/">Home bars</a>
      <a class="chip" href="${p}what-we-do/">Room dividers</a>
      <a class="chip" href="${p}what-we-do/">TV lifts &amp; much more</a>
    </div>
  </div>
</section>

<section class="section--tight">
  <div class="wrap">
    <div class="stats">
      <div class="stat" data-reveal><b data-count="1985" data-from="1900">1985</b><span>The year we opened our workshop doors in Sheffield</span></div>
      <div class="stat" data-reveal><b data-count="40" data-suffix="+">40+</b><span>Years designing, making and fitting</span></div>
      <div class="stat" data-reveal><b data-count="100" data-suffix="%">100%</b><span>Made in our own Sheffield workshop</span></div>
    </div>
  </div>
</section>

<section class="columns-band" aria-labelledby="lwys">
  <div class="columns" aria-hidden="true">
    ${[["img-3431", "img-4670-1", "img-3290", "img-3270"], ["img-3307", "img-5874", "img-3058", "img-4680-1", "img-2076"], ["img-3344", "8252198-interior08-800-web", "img-3283", "img-3348"]]
      .map((col) => `<div class="col">${col.map((s) => `<div class="frame">${img(p, s, { alt: "", sizes: "(max-width: 700px) 50vw, 33vw", base: 640 })}</div>`).join("")}</div>`).join("\n    ")}
  </div>
  <div class="columns-overlay">
    <div>
      <h2 id="lwys" class="split-lines" data-split>Like what you see?</h2>
      <a class="btn btn--light" href="${p}gallery/">Explore the gallery ${ICON.arrow}</a>
    </div>
  </div>
</section>

${quoteSlider()}

<section class="section tone">
  <div class="wrap">
    <ul class="areas" data-reveal>${AREAS.map((a) => `<li>${a}</li>`).join("")}</ul>
    <p class="lede" style="margin-top:32px" data-reveal>Word of mouth now takes us to Manchester, Leicestershire and Nottinghamshire as well as Sheffield and the surrounding area.</p>
  </div>
</section>

${cta(p)}`),
});

/* About */
pages.push({
  route: "about/",
  title: `About | ${TITLE_SUFFIX}`,
  description: "Founded in Sheffield in 1985, Hancock & Read design, handmake and fit bespoke furniture. Read the story of our workshop, our design studio and our craftsmen.",
  preload: "img-3058",
  ld: [crumbLd([["", "Home"], ["about/", "About"]])],
  body: (p) => shell(p, "about/", `
${pageHero(p, { h1: "About Hancock &amp; Read", intro: "Designers and makers of bespoke furniture for homes and businesses across South Yorkshire, Derbyshire and beyond.", image: "img-3058", alt: ALTS["img-3058"], trail: [["", "Home"], ["about/", "About"]] })}

<section class="section">
  <div class="wrap">
    <div>
      <p class="statement" data-words>The people who make your furniture are the people who fit it, and it has been that way since 1985.</p>
    </div>
  </div>
</section>

<section class="section tone">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <h2 class="h-l split-lines" data-split>Our history</h2>
      </div>
    </div>
    <ol class="timeline">
      <li data-reveal><span class="yr">1985</span><div><h3>Where it began</h3><p>Hancock &amp; Read was founded to serve the commercial sector, handcrafting and fitting bars, reception desks and specialist shop interiors.</p></div></li>
      <li data-reveal><span class="yr">Home</span><div><h3>Into people's homes</h3><p>We soon realised our potential to create beautiful fitted furniture for the home. As the demand for kitchens and bedrooms grew, so did our workshop.</p></div></li>
      <li data-reveal><span class="yr">Studio</span><div><h3>Design under one roof</h3><p>Our Sheffield workshop now houses its own design studio, so the people drawing your furniture work alongside the people making it.</p></div></li>
      <li data-reveal><span class="yr">Today</span><div><h3>Further afield</h3><p>The majority of our projects come from repeat customers or recommendation. Word of mouth now takes us to Manchester, Leicestershire and Nottinghamshire, as well as Dore, Whirlow, Hope Valley and across South Yorkshire and Derbyshire.</p></div></li>
    </ol>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div class="split-media"><div class="frame frame--tall" data-reveal-img>${img(p, "img-3429", { alt: ALTS["img-3429"], sizes: "(max-width: 900px) 100vw, 50vw", attrs: 'data-speed="0.08"' })}</div></div>
    <div class="split-copy">
      <h2 class="h-l split-lines" data-split>How we work</h2>
      <div class="features" style="grid-template-columns:1fr;margin-top:36px">
        <div class="feature" data-reveal><span class="n">i.</span><h3>Made here</h3><p>Every piece is made in our own workshop on Rugby Street in Sheffield.</p></div>
        <div class="feature" data-reveal><span class="n">ii.</span><h3>Fitted by the makers</h3><p>The craftsmen who build your furniture are the ones who install it.</p></div>
        <div class="feature" data-reveal><span class="n">iii.</span><h3>Made the traditional way</h3><p>Traditional mortise and tenon construction, with a wide choice of woods, colours, door fronts, worktops and handles.</p></div>
      </div>
    </div>
  </div>
</section>

${quoteSlider()}
${cta(p)}`),
});

/* What we do */
pages.push({
  route: "what-we-do/",
  title: `Why Hancock and Read? | ${TITLE_SUFFIX}`,
  description: "Handmade in-frame and face-fixed Shaker furniture built with mortise and tenon joints. Kitchens, bedrooms, bathrooms, studies, alcoves, home bars, AV cabinets and more.",
  preload: "img-3431",
  ld: [crumbLd([["", "Home"], ["what-we-do/", "Why Hancock and Read?"]])],
  body: (p) => shell(p, "what-we-do/", `
${pageHero(p, { h1: "Why Hancock &amp; Read?", intro: "We specialise in both free-standing and fitted handmade furniture of superior quality, from ultra modern to traditional.", image: "img-3431", alt: ALTS["img-3431"], trail: [["", "Home"], ["what-we-do/", "Why Hancock and Read?"]] })}

<section class="section">
  <div class="wrap split">
    <div class="split-copy">
      <h2 class="h-l split-lines" data-split>Our speciality</h2>
      <div class="lede" data-reveal>
        <p>We are widely appreciated for our skill at handcrafting quality 'In Frame' and 'Face Fixed' Shaker style furniture, constructed the traditional way with mortise and tenon joints. Every project is a one-off, as everything is made to suit your taste.</p>
        <p>With a wide range of woods, colours, door fronts, worktops and handles to choose from, your space can be truly unique.</p>
      </div>
    </div>
    <div class="split-media"><div class="frame frame--tall" data-reveal-img>${img(p, "img-3307", { alt: ALTS["img-3307"], sizes: "(max-width: 900px) 100vw, 50vw", attrs: 'data-speed="0.08"' })}</div></div>
  </div>
</section>

<section class="section dark">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <h2 class="h-l split-lines" data-split>Materials</h2>
      </div>
      <p data-reveal>We take pride in our skill at incorporating many materials within our design and manufacture, so we can make something that blends in sympathetically with your existing furniture, or intentionally contrasts against it.</p>
    </div>
    <div class="features">
      ${[["Hardwoods", "Oak, walnut and other solid timbers for mantels, worktops, frames and freestanding pieces."], ["Veneer boards", "Beautiful figured veneers for large, stable panels and contemporary finishes."], ["Stone", "Granite, marble and composite worktops, templated and fitted to your furniture."], ["Glass", "Glazed dressers and display cabinets, often lit from within."], ["Acrylic", "Clean, modern surfaces where a painted or timber finish isn't right."], ["Metal", "Brushed steel, brass and nickel for handles, rails and details."]]
        .map(([h, t], i) => `<div class="feature" data-reveal><span class="n">0${i + 1}</span><h3>${h}</h3><p>${t}</p></div>`).join("\n      ")}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap cols-2">
    <div>
      <h2 class="h-l split-lines" data-split style="margin-top:18px">Our work includes</h2>
      <p class="lede" data-reveal style="margin-top:28px">Our services have included kitchens, offices, bedrooms, bathrooms, commercial projects and much, much more.</p>
    </div>
    <ul class="list-lines" data-reveal>
      <li><a href="${p}kitchens/"><span>Kitchens</span><small>View</small></a></li>
      <li><a href="${p}bedrooms/"><span>Bedrooms</span><small>View</small></a></li>
      <li><a href="${p}bathrooms/"><span>Bathrooms</span><small>View</small></a></li>
      <li><a href="${p}studys/"><span>Studies</span><small>View</small></a></li>
      <li>Alcove furniture</li>
      <li>Console &amp; coffee tables</li>
      <li>AV cabinets &amp; multi-media suites</li>
      <li>Home bars</li>
      <li>Room dividers</li>
      <li>TV lifts &amp; much more</li>
    </ul>
  </div>
</section>

${cta(p)}`),
});

/* Testimonials */
pages.push({
  route: "testimonials/",
  title: `Testimonials | ${TITLE_SUFFIX}`,
  description: "Read what our customers say about Hancock & Read's bespoke kitchens, wardrobes, bathrooms and office furniture, and the craftsmen who made and fitted them.",
  preload: "img-3344",
  ld: [crumbLd([["", "Home"], ["testimonials/", "Testimonials"]])],
  body: (p) => shell(p, "testimonials/", `
${pageHero(p, { h1: "Testimonials", intro: "Please read our testimonials for an idea of the quality of the craftsmanship we can, and do, provide for our customers.", image: "img-3344", alt: ALTS["img-3344"], short: true, trail: [["", "Home"], ["testimonials/", "Testimonials"]] })}
<section class="section">
  <div class="wrap">
    ${TESTIMONIALS.map((t, i) => `<article class="letter">
      <div class="letter-who" data-reveal><span class="n">0${i + 1}</span><h2>${t.who}</h2><p>${t.where}</p></div>
      <div class="letter-body" data-reveal>
        ${t.salute ? `<p class="salute">${t.salute}</p>` : ""}
        ${t.body.map((b) => `<p>${b}</p>`).join("\n        ")}
      </div>
    </article>`).join("\n    ")}
  </div>
</section>
${cta(p, { title: "Talk to us about your project" })}`),
});

/* Room pages */
const ROOMS = [
  {
    route: "kitchens/", name: "Kitchens", cat: "kitchens", hero: "img-4667-1",
    title: `Kitchens | ${TITLE_SUFFIX}`,
    description: "Bespoke handmade kitchens designed, built and fitted by Hancock & Read in Sheffield. In-frame Shaker, painted and contemporary kitchens, islands and dressers.",
    h1: "Bespoke Kitchens",
    intro: "Every kitchen is designed for your room and built in our Sheffield workshop.",
    lead: "Kitchens made for your home",
    copy: [
      "Every kitchen we make is designed around your room and the way you use it, whether that's a beamed farmhouse, a period terrace or a new open-plan extension.",
      "Choose from traditional in-frame and face-fixed Shaker doors built with mortise and tenon joints, or something cleaner and more contemporary. We hand-finish in any colour, and combine timber, stone, glass and metal to suit.",
    ],
    feats: [["Islands &amp; breakfast bars", "Islands with seating, storage, wine racks and integrated appliances, sized to your space."], ["Dressers &amp; display", "Glazed cabinets, open shelving and lit display dressers."], ["Worktops &amp; details", "Stone, timber and composite worktops, carved mantels and the handles and hardware to finish."]],
    feature: "img-3344",
  },
  {
    route: "bedrooms/", name: "Bedrooms", cat: "bedrooms", hero: "img-3292",
    title: `Bedrooms | ${TITLE_SUFFIX}`,
    description: "Bespoke fitted bedroom furniture handmade in Sheffield: fitted wardrobes, dressing tables, walk-in wardrobes and storage built around eaves and alcoves.",
    h1: "Fitted Bedrooms",
    intro: "Wardrobes, dressing tables and storage built to fit your room exactly.",
    lead: "Made to fit your room",
    copy: [
      "Fitted furniture makes the most of sloping ceilings, chimney breasts and alcoves, where off-the-shelf furniture won't fit.",
      "We design floor-to-ceiling wardrobes, dressing tables and walk-in dressing rooms, then build them in our workshop and fit them ourselves.",
    ],
    feats: [["Fitted wardrobes", "Floor-to-ceiling, panelled or plain, with interiors planned around what you need to store."], ["Dressing tables", "Matching dressing tables and mirrors, built in or free-standing."], ["Walk-in &amp; lit storage", "Dressing rooms and illuminated display wardrobes for shoes, bags and favourite pieces."]],
    feature: "img-5874",
  },
  {
    route: "bathrooms/", name: "Bathrooms", cat: "bathrooms", hero: "img-3319",
    title: `Bathrooms | ${TITLE_SUFFIX}`,
    description: "Bespoke bathroom furniture handmade in Sheffield by Hancock & Read: vanity units, mirrored cabinets and fitted bathroom storage built to suit your space.",
    h1: "Bathroom Furniture",
    intro: "Vanity units, mirrored cabinets and fitted storage that make the most of every bathroom, ensuite and cloakroom.",
    lead: "Bathroom furniture made to fit",
    copy: [
      "We design vanity units, cabinets and storage to suit the room and the way you use it, from twin-basin family bathrooms to compact ensuites.",
      "Each piece is made in our Sheffield workshop and finished to cope with a working bathroom, then fitted by the same craftsmen who built it.",
    ],
    feats: [["Vanity units", "Single and twin basin units with drawers and cupboards made to fit."], ["Mirrors &amp; cabinets", "Framed mirrors and mirrored cabinets in painted finishes or rich hardwoods."], ["Fitted storage", "Built-in cupboards and shelving, including under eaves and in alcoves."]],
    feature: "img-2076",
  },
  {
    route: "studys/", name: "Studies", cat: "studys", hero: "img-3268",
    title: `Studys | ${TITLE_SUFFIX}`,
    description: "Bespoke studies and home offices handmade in Sheffield by Hancock & Read: fitted desks, bookcases, shelving and storage designed around the way you work.",
    h1: "Studies &amp; Home Offices",
    intro: "Fitted desks, bookcases and storage for home offices and studies.",
    lead: "A study made for the way you work",
    copy: [
      "We design desks, shelving and storage around your room and the way you work, with space for cables, files and equipment.",
      "From traditional panelled libraries to clean, contemporary home offices, every piece is made in our Sheffield workshop and fitted by our own craftsmen.",
    ],
    feats: [["Fitted desks", "Desks built to the right height and depth, with drawers and cable management."], ["Shelving &amp; bookcases", "Floor-to-ceiling shelving and alcove bookcases for books, files and favourite things."], ["Hidden storage", "Cupboards for printers, paperwork and everything else you'd rather not look at."]],
    feature: "img-3283",
  },
];
for (const r of ROOMS) {
  const imgs = gallery[r.cat];
  pages.push({
    route: r.route, title: r.title, description: r.description, preload: r.hero, ogImage: r.hero,
    ld: [crumbLd([["", "Home"], ["what-we-do/", "Our Work"], [r.route, r.name]])],
    body: (p) => shell(p, r.route, `
${pageHero(p, { h1: r.h1, intro: r.intro, image: r.hero, alt: ALTS[r.hero], trail: [["", "Home"], ["what-we-do/", "Our Work"], [r.route, r.name]] })}

<section class="section">
  <div class="wrap split">
    <div class="split-copy">
      <h2 class="h-l split-lines" data-split>${r.lead}</h2>
      <div class="lede" data-reveal>${r.copy.map((c) => `<p>${c}</p>`).join("")}</div>
      <div data-reveal><a class="btn" href="${p}contact-us/">Get in touch ${ICON.arrow}</a></div>
    </div>
    <div class="split-media"><div class="frame frame--tall" data-reveal-img>${img(p, r.feature, { alt: ALTS[r.feature], sizes: "(max-width: 900px) 100vw, 50vw", attrs: 'data-speed="0.08"' })}</div></div>
  </div>
</section>

<section class="section dark">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <h2 class="h-l split-lines" data-split>What we make</h2>
      </div>
    </div>
    <div class="features">
      ${r.feats.map(([h, t], i) => `<div class="feature" data-reveal><span class="n">0${i + 1}</span><h3>${h}</h3><p>${t}</p></div>`).join("\n      ")}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="sec-head">
      <div>
        <h2 class="h-l split-lines" data-split>Recent ${r.name.toLowerCase()}</h2>
      </div>
      <a class="link-line" href="${p}${CATS[r.cat].page}/" data-reveal>View the ${CATS[r.cat].one.toLowerCase()} gallery ${ICON.arrow}</a>
    </div>
    <div class="preview-grid">
      ${tiles(p, imgs.slice(0, Math.min(imgs.length, 5)), { cat: r.cat, sizes: "(max-width: 760px) 50vw, 25vw" })}
    </div>
  </div>
</section>
${LIGHTBOX}
${cta(p)}`),
  });
}

/* Galleries */
const GALLERY_PAGES = [
  { route: "gallery/", name: "Gallery", h1: "Gallery", cats: ["kitchens", "bedrooms", "bathrooms", "studys"], hero: "img-4680-1",
    description: "Browse our gallery of bespoke kitchens, bedrooms, bathrooms and studies, all designed, handmade and fitted by Hancock & Read in Sheffield." },
  { route: "kitchen-gallery/", name: "Kitchen Gallery", h1: "Kitchen Gallery", cats: ["kitchens"], hero: "img-3278",
    description: "A gallery of bespoke handmade kitchens by Hancock & Read: painted Shaker, in-frame and contemporary kitchens, islands and dressers, made in Sheffield." },
  { route: "bedroom-gallery/", name: "Bedroom Gallery", h1: "Bedroom Gallery", cats: ["bedrooms"], hero: "img-3287",
    description: "A gallery of bespoke fitted bedroom furniture by Hancock & Read: fitted wardrobes, dressing tables and walk-in wardrobes, handmade in Sheffield." },
  { route: "bathroom-gallery/", name: "Bathroom Gallery", h1: "Bathroom Gallery", cats: ["bathrooms"], hero: "img-3319",
    description: "A gallery of bespoke bathroom furniture by Hancock & Read: vanity units, mirrored cabinets and fitted storage, handmade in Sheffield." },
  { route: "study-gallery/", name: "Study Gallery", h1: "Study Gallery", cats: ["studys"], hero: "img-3268",
    description: "A gallery of bespoke studies and home offices by Hancock & Read: fitted desks, shelving and storage, handmade in Sheffield." },
];
for (const g of GALLERY_PAGES) {
  const all = g.cats.length > 1;
  let list = [];
  if (all) {
    // interleave categories so the first screen shows variety
    const pools = g.cats.map((c) => gallery[c].map((s) => ({ s, c })));
    while (pools.some((x) => x.length)) for (const pool of pools) { for (let k = 0; k < (pool[0] && pool[0].c === "kitchens" ? 3 : 1); k++) if (pool.length) list.push(pool.shift()); }
  } else list = gallery[g.cats[0]].map((s) => ({ s, c: g.cats[0] }));
  const total = list.length;
  const trail = all ? [["", "Home"], ["gallery/", "Gallery"]] : [["", "Home"], ["gallery/", "Gallery"], [g.route, g.name]];
  pages.push({
    route: g.route, title: `${g.name} | ${TITLE_SUFFIX}`, description: g.description, preload: g.hero, ogImage: g.hero,
    ld: [crumbLd(trail)],
    body: (p) => shell(p, g.route, `
${pageHero(p, { h1: g.h1, intro: all ? "A selection of the kitchens, bedrooms, bathrooms and studies we've designed, made and fitted." : `${total} photographs of ${CATS[g.cats[0]].label.toLowerCase()} we've designed, made and fitted.`, image: g.hero, alt: ALTS[g.hero], short: true, trail })}
<section class="section">
  <div class="wrap">
    <div class="filters" role="${all ? "group" : "navigation"}" aria-label="${all ? "Filter gallery" : "Galleries"}">
      ${all
        ? `<button type="button" data-filter="all" aria-pressed="true">All<sup>${total}</sup></button>` + Object.keys(CATS).map((c) => `<button type="button" data-filter="${c}" aria-pressed="false">${CATS[c].label}<sup>${gallery[c].length}</sup></button>`).join("")
        : `<a href="${p}gallery/">All</a>` + Object.keys(CATS).map((c) => `<a href="${p}${CATS[c].page}/"${c === g.cats[0] ? ' aria-current="page"' : ""}>${CATS[c].label}<sup>${gallery[c].length}</sup></a>`).join("")}
    </div>
    <div class="masonry">
      ${list.map(({ s, c }, i) => `<a class="tile" href="${src(p, s, 2000)}" data-cat="${c}" data-label="${CATS[c].one}" data-cursor="View">${img(p, s, { alt: altFor(s, c, i), sizes: "(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw", base: 640 })}</a>`).join("\n      ")}
    </div>
    ${total > 24 ? `<div class="masonry-more"><button class="btn" type="button">Load more ${ICON.arrow}</button></div>` : ""}
  </div>
</section>
${LIGHTBOX}
${cta(p, { title: "Like what you see?", text: "Everything in our gallery was designed, made and fitted by our own team." })}`),
  });
}

/* Contact */
pages.push({
  route: "contact-us/",
  title: `Contact Us | ${TITLE_SUFFIX}`,
  description: "Contact Hancock & Read, Rugby Street, Sheffield S3 9QH. Call 0114 275 3918 or send us a message to discuss your bespoke kitchen, bedroom, bathroom or study.",
  preload: "img-3307",
  ld: [crumbLd([["", "Home"], ["contact-us/", "Contact Us"]])],
  body: (p) => shell(p, "contact-us/", `
${pageHero(p, { h1: "Contact Us", intro: "Tell us about your project and we'll get back to you, or give us a call.", image: "img-3307", alt: ALTS["img-3307"], short: true, trail: [["", "Home"], ["contact-us/", "Contact Us"]] })}
<section class="section">
  <div class="wrap contact-grid">
    <div class="contact-card">
      <div data-reveal><h3>Call us</h3><div class="big"><a href="tel:${BIZ.telHref}">${BIZ.tel}</a></div><p style="margin-top:6px;color:var(--ink-soft)">Fax: ${BIZ.fax}</p></div>
      <div data-reveal><h3>Email</h3><div class="big" style="font-size:clamp(1.4rem,2.2vw,2rem)"><a href="mailto:${BIZ.email}">${BIZ.email}</a></div></div>
      <div data-reveal><h3>Workshop &amp; studio</h3><address>${BIZ.name}<br>${BIZ.street},<br>${BIZ.town},<br>${BIZ.postcode}</address></div>
      <div data-reveal><h3>Follow</h3><div class="socials" style="margin-top:0">
        <a href="${BIZ.facebook}" target="_blank" rel="noopener" aria-label="Facebook" style="box-shadow:inset 0 0 0 1px var(--line)">${ICON.facebook}</a>
        <a href="${BIZ.houzz}" target="_blank" rel="noopener" aria-label="Houzz" style="box-shadow:inset 0 0 0 1px var(--line)">${ICON.houzz}</a>
      </div></div>
    </div>
    <div>
      <h2 class="h-m split-lines" data-split style="margin-bottom:36px">Send us a message</h2>
      <form class="form" id="enquiry" data-mailto="${BIZ.email}" data-endpoint="" novalidate data-reveal>
        <div class="field"><label for="f-name">Name</label><input id="f-name" name="name" autocomplete="name" required><span class="bar"></span></div>
        <div class="field"><label for="f-email">Email Address</label><input id="f-email" name="email" type="email" autocomplete="email" required><span class="bar"></span></div>
        <div class="field"><label for="f-phone">Telephone</label><input id="f-phone" name="phone" type="tel" autocomplete="tel"><span class="bar"></span></div>
        <div class="field"><label for="f-room">I'm interested in</label><select id="f-room" name="room"><option>A kitchen</option><option>A bedroom</option><option>A bathroom</option><option>A study</option><option>Something else</option></select><span class="bar"></span></div>
        <div class="field field--full"><label for="f-msg">Message</label><textarea id="f-msg" name="message" required></textarea><span class="bar"></span></div>
        <div class="hp" aria-hidden="true"><label for="f-web">Website</label><input id="f-web" name="website" tabindex="-1" autocomplete="off"></div>
        <p class="form-note">We'll only use your details to reply to your enquiry. See our <a href="${p}privacy-policy/" style="text-decoration:underline">privacy policy</a>.</p>
        <div><button class="btn" type="submit">Send message ${ICON.arrow}</button></div>
        <p class="form-status" role="status"></p>
      </form>
    </div>
  </div>
</section>
<section class="map" aria-label="Map showing Hancock &amp; Read on Rugby Street, Sheffield">
  <iframe title="Hancock &amp; Read on Google Maps" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Hancock%20%26%20Read%20Ltd%2C%20Rugby%20Street%2C%20Sheffield%20S3%209QH&amp;z=15&amp;output=embed"></iframe>
</section>`),
});

/* Privacy */
pages.push({
  route: "privacy-policy/",
  title: `Privacy Policy | ${TITLE_SUFFIX}`,
  description: "How Hancock & Read Ltd collects, uses and protects personal data submitted through this website.",
  hero: false,
  ld: [crumbLd([["", "Home"], ["privacy-policy/", "Privacy Policy"]])],
  body: (p) => shell(p, "privacy-policy/", `
${pageHero(p, { h1: "Privacy Policy", short: true, trail: [["", "Home"], ["privacy-policy/", "Privacy Policy"]] })}
<section class="section">
  <div class="wrap">
    <div class="prose">
      <h2>Who we are</h2>
      <p>Our website address is: https://hancockandread.co.uk.</p>
      <p>We are based at:<br>${BIZ.name}<br>${BIZ.street},<br>${BIZ.town},<br>${BIZ.postcode}<br>Tel: ${BIZ.tel}<br>Fax: ${BIZ.fax}</p>
      <h2>What personal data we collect and why we collect it</h2>
      <h3>Contact forms</h3>
      <p>If you complete our contact form it comes to our team via email. Only ourselves and our web server team ever have access to this data and it will not be passed on to any third party. Any emails will remain on our system as per direct emails. If you would like these deleted please contact <a href="mailto:${BIZ.email}">${BIZ.email}</a> and we will be happy to remove them.</p>
      <h3>Cookies</h3>
      <p>This website does not set any cookies of its own. Your browser may store a small amount of session information to remember that you have already seen our introduction animation; this never leaves your device.</p>
      <h3>Embedded content from other websites</h3>
      <p>Pages on this site may include embedded content (for example the Google map on our contact page). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website.</p>
      <p>These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content, including tracking your interaction with the embedded content if you have an account and are logged in to that website.</p>
      <h3>Analytics</h3>
      <p>We may use Google Analytics to track visitor numbers and flow. If you wish to opt out please <a href="${p}contact-us/">contact us</a>. Details of how that data is used can be found here: <a href="https://support.google.com/analytics/answer/6004245?hl=en" target="_blank" rel="noopener">https://support.google.com/analytics/answer/6004245</a></p>
      <h2>How long we retain your data</h2>
      <p>Enquiries sent through our website are kept only for as long as we need them to respond to you and deliver any work you ask us to carry out.</p>
      <h2>What rights you have over your data</h2>
      <p>You can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes.</p>
      <h2>Where we send your data</h2>
      <p>We do not sell or share your data. Messages may be checked by our email provider's automated spam detection service.</p>
    </div>
  </div>
</section>`),
});

/* 404 */
pages.push({
  route: "404.html",
  title: `Page not found | ${TITLE_SUFFIX}`,
  description: "Sorry, we couldn't find that page.",
  noindex: true,
  preload: "img-3048",
  body: (p) => shell(p, "404.html", `
${pageHero(p, { h1: "Page not found", intro: "It may have moved when we refreshed our website. Try one of these instead.", image: "img-3048", alt: "", short: true })}
<section class="section">
  <div class="wrap">
    <ul class="list-lines">
      <li><a href="/"><span>Home</span><small>Go</small></a></li>
      <li><a href="/gallery/"><span>Gallery</span><small>Go</small></a></li>
      <li><a href="/kitchens/"><span>Kitchens</span><small>Go</small></a></li>
      <li><a href="/contact-us/"><span>Contact Us</span><small>Go</small></a></li>
    </ul>
  </div>
</section>`),
});

/* ---------- Write ---------- */
for (const pg of pages) {
  let html = layout(pg);
  if (pg.noindex) html = html.replace('content="index, follow, max-image-preview:large"', 'content="noindex"');
  if (pg.route === "404.html") {
    // 404 is served from any path, so use absolute URLs based on the deployed base
    html = html.replace(/(href|src|srcset|imagesrcset)="([^"]*)"/g, (m, a, v) => `${a}="${v.replace(/(^|, )(?!https?:|\/|#|mailto:|tel:)/g, "$1/__BASE__/")}"`);
  }
  const out = pg.route.endsWith(".html") ? path.join(ROOT, pg.route) : path.join(ROOT, pg.route, "index.html");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}

// 404 base: GitHub Pages project site lives under /hancockandread/, live domain at /
const BASE = process.env.BASE_PATH ?? "hancockandread";
const f404 = path.join(ROOT, "404.html");
fs.writeFileSync(f404, fs.readFileSync(f404, "utf8").replace(/\/__BASE__\//g, BASE ? `/${BASE}/` : "/").replace(/href="\/(gallery|kitchens|contact-us)\/"/g, `href="${BASE ? "/" + BASE : ""}/$1/"`).replace(/<a href="\/"><span>Home/, `<a href="${BASE ? "/" + BASE + "/" : "/"}"><span>Home`));

const urls = pages.filter((x) => !x.noindex).map((x) => x.route);
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}/${u}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${u === "" ? "1.0" : u.includes("gallery") || u === "privacy-policy/" ? "0.6" : "0.8"}</priority></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap);
// Keep the old WordPress sitemap URLs working (already submitted to search engines)
fs.writeFileSync(path.join(ROOT, "wp-sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${SITE}/sitemap.xml</loc><lastmod>${today}</lastmod></sitemap></sitemapindex>
`);
fs.writeFileSync(path.join(ROOT, "wp-sitemap-posts-page-1.xml"), sitemap);
fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
fs.writeFileSync(path.join(ROOT, ".nojekyll"), "");
console.log(`Built ${pages.length} pages, ${Object.values(gallery).flat().length} gallery images`);
