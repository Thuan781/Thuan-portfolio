# Neon Portfolio

A one-page portfolio with a live 3D background (Three.js), neon bloom glow,
starfield particles, and glassmorphism sections.

## Run it

Serve the folder (ES modules need a server, not `file://`):

```bash
# any of these work
npx serve .
python -m http.server 8080
```

Then open http://localhost:8080

## Customize

- **Your info** — edit **`js/content.js`** — one file holds the name, bio, hero,
  stats, projects, skills, certifications, education, experience, contact, and
  social links. The page rebuilds itself from it on load; empty fields hide,
  empty lists hide whole sections. Profile photo: `images/me.png` (set `photo`
  in content.js).
- **Download Resume** — the hero button generates a PDF on the fly from
  `content.js` (via jsPDF from CDN), so it always matches your data.
- **Colors** — tweak the `--cyan` / `--magenta` / `--violet` variables at the top of `css/style.css`.
- **3D model** — a real model ships at `models/hero.glb` (baked from
  `scripts/export-hero.mjs`) and replaces the procedural shapes on load. To use
  your own, overwrite `models/hero.glb`, or drop a 3D Studio file named
  `hero.3ds` next to it. Re-bake the shipped model with `npm run export:model`.
  (Works over a server, e.g. `http://localhost:8080/models/hero.glb`.)

## Stack

- [Three.js](https://threejs.org) via CDN (unpkg) — no build step required
- UnrealBloomPass for the neon glow
- Vanilla CSS + IntersectionObserver animations
