/* OFD, LLC — shared interactions */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- header scroll state ---- */
  var header = document.querySelector(".header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- mobile nav ---- */
  var burger = document.querySelector(".burger");
  var links = document.querySelector(".nav-links");
  if (burger && links) {
    burger.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- active nav link by filename ---- */
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = (a.getAttribute("href") || "").split("/").pop();
    if (href === path || (path === "" && href === "index.html")) a.classList.add("active");
  });

  /* ---- reveal on scroll ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- count-up stats ---- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = (el.getAttribute("data-dec") | 0);
    var dur = 1500, start = null;
    function fmt(v) {
      return v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
    }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target);
    }
    requestAnimationFrame(step);
  }
  var stats = document.querySelectorAll("[data-count]");
  if (stats.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      stats.forEach(function (el) {
        var d = el.getAttribute("data-dec") | 0;
        el.textContent = parseFloat(el.getAttribute("data-count")).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
      });
    } else {
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { countUp(e.target); so.unobserve(e.target); }
        });
      }, { threshold: 0.6 });
      stats.forEach(function (el) { so.observe(el); });
    }
  }

  /* ---- contact form (AJAX submit to form endpoint) ---- */
  var form = document.querySelector("form[data-endpoint]");
  if (form) {
    var endpoint = form.getAttribute("data-endpoint");
    var errEl = form.querySelector(".form-error");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (f) {
        var field = f.closest(".field");
        var valid = f.value.trim() !== "" && !(f.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
        if (field) field.classList.toggle("invalid", !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        var firstBad = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
        if (firstBad) firstBad.focus();
        return;
      }
      if (errEl) errEl.style.display = "none";
      var btn = form.querySelector("[type=submit]");
      var btnHTML = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }

      function showSuccess() {
        form.style.display = "none";
        var success = document.querySelector(".form-success");
        if (success) {
          success.classList.add("show");
          success.setAttribute("tabindex", "-1");
          success.focus();
        }
      }
      function showError() {
        if (btn) { btn.disabled = false; btn.innerHTML = btnHTML; }
        if (errEl) errEl.style.display = "block";
      }

      var payload = {};
      new FormData(form).forEach(function (v, k) { payload[k] = v; });
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { if (r.ok) { showSuccess(); } else { showError(); } })
        .catch(showError);
    });
    form.querySelectorAll("input,select,textarea").forEach(function (f) {
      f.addEventListener("input", function () {
        var field = f.closest(".field");
        if (field) field.classList.remove("invalid");
      });
    });
  }

  /* ---- language selector (Google Translate) ---- */
  (function () {
    var lbtn = document.getElementById("langBtn");
    var lmenu = document.getElementById("langMenu");
    var lcur = document.getElementById("langCurrent");
    var lwrap = document.getElementById("lang");
    if (!lbtn || !lmenu || !lwrap) return;

    function cookieLang() {
      try {
        var m = document.cookie.match(/(?:^|;\s*)googtrans=\/[^\/]*\/([^;]+)/);
        return m ? decodeURIComponent(m[1]) : "en";
      } catch (e) { return "en"; }
    }
    function shortLabel(code) {
      code = (code || "en").toLowerCase();
      if (code === "zh-cn") return "中文";
      if (code === "zh-tw") return "繁中";
      return code.toUpperCase().slice(0, 2);
    }
    function refresh(code) {
      code = (code || "en").toLowerCase();
      if (lcur) lcur.textContent = shortLabel(code);
      lmenu.querySelectorAll("[data-lang]").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-lang").toLowerCase() === code);
      });
    }
    function setCookie(val) {
      try {
        document.cookie = "googtrans=" + val + ";path=/";
        var h = location.hostname.replace(/^www\./, "");
        if (h.indexOf(".") > -1) document.cookie = "googtrans=" + val + ";path=/;domain=." + h;
      } catch (e) {}
    }
    function clearCookie() {
      try {
        var exp = ";expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "googtrans=;path=/" + exp;
        var h = location.hostname.replace(/^www\./, "");
        if (h.indexOf(".") > -1) document.cookie = "googtrans=;path=/;domain=." + h + exp;
      } catch (e) {}
    }

    refresh(cookieLang());

    // Google Translate is loaded ONLY when a non-English translation is active
    // (keeps the default English page free of any third-party script).
    window.googleTranslateElementInit = function () {
      new google.translate.TranslateElement({
        pageLanguage: "en",
        includedLanguages: "ar,bn,de,el,en,es,fr,he,hi,id,it,ja,ko,nl,pa,pl,pt,ro,ru,sv,th,tl,tr,uk,vi,zh-CN,zh-TW",
        autoDisplay: false
      }, "google_translate_element");
    };
    var gtLoaded = false;
    function loadGoogleTranslate() {
      if (gtLoaded) return;
      gtLoaded = true;
      var sc = document.createElement("script");
      sc.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      sc.async = true;
      document.body.appendChild(sc);
    }
    if (cookieLang() !== "en") loadGoogleTranslate();

    lbtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = lmenu.classList.toggle("open");
      lbtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!lwrap.contains(e.target)) {
        lmenu.classList.remove("open");
        lbtn.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { lmenu.classList.remove("open"); lbtn.setAttribute("aria-expanded", "false"); }
    });

    lmenu.addEventListener("click", function (e) {
      var b = e.target.closest("[data-lang]");
      if (!b) return;
      var lang = b.getAttribute("data-lang");
      lmenu.classList.remove("open");
      lbtn.setAttribute("aria-expanded", "false");
      if (lang === "en") { clearCookie(); location.reload(); return; }
      // Persist the choice in the googtrans cookie and reload. The Google
      // Translate element reads this cookie on load and translates the page
      // (works on a live site; cookies are blocked in some preview sandboxes).
      setCookie("/en/" + lang);
      refresh(lang);
      location.reload();
    });
  })();

  /* ---- footer year ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
