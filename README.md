# alanwang.info

The personal website of Alan Wang — styled as a **Deep Space Lab**:
dark cosmic background, a bright drifting starfield, a hero name that
shines from gold into seafoam green, glowing electric-cyan accents,
a hand-drawn SVG planet Earth — real continents on an orthographic
map (deserts, inland seas, islands, ice caps, drifting clouds, a
day/night terminator) — circled by a **to-scale Moon** (27.3% of
Earth, real maria and Tycho rays) on an elliptical Kepler-true
orbit that transits the globe's face and dips behind it — all
while Earth itself, tilted on its axis, rides its own orbit line
around a bigger glowing Sun parked at the center. Stars shine in
astronomically correct blues, whites, yellows, and reds.

## Fly it locally

```bash
npm install     # first time only
npm run dev     # then open http://127.0.0.1:8787
```

## Launch it to the world

```bash
npm run deploy  # builds the site and ships it via Wrangler
```

## Make it yours

- **Colors, fonts, spacing** → the 🎛️ *CONTROL PANEL* at the top of
  `src/styles.css`. Change a dial there and it updates the whole site.
- **Fonts** → loaded in `index.html` (Space Grotesk + Space Mono).
- **Content** → the dashed boxes in `index.html` are empty docking bays.
  When something is ready to show, swap its `slot` class for `card`
  and fill it in.
- **Starfield & planet** → pure CSS in `src/styles.css` (search for
  "THE SKY" and "The planet").

## Safety note 🚀

This site is public — anyone can see it. Stick to what you're proud to
show the whole world: your projects, art, and ideas. Skip personal
details like your school, address, phone number, or age.
