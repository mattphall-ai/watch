(() => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  let dotRgb = "19,19,19";
  let networkLineRgb = "180,177,168";
  function refreshThemeColors() {
    const style = getComputedStyle(document.documentElement);
    dotRgb = style.getPropertyValue("--dot-rgb").trim() || dotRgb;
    networkLineRgb =
      style.getPropertyValue("--network-line-rgb").trim() || networkLineRgb;
  }
  refreshThemeColors();
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", refreshThemeColors);
  new MutationObserver(refreshThemeColors).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  // ---------- Header ----------
  const header = document.getElementById("site-header");
  function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 4);
  }

  // ---------- Generic reveal-on-scroll ----------
  const revealEls = document.querySelectorAll(".reveal, .bignum");
  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 },
  );
  revealEls.forEach((el) => revealIO.observe(el));

  // ---------- Central ecosystem spine ----------
  const ecosystem = document.getElementById("ecosystem");
  const spineProgress = document.getElementById("spine-progress");
  let spineTarget = 0;
  let spineCurrent = 0;

  // Backward "learning" flow kicks in once the second transition beat appears.
  let backwardActive = false;
  const spineParticles = document.getElementById("spine-particles");
  const PARTICLE_COUNT = 5;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.animationDuration = `${3.4 + i * 0.6}s`;
    p.style.animationDelay = `${i * 0.7}s`;
    spineParticles.appendChild(p);
  }

  const transition2 = document.getElementById("transition-2");
  const flowIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          backwardActive = true;
          spineParticles.classList.add("flow-up");
          flowIO.disconnect();
        }
      });
    },
    { threshold: 0, rootMargin: "0px 0px -20% 0px" },
  );
  flowIO.observe(transition2);

  // Spine resolves into a closed loop as the ecosystem section hands off to the closing beat.
  const spineLoopDraw = document.getElementById("spine-loop-draw");
  const loopIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          spineLoopDraw.classList.add("in-view");
          loopIO.disconnect();
        }
      });
    },
    { threshold: 0.5 },
  );
  loopIO.observe(document.querySelector(".spine-loop-wrap"));

  // ---------- Year touchpoint bullets: scroll-synced reveal, alternating sides ----------
  const touchpoints = [];
  document.querySelectorAll(".touchpoint-list").forEach((list) => {
    Array.from(list.children).forEach((item, i) => {
      item.dataset.side = i % 2 === 0 ? "left" : "right";
      touchpoints.push(item);
    });
  });

  function updateTouchpoints() {
    if (reduceMotion) return;
    const vh = window.innerHeight;
    const revealStart = vh * 0.95;
    const revealEnd = vh * 0.55;
    touchpoints.forEach((item) => {
      const top = item.getBoundingClientRect().top;
      const progress = clamp(
        (revealStart - top) / (revealStart - revealEnd),
        0,
        1,
      );
      item.style.opacity = progress;
      item.style.transform = `translateY(${18 * (1 - progress)}px)`;
    });
  }

  // ---------- Closing constellation ----------
  const constellationCanvas = document.getElementById("constellation");
  const cctx = constellationCanvas.getContext("2d");
  let cw = 0;
  let ch = 0;
  const cdpr = Math.min(window.devicePixelRatio || 1, 2);
  let nodes = [];
  let constellationActive = false;

  function seededRandom(seed) {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  function buildConstellation() {
    const rect = constellationCanvas.getBoundingClientRect();
    cw = rect.width;
    ch = rect.height;
    constellationCanvas.width = cw * cdpr;
    constellationCanvas.height = ch * cdpr;
    cctx.setTransform(cdpr, 0, 0, cdpr, 0, 0);

    const rand = seededRandom(42);
    const count = 22;
    nodes = Array.from({ length: count }, (_, i) => ({
      x: rand() * cw,
      y: rand() * ch,
      r: 1.6 + rand() * 2.2,
      phase: rand() * Math.PI * 2,
      speed: 0.4 + rand() * 0.4,
      accent: i % 7 === 0,
    }));
  }

  function drawConstellation(t) {
    cctx.clearRect(0, 0, cw, ch);
    const positioned = nodes.map((n) => ({
      ...n,
      x: n.x + Math.sin(t * n.speed + n.phase) * 10,
      y: n.y + Math.cos(t * n.speed * 0.8 + n.phase) * 10,
    }));

    cctx.lineWidth = 1;
    for (let i = 0; i < positioned.length; i++) {
      for (let j = i + 1; j < positioned.length; j++) {
        const a = positioned[i];
        const b = positioned[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 150) {
          cctx.strokeStyle = `rgba(${networkLineRgb},${0.16 * (1 - dist / 150)})`;
          cctx.beginPath();
          cctx.moveTo(a.x, a.y);
          cctx.lineTo(b.x, b.y);
          cctx.stroke();
        }
      }
    }

    positioned.forEach((n) => {
      cctx.beginPath();
      cctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      cctx.fillStyle = n.accent ? "#f2b400" : `rgba(${dotRgb},0.4)`;
      cctx.fill();
    });
  }

  buildConstellation();
  const constellationIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        constellationActive = entry.isIntersecting;
      });
    },
    { threshold: 0 },
  );
  constellationIO.observe(constellationCanvas);

  // ---------- Scroll + animation loop ----------
  function updateSpine() {
    const rect = ecosystem.getBoundingClientRect();
    spineTarget = clamp(
      (window.innerHeight - rect.top) / (rect.height + window.innerHeight),
      0,
      1,
    );
  }

  function onScroll() {
    updateHeader();
    updateSpine();
  }

  let t = 0;
  function tick() {
    spineCurrent = lerp(spineCurrent, spineTarget, 0.12);
    spineProgress.style.transform = `scaleY(${spineCurrent})`;
    updateTouchpoints();

    if (!reduceMotion) {
      t += 0.016;
      if (constellationActive) drawConstellation(t);
    } else {
      drawConstellation(0);
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    buildConstellation();
    onScroll();
  });

  onScroll();
  requestAnimationFrame(tick);
})();
