/* Hancock & Read - interactions */
(function () {
  "use strict";
  window.__hr = true;

  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGsap = typeof window.gsap !== "undefined";
  var gsap = window.gsap;

  if (!hasGsap || reduce) doc.classList.remove("motion");
  var motion = doc.classList.contains("motion");
  if (motion) gsap.registerPlugin(ScrollTrigger, SplitText);

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Smooth scroll ---------- */
  var lenis = null;
  if (motion && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function lockScroll(on) {
    document.body.classList.toggle("is-locked", on);
    if (lenis) on ? lenis.stop() : lenis.start();
  }

  /* ---------- Header ---------- */
  var header = $(".site-header");
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (!header) return;
    header.classList.toggle("is-solid", y > 40);
    if (!doc.classList.contains("menu-open")) {
      if (y > 400 && y > lastY + 2) header.classList.add("is-hidden");
      else if (y < lastY - 2 || y <= 400) header.classList.remove("is-hidden");
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menu ---------- */
  var toggle = $(".menu-toggle");
  var menu = $("#menu");
  function setMenu(open) {
    doc.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) menu.removeAttribute("inert"); else menu.setAttribute("inert", "");
    $(".menu-toggle .label").textContent = open ? "Close" : "Menu";
    lockScroll(open);
    if (open) setTimeout(function () { var f = $(".menu-list a", menu); if (f) f.focus({ preventScroll: true }); }, 400);
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () { setMenu(!doc.classList.contains("menu-open")); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && doc.classList.contains("menu-open")) { setMenu(false); toggle.focus(); }
    });
    var imgs = $$(".menu-media img", menu);
    $$(".menu-list a", menu).forEach(function (a, i) {
      a.addEventListener("mouseenter", function () {
        imgs.forEach(function (im, j) { im.classList.toggle("is-active", j === i % imgs.length); });
      });
    });
  }

  /* ---------- Page transitions ---------- */
  var curtain = $(".curtain");
  function isInternal(a) {
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return false;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(mailto|tel):/.test(href)) return false;
    if (a.origin !== location.origin) return false;
    if (a.pathname === location.pathname && a.hash) return false;
    return true;
  }
  if (motion && curtain) {
    var arrived = false;
    try { arrived = sessionStorage.getItem("hr-transition") === "1"; sessionStorage.removeItem("hr-transition"); } catch (e) {}
    if (arrived) {
      gsap.set(curtain, { yPercent: 0 });
      gsap.to(curtain, { yPercent: -100, duration: 1, ease: "power4.inOut", delay: 0.05 });
    } else {
      gsap.set(curtain, { yPercent: 100 });
    }
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (!isInternal(a) || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      var go = function () { location.href = a.href; };
      try { sessionStorage.setItem("hr-transition", "1"); } catch (err) {}
      gsap.fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.7, ease: "power4.inOut", onComplete: go });
      gsap.fromTo($("img", curtain), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.3 });
      setTimeout(go, 1200);
    });
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) { gsap.set(curtain, { yPercent: 100 }); setMenu && doc.classList.contains("menu-open") && setMenu(false); }
    });
  }

  /* ---------- Intro (home, once per session) ---------- */
  function intro(done) {
    var loader = $(".loader");
    var seen = false;
    try { seen = sessionStorage.getItem("hr-intro") === "1"; sessionStorage.setItem("hr-intro", "1"); } catch (e) {}
    if (!motion || !loader || seen) { done(0); return; }
    loader.classList.add("is-on");
    lockScroll(true);
    var tl = gsap.timeline({ onComplete: function () { loader.remove(); lockScroll(false); } });
    tl.to(".loader-logo", { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "power3.inOut" })
      .to(".loader-line i", { scaleX: 1, duration: 1, ease: "power2.inOut" }, 0.2)
      .to(".loader-tag", { opacity: 1, duration: 0.6 }, 0.6)
      .to(loader, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "power4.inOut" }, "+=0.25")
      .add(function () { done(0); }, "-=0.75");
  }

  /* ---------- Animations ---------- */
  function heroIn() {
    var hero = $(".hero, .page-hero");
    if (!hero) return;
    var img = $(".hero-media img", hero);
    var tl = gsap.timeline();
    if (img) tl.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 2.4, ease: "power3.out" }, 0);
    var h1 = $("h1", hero);
    if (h1) {
      var split = new SplitText(h1, { type: "lines", linesClass: "split-line", mask: "lines" });
      gsap.set(h1, { visibility: "visible" });
      tl.from(split.lines, { yPercent: 110, duration: 1.3, ease: "power4.out", stagger: 0.09 }, 0.15);
    }
    tl.from($$(".eyebrow, .crumbs, .hero-bottom > *, .page-hero p", hero), { y: 24, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08 }, 0.45);
    if (img) {
      gsap.to(img, { yPercent: 14, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    }
  }

  function scrollAnims() {
    // Headings split into lines
    $$("[data-split]").forEach(function (el) {
      var split = new SplitText(el, { type: "lines", linesClass: "split-line", mask: "lines" });
      gsap.set(el, { visibility: "visible" });
      gsap.from(split.lines, {
        yPercent: 110, duration: 1.2, ease: "power4.out", stagger: 0.08,
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    // Fade up, grouped so siblings stagger
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 90%",
      onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.09, overwrite: true }); }
    });

    // Image wipe reveals
    $$("[data-reveal-img]").forEach(function (el) {
      var img = $("img", el);
      var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%" } });
      tl.to(el, { clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "power4.inOut" });
      if (img) tl.to(img, { scale: 1, duration: 1.8, ease: "power3.out" }, 0);
    });

    // Parallax
    $$("[data-speed]").forEach(function (el) {
      var s = parseFloat(el.getAttribute("data-speed")) || 0.1;
      gsap.fromTo(el, { yPercent: -s * 100 }, {
        yPercent: s * 100, ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    // Statement - words light up as you scroll
    $$("[data-words]").forEach(function (el) {
      var split = new SplitText(el, { type: "words", wordsClass: "w" });
      gsap.to(split.words, {
        opacity: 1, ease: "none", stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true }
      });
    });

    // Counters
    $$("[data-count]").forEach(function (el) {
      var end = parseFloat(el.getAttribute("data-count"));
      var from = parseFloat(el.getAttribute("data-from") || "0");
      var suffix = el.getAttribute("data-suffix") || "";
      var o = { v: from };
      el.textContent = Math.round(from) + suffix;
      gsap.to(o, {
        v: end, duration: 2.2, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
        onUpdate: function () { el.textContent = Math.round(o.v) + suffix; }
      });
    });

    // Parallax columns
    $$(".columns .col").forEach(function (col, i) {
      var dist = [-18, 14, -26][i] || 0;
      gsap.fromTo(col, { yPercent: -dist / 2 }, {
        yPercent: dist, ease: "none",
        scrollTrigger: { trigger: ".columns-band", start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    // Horizontal process on wide screens
    var mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", function () {
      var track = $(".process-track");
      if (!track) return;
      var section = $(".process");
      var dist = function () { return track.scrollWidth - window.innerWidth; };
      var tween = gsap.to(track, {
        x: function () { return -dist(); }, ease: "none",
        scrollTrigger: {
          trigger: section, start: "top top", end: function () { return "+=" + dist(); },
          pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1
        }
      });
      gsap.to(".process-progress i", { scaleX: 1, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: function () { return "+=" + dist(); }, scrub: true } });
      $$(".step .frame img", track).forEach(function (img) {
        gsap.fromTo(img, { scale: 1.25, xPercent: -6 }, { scale: 1.05, xPercent: 6, ease: "none", scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
      });
    });

    // Marquee drifts with scroll velocity
    var mq = $(".marquee-track");
    if (mq) {
      ScrollTrigger.create({
        trigger: mq, start: "top bottom", end: "bottom top",
        onUpdate: function (self) {
          var v = gsap.utils.clamp(-14, 14, self.getVelocity() / 120);
          gsap.to(mq, { skewX: -v * 0.4, duration: 0.5, overwrite: "auto" });
        }
      });
    }

    // Magnetic buttons
    if (finePointer) {
      $$(".btn, .room .arrow, .quote-nav button").forEach(function (b) {
        var xTo = gsap.quickTo(b, "x", { duration: 0.6, ease: "power3" });
        var yTo = gsap.quickTo(b, "y", { duration: 0.6, ease: "power3" });
        b.addEventListener("mousemove", function (e) {
          var r = b.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * 0.25);
          yTo((e.clientY - r.top - r.height / 2) * 0.35);
        });
        b.addEventListener("mouseleave", function () { xTo(0); yTo(0); });
      });
    }

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }

  /* ---------- Custom cursor ---------- */
  function cursor() {
    if (!motion || !finePointer) return;
    var c = document.createElement("div");
    c.className = "cursor"; c.setAttribute("aria-hidden", "true");
    document.body.appendChild(c);
    var xTo = gsap.quickTo(c, "x", { duration: 0.45, ease: "power3" });
    var yTo = gsap.quickTo(c, "y", { duration: 0.45, ease: "power3" });
    window.addEventListener("mousemove", function (e) { xTo(e.clientX); yTo(e.clientY); });
    $$("[data-cursor]").forEach(function (el) {
      el.addEventListener("mouseenter", function () { c.textContent = el.getAttribute("data-cursor"); gsap.to(c, { scale: 1, opacity: 1, duration: 0.4, ease: "power3.out" }); });
      el.addEventListener("mouseleave", function () { gsap.to(c, { scale: 0, opacity: 0, duration: 0.3 }); });
    });
  }

  /* ---------- Testimonials ---------- */
  function quotes() {
    var root = $(".quotes");
    if (!root) return;
    var slides = $$(".quote", root);
    var count = $(".quote-count", root);
    var bar = $(".quote-bar i", root);
    var i = 0, timer = null;
    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, j) { s.classList.toggle("is-active", j === i); s.setAttribute("aria-hidden", j === i ? "false" : "true"); });
      if (count) count.textContent = (i + 1) + " / " + slides.length;
      if (bar && !reduce) { bar.classList.remove("run"); void bar.offsetWidth; bar.classList.add("run"); }
      clearTimeout(timer);
      if (!reduce) timer = setTimeout(function () { show(i + 1); }, 8000);
    }
    $(".q-prev", root).addEventListener("click", function () { show(i - 1); });
    $(".q-next", root).addEventListener("click", function () { show(i + 1); });
    var sx = null;
    root.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1));
      sx = null;
    });
    show(0);
  }

  /* ---------- Gallery filter + lightbox ---------- */
  function gallery() {
    var grid = $(".masonry, .preview-grid");
    if (!grid) return;
    var tiles = $$(".tile", document);
    var filterBtns = $$("[data-filter]");
    var more = $(".masonry-more button");
    var PAGE = 24, shown = PAGE, filter = "all";

    function apply() {
      var n = 0;
      tiles.forEach(function (t) {
        var match = filter === "all" || t.getAttribute("data-cat") === filter;
        var vis = match && (!more || n < shown);
        if (match) n++;
        t.hidden = !vis;
      });
      if (more) more.parentElement.hidden = n <= shown;
      if (motion) ScrollTrigger.refresh();
    }
    filterBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        filter = b.getAttribute("data-filter");
        shown = PAGE;
        filterBtns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        apply();
        if (motion) gsap.fromTo(tiles.filter(function (t) { return !t.hidden; }).slice(0, 12), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.04, ease: "power3.out" });
      });
    });
    if (more) {
      more.addEventListener("click", function () {
        var before = tiles.filter(function (t) { return !t.hidden; }).length;
        shown += PAGE; apply();
        var fresh = tiles.filter(function (t) { return !t.hidden; }).slice(before);
        if (motion) gsap.fromTo(fresh, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.03, ease: "power3.out" });
      });
    }
    if (more || filterBtns.length) apply();

    // Lightbox
    var lb = $(".lightbox");
    if (!lb) return;
    var lbImg = $(".lb-stage img", lb);
    var lbMeta = $(".lb-meta", lb);
    var list = [], idx = 0, opener = null;
    function render() {
      var t = list[idx];
      var im = $("img", t);
      lbImg.src = t.getAttribute("href");
      lbImg.alt = im ? im.alt : "";
      lbMeta.textContent = (idx + 1) + " / " + list.length + (t.getAttribute("data-label") ? "   " + t.getAttribute("data-label") : "");
      if (motion) gsap.fromTo(lbImg, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" });
      var nx = list[(idx + 1) % list.length];
      if (nx) { var pre = new Image(); pre.src = nx.getAttribute("href"); }
    }
    function open(t) {
      list = tiles.filter(function (x) { return !x.hidden; });
      idx = Math.max(0, list.indexOf(t));
      opener = t;
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
      lockScroll(true);
      render();
      $(".lb-close", lb).focus();
    }
    function close() {
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      lockScroll(false);
      if (opener) opener.focus({ preventScroll: true });
    }
    function step(d) { idx = (idx + d + list.length) % list.length; render(); }
    tiles.forEach(function (t) {
      t.addEventListener("click", function (e) { e.preventDefault(); open(t); });
    });
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", function () { step(-1); });
    $(".lb-next", lb).addEventListener("click", function () { step(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-stage")) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "Tab") {
        var f = $$("button", lb), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
      sx = null;
    });
  }

  /* ---------- Contact form ---------- */
  function form() {
    var f = $("#enquiry");
    if (!f) return;
    var status = $(".form-status", f);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if ($(".hp input", f) && $(".hp input", f).value) return;
      if (!f.reportValidity()) return;
      var data = new FormData(f);
      var endpoint = f.getAttribute("data-endpoint");
      if (endpoint) {
        status.className = "form-status"; status.textContent = "Sending...";
        fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) { if (!r.ok) throw new Error(); status.className = "form-status ok"; status.textContent = "Thank you. We'll be in touch shortly."; f.reset(); })
          .catch(function () { status.className = "form-status err"; status.textContent = "Sorry, something went wrong. Please call us on 0114 275 3918."; });
        return;
      }
      var body = "Name: " + data.get("name") + "\nEmail: " + data.get("email") + "\nTelephone: " + (data.get("phone") || "") +
        "\nInterested in: " + (data.get("room") || "") + "\n\n" + data.get("message");
      location.href = "mailto:" + f.getAttribute("data-mailto") + "?subject=" + encodeURIComponent("Website enquiry from " + data.get("name")) + "&body=" + encodeURIComponent(body);
      status.className = "form-status ok";
      status.textContent = "Your email app should now open with your message ready to send.";
    });
  }

  /* ---------- Boot ---------- */
  quotes();
  gallery();
  form();
  if (motion) {
    cursor();
    intro(function () { heroIn(); });
    scrollAnims();
  }

  var year = $("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
