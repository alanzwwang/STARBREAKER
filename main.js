/* ============================================================
   ALAN.WANG — ship systems
   ------------------------------------------------------------
   Small helpers that make the site feel alive.
   ============================================================ */

import "./storm.js"; // random multi-bolt lightning for the music bays
import "./pulse.js"; // lightning that strikes in time with Hyper-Electric
import "./chat.js"; // the endless text-bubble conversation on the Chatty card

/* Reloads always open at the very top — the name leads the page.
   Without this, the browser "restores" the old scroll position
   (and any #section in the address) and dumps you mid-page. */
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
if (location.hash) {
  history.replaceState(null, "", location.pathname + location.search);
}
window.addEventListener("load", () => window.scrollTo(0, 0));

/* Auto-update the copyright year so it's never out of date.
   Any element with data-year gets today's year. */
for (const el of document.querySelectorAll("[data-year]")) {
  el.textContent = new Date().getFullYear();
}

/* Scroll reveal: elements with class="reveal" fade in smoothly
   as they enter the viewport. If the visitor prefers reduced
   motion (or the browser is very old), everything just shows
   up immediately — no animation, no problem. */
const revealEls = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealEls.forEach((el) => el.classList.add("in"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/* One song at a time: pressing play on any music bay pauses
   whatever else is playing, so tracks never overlap. */
const audioPlayers = document.querySelectorAll("audio");

audioPlayers.forEach((player) => {
  player.addEventListener("play", () => {
    for (const other of audioPlayers) {
      if (other !== player && !other.paused) {
        other.pause();
      }
    }
  });
});
