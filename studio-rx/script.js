(() => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const header = document.getElementById("site-header");
  const wrap = document.getElementById("parallax-wrap");
  const copyBlock = document.getElementById("copy-block");
  const videoCard = document.getElementById("video-card");
  const videoTitle = document.getElementById("video-title");
  const videoLink = document.getElementById("video-link");
  const progressDot = document.getElementById("progress-dot");
  const canvas = document.getElementById("wave");
  const ctx = canvas.getContext("2d");

  let dotTarget = 0;
  let dotCurrent = 0;

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // ---------- Header state ----------
  function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 4);
  }

  // ---------- Hero parallax + focus zoom through the wrap ----------
  function updateStage() {
    const rect = wrap.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    const progress = clamp(-rect.top / scrollable, 0, 1);

    // Phase A (0 -> 0.55): gentle parallax separation between copy and card.
    // Phase B (0.55 -> 1): card zooms to fill the viewport, copy fades out.
    const parallaxT = clamp(progress / 0.55, 0, 1);
    const zoomT = clamp((progress - 0.55) / 0.45, 0, 1);

    if (!reduceMotion) {
      copyBlock.style.transform = `translateY(${lerp(0, -40, parallaxT)}px)`;
      copyBlock.style.opacity = String(1 - zoomT);

      const scale = lerp(1, 1.65, zoomT);
      const liftY = lerp(0, -30, parallaxT) - zoomT * 20;
      videoCard.style.transform = `translateY(${liftY}px) scale(${scale})`;
    }

    videoCard.classList.toggle("is-focused", zoomT > 0.15);
    videoLink.style.opacity = String(1 - zoomT);
    videoTitle.style.opacity = String(lerp(1, 1, 1));

    dotTarget = clamp(
      window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight),
      0,
      1,
    );
  }

  // ---------- Reveal-on-scroll for finale ----------
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    { threshold: 0.4 },
  );
  revealEls.forEach((el) => io.observe(el));

  // ---------- Dotted wave canvas (parallax depth layers) ----------
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0;
  let h = 0;
  let t = 0;

  function resizeCanvas() {
    const bounds = canvas.getBoundingClientRect();
    w = bounds.width;
    h = bounds.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawWave() {
    ctx.clearRect(0, 0, w, h);

    // A dotted terrain: a grid of dots undulating like rolling hills,
    // with near rows (bottom) bigger/darker for a sense of depth.
    const cols = 46;
    const rows = 22;
    const horizon = h * 0.28;
    const parallaxShift = dotTarget * 26;

    for (let r = 0; r < rows; r++) {
      const rowT = r / (rows - 1);
      const baseY = horizon + rowT * rowT * (h - horizon);
      const amp = 6 + rowT * 26;
      const radius = 0.5 + rowT * 1.6;
      const alpha = 0.05 + rowT * 0.5;

      for (let c = 0; c < cols; c++) {
        const colT = c / (cols - 1);
        const wave =
          Math.sin(colT * Math.PI * 2.2 + t + rowT * 1.6) * amp +
          Math.sin(colT * Math.PI * 4.4 - t * 1.3 + rowT * 2.4) * amp * 0.35;
        const x = colT * w;
        const y = baseY + wave - parallaxShift * rowT;

        if (y < -4 || y > h + 4) continue;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(20,20,20,${alpha})`;
        ctx.fill();
      }
    }
  }

  function tick() {
    dotCurrent = lerp(dotCurrent, dotTarget, 0.12);
    const track = progressDot.parentElement.clientWidth - 18 - 24;
    progressDot.style.transform = `translate(${dotCurrent * track}px, -50%)`;

    if (!reduceMotion) {
      t += 0.012;
      drawWave();
    }

    requestAnimationFrame(tick);
  }

  function onScroll() {
    updateHeader();
    updateStage();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    resizeCanvas();
    updateStage();
  });

  resizeCanvas();
  onScroll();
  if (reduceMotion) drawWave();
  requestAnimationFrame(tick);
})();
