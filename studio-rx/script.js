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

  // ---------- Year touchpoint networks ----------
  class YearNetwork {
    constructor(root) {
      this.root = root;
      this.canvas = root.querySelector("canvas.network");
      this.ctx = this.canvas.getContext("2d");
      this.items = Array.from(root.querySelectorAll(".touchpoint"));
      this.side = root.closest(".year-block").dataset.side;
      this.revealed = new Array(this.items.length).fill(false);
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.items.forEach((item, i) => {
        item.style.transitionDelay = `${i * 70}ms`;
      });

      this.io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const idx = this.items.indexOf(entry.target);
            if (entry.isIntersecting && idx !== -1) {
              entry.target.classList.add("in-view");
              this.revealed[idx] = true;
              this.io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 },
      );
      this.items.forEach((item) => this.io.observe(item));

      this.resize();
    }

    resize() {
      const rect = this.root.getBoundingClientRect();
      this.w = rect.width;
      this.h = rect.height;
      this.canvas.width = this.w * this.dpr;
      this.canvas.height = this.h * this.dpr;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    tipPoints() {
      const rootRect = this.root.getBoundingClientRect();
      return this.items.map((item) => {
        const r = item.getBoundingClientRect();
        const y = r.top + r.height / 2 - rootRect.top;
        const x = this.side === "left" ? 0 : this.w;
        return { x, y };
      });
    }

    draw(t) {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.w, this.h);
      const points = this.tipPoints();

      ctx.lineWidth = 1.2;
      for (let i = 0; i < points.length - 1; i++) {
        if (!this.revealed[i] || !this.revealed[i + 1]) continue;
        const a = points[i];
        const b = points[i + 1];

        ctx.strokeStyle = `rgba(${networkLineRgb},0.55)`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        if (backwardActive && !reduceMotion) {
          const phase = (t * 0.4 + i * 0.35) % 1;
          const travel = 1 - phase; // travels from b (later item) back to a (earlier item)
          const px = lerp(b.x, a.x, travel);
          const py = lerp(b.y, a.y, travel);
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = "#f2b400";
          ctx.fill();
        }
      }

      points.forEach((pt, i) => {
        if (!this.revealed[i]) return;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotRgb},0.55)`;
        ctx.fill();
      });
    }
  }

  const networks = Array.from(document.querySelectorAll(".touchpoints")).map(
    (el) => new YearNetwork(el),
  );

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

    if (!reduceMotion) {
      t += 0.016;
      networks.forEach((net) => net.draw(t));
      if (constellationActive) drawConstellation(t);
    } else {
      networks.forEach((net) => net.draw(0));
      drawConstellation(0);
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    networks.forEach((net) => net.resize());
    buildConstellation();
    onScroll();
  });

  onScroll();
  requestAnimationFrame(tick);
})();
