/* ============================================================
   STORM ENGINE — random, multi-bolt lightning for the music
   bays. Works like a tiny movie director: every so often
   (randomly), it calls for 1–3 lightning strikes at random
   positions. Every bolt is drawn fresh from random zigzags, so
   no two strikes are ever the same — a storm video that never
   repeats. Falls silent for reduced-motion visitors.
   ============================================================ */

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/* Draw one jagged bolt path: starts at a random x along the top
   and zigzags downward. Returns the path, where it lands, and a
   mid-air point for growing forks. */
function randomBoltPath(maxY) {
  let x = 12 + Math.random() * 76;
  let d = `M${x.toFixed(1)} 0`;
  const steps = 6 + Math.floor(Math.random() * 4);
  const mid = { x, y: 0 };

  for (let i = 1; i <= steps; i++) {
    const y = (maxY / steps) * i;
    x += (Math.random() - 0.5) * 28;
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    if (i === Math.ceil(steps / 2)) {
      mid.x = x;
      mid.y = y;
    }
  }

  return { d, endX: Math.max(2, Math.min(98, x)), mid };
}

/* A short fork that splits off a bolt partway down */
function forkPath(startX, startY) {
  let x = startX;
  let y = startY;
  let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
  const steps = 2 + Math.floor(Math.random() * 2);
  const drift = (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 14);

  for (let i = 1; i <= steps; i++) {
    y += 18 + Math.random() * 14;
    x += drift * (0.6 + Math.random() * 0.6);
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }

  return d;
}

/* Strike one scene: main bolt (+ maybe a fork), a sky flash, and
   — in the electric scene — a ground impact glow where it lands.
   Also exported for pulse.js, which fires bolts in time with
   the music. */
export function spawnBolt(scene, kind) {
  const layer = scene.querySelector(".bolt-layer");
  if (!layer) return;

  const maxY = kind === "electric" ? 92 : 130; // electric bolts stop at the ground line
  const { d, endX, mid } = randomBoltPath(maxY);

  const bolt = document.createElementNS("http://www.w3.org/2000/svg", "path");
  bolt.setAttribute("d", d);
  bolt.addEventListener("animationend", () => bolt.remove());
  layer.appendChild(bolt);

  if (Math.random() < 0.7) {
    const fork = document.createElementNS("http://www.w3.org/2000/svg", "path");
    fork.setAttribute("d", forkPath(mid.x, mid.y));
    fork.setAttribute("class", "bolt-branch");
    fork.addEventListener("animationend", () => fork.remove());
    layer.appendChild(fork);
  }

  const flash = scene.querySelector(".flash");
  if (flash) {
    flash.classList.remove("on");
    void flash.offsetWidth; // restart the flash animation
    flash.classList.add("on");
  }

  if (kind === "electric") {
    const impactLayer = scene.querySelector(".impact-layer");
    if (impactLayer) {
      const glow = document.createElement("div");
      glow.className = "impact-glow";
      glow.style.left = endX + "%";
      glow.addEventListener("animationend", () => glow.remove());
      impactLayer.appendChild(glow);
    }
  }
}

/* The director: schedule strikes at random intervals, sometimes
   calling for two or three at (nearly) the same time */
function directStorm(scene, kind) {
  const pacing = kind === "electric" ? [250, 1400] : [600, 2600];

  const strike = () => {
    // While music is driving a scene (pulse.js), the random
    // director steps aside — the track conducts the storm
    if (scene.classList.contains("music-active")) {
      schedule();
      return;
    }

    const roll = Math.random();
    const count = roll < 0.7 ? 1 : roll < 0.92 ? 2 : 3;

    for (let i = 0; i < count; i++) {
      setTimeout(() => spawnBolt(scene, kind), i * (40 + Math.random() * 120));
    }

    schedule();
  };

  const schedule = () => {
    const [min, max] = pacing;
    setTimeout(strike, min + Math.random() * (max - min));
  };

  schedule();
}

/* Rain: every drop is an individual streak with its own length,
   speed, tilt, and brightness, spawned continuously — sparse and
   parallel, with dark sky in between, like real rainfall */
function startRain(layer) {
  const spawnDrop = () => {
    const height = layer.getBoundingClientRect().height || 180;

    const drop = document.createElement("div");
    const depth = Math.random(); // near, mid, or far from the viewer
    if (depth < 0.25) {
      drop.className = "rain-drop rain-drop--near";
    } else if (depth > 0.8) {
      drop.className = "rain-drop rain-drop--far";
    } else {
      drop.className = "rain-drop";
    }

    const length = 9 + Math.random() * 13;
    const duration = (depth < 0.25 ? 0.45 : 0.6) + Math.random() * 0.5;
    const fall = height + 70; // start above the card, exit below it

    drop.style.left = Math.random() * 105 + "%";
    drop.style.height = length + "px";
    drop.style.animationDuration = duration.toFixed(2) + "s";
    drop.style.setProperty("--fall", fall.toFixed(0) + "px");
    drop.style.setProperty("--drift", (-fall * 0.22).toFixed(0) + "px");
    drop.style.setProperty("--o", (0.18 + Math.random() * 0.3).toFixed(2));
    drop.addEventListener("animationend", () => drop.remove());
    layer.appendChild(drop);
  };

  // Keep the sky sprinkling — a couple of fresh drops every beat
  setInterval(() => {
    if (document.hidden) return;
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      setTimeout(spawnDrop, Math.random() * 120);
    }
  }, 90);
}

if (!prefersReducedMotion) {
  document.querySelectorAll("[data-storm]").forEach((scene) => {
    directStorm(scene, scene.dataset.storm || "storm");
  });

  document.querySelectorAll("[data-rain]").forEach((layer) => {
    startRain(layer);
  });
}
