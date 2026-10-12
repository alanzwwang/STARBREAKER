/* ============================================================
   PULSE ENGINE — music-reactive lightning for Hyper-Electric.
   The browser's Web Audio API lets us "listen" to the track as
   it plays: an AnalyserNode reports the energy in the sound
   ~60 times a second. When energy jumps suddenly, a note was
   just played → STRIKE. Fast note runs → rapid strikes. Big
   dense passages (lots of energy everywhere) → extra flickers.
   Quiet, calm parts → the sky mostly rests.
   ============================================================ */

import { spawnBolt } from "./storm.js";

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/* Average loudness of a frequency band (indices into the
   analyser's bins: low numbers = bass, high = treble) */
function bandAvg(data, lo, hi) {
  let sum = 0;
  for (let i = lo; i < hi; i++) sum += data[i];
  return sum / (hi - lo);
}

export function wirePulse(player) {
  const card = player.closest(".project");
  const scene = card && card.querySelector("[data-storm]");
  if (!scene) return;

  let audioCtx;
  let analyser;
  let data;

  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaElementSource(player);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.45;
    source.connect(analyser);
    analyser.connect(audioCtx.destination); // keep the music audible
    data = new Uint8Array(analyser.frequencyBinCount);
  } catch {
    return; // no Web Audio here — the random storm carries on
  }

  // Onset detector state: learns what counts as a "note hit" for
  // THIS track by watching how energy usually moves (running
  // mean + spread). Self-calibrating — no hand-tuned numbers.
  let prev = 0;
  let mean = 0;
  let m2 = 0;
  let samples = 0;
  let nextStrikeOk = 0;

  const calibrate = () => {
    prev = 0;
    mean = 0;
    m2 = 0;
    samples = 0;
  };

  player.addEventListener("play", () => {
    scene.classList.add("music-active"); // pauses the random director
    calibrate();
    audioCtx.resume();
  });

  const quiet = () => scene.classList.remove("music-active");
  player.addEventListener("pause", quiet);
  player.addEventListener("ended", quiet);

  function loop() {
    requestAnimationFrame(loop);
    if (player.paused || !scene.classList.contains("music-active")) return;

    analyser.getByteFrequencyData(data);
    const bass = bandAvg(data, 1, 8);
    const mid = bandAvg(data, 8, 32);
    const treble = bandAvg(data, 32, 100);
    const energy = bass * 1.3 + mid + treble * 0.7;
    const delta = energy - prev;
    prev = energy;

    // Running mean + standard deviation of energy jumps
    samples++;
    mean += (delta - mean) / samples;
    m2 += (delta - mean) * (delta - mean);
    const spread = Math.sqrt(m2 / Math.max(1, samples - 1));

    const layer = scene.querySelector(".bolt-layer");
    const liveBolts = layer ? layer.childElementCount : 0;
    const now = performance.now();

    // A NOTE HIT: energy jumped well above this track's norm
    const hit = delta > mean + Math.max(10, 1.7 * spread);
    if (now >= nextStrikeOk && liveBolts < 9 && energy > 16 && hit) {
      const force = Math.min(
        1,
        (delta - mean) / (30 + spread * 2) + bass / 140
      );

      spawnBolt(scene, "electric");
      if (force > 0.55) setTimeout(() => spawnBolt(scene, "electric"), 40);
      if (force > 0.82) setTimeout(() => spawnBolt(scene, "electric"), 90);

      // Fast notes can strike again almost immediately; big hits
      // get a brief breather so they read as one giant strike
      nextStrikeOk = now + (force > 0.6 ? 90 : 150);
    }

    // DENSE PASSAGE: lots of instruments at once (high sustained
    // energy) → the whole sky crackles with extra flickers
    if (energy > 70 && liveBolts < 12 && Math.random() < 0.25) {
      spawnBolt(scene, "electric");
    }
  }

  requestAnimationFrame(loop);
}

if (!prefersReducedMotion) {
  document.querySelectorAll("audio[data-pulse]").forEach(wirePulse);
}
