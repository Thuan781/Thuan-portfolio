/* ============================================================
   NEON 3D BACKGROUND
   - Procedural neon shapes with UnrealBloom glow
   - Starfield particles
   - Mouse parallax + scroll drift
   - Optionally swaps the hero shape for models/hero.glb
   ============================================================ */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { TDSLoader } from "three/addons/loaders/TDSLoader.js";

/* ============================================================
   CONTENT RENDER — all personal details come from js/content.js
   Empty fields are hidden; empty lists hide their whole section.
   ============================================================ */
function renderContent() {
  const C = window.SITE_CONTENT;
  if (!C) return;

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

  const fill = (sel, text) => {
    const el = document.querySelector(sel);
    if (!el) return;
    if (text === undefined || text === null || text === "") {
      el.style.display = "none";
      return;
    }
    el.textContent = text;
    el.style.display = "";
  };

  const initials = (name) =>
    String(name)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");

  // identity + SEO
  fill("[data-c=logo]", initials(C.name) || "AM");
  fill("[data-c=footerName]", C.name);
  document.title = C.pageTitle || (C.name && C.role ? `${C.name} — ${C.role}` : C.name || "Portfolio");
  const meta = document.querySelector('meta[name="description"]');
  if (meta && C.metaDescription) meta.setAttribute("content", C.metaDescription);

  // hero
  fill("[data-c=heroKicker]", C.hero && C.hero.kicker);
  fill("[data-c=heroTitle1]", C.hero && C.hero.title1);
  fill("[data-c=heroTitleAccent]", C.hero && C.hero.titleAccent);
  fill("[data-c=heroTitle2]", C.hero && C.hero.title2);
  fill("[data-c=heroTitleNeon]", C.hero && C.hero.titleNeon);
  fill("[data-c=heroSubtitle]", C.hero && C.hero.subtitle);
  fill("[data-c=heroRole]", C.hero && C.hero.roleLine);
  const h1 = document.querySelector(".hero-title");
  if (h1 && C.hero) {
    const label = [C.hero.title1, C.hero.titleAccent, C.hero.title2, C.hero.titleNeon]
      .filter(Boolean)
      .join(" ");
    if (label) h1.setAttribute("aria-label", label);
  }

  // stats
  const statsEl = document.querySelector("[data-c=stats]");
  if (statsEl) {
    if (C.stats && C.stats.length) {
      statsEl.innerHTML = C.stats
        .map((s) => `<li><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></li>`)
        .join("");
    } else {
      statsEl.style.display = "none";
    }
  }

  // about photo (neon frame) — initials avatar until a real photo is set
  const photoEl = document.querySelector("[data-c=photoSlot]");
  if (photoEl) {
    const avatarHTML = (nm) =>
      `<div class="photo-avatar"><span class="initials">${esc(initials(nm) || "AM")}</span><span class="spark">✦</span></div>`;
    if (C.photo) {
      const img = document.createElement("img");
      img.src = C.photo;
      img.alt = C.name ? `Portrait of ${C.name}` : "Portrait";
      img.loading = "lazy";
      img.addEventListener("error", () => {
        photoEl.innerHTML = avatarHTML(C.name); // missing file → avatar
      });
      photoEl.appendChild(img);
    } else {
      photoEl.innerHTML = avatarHTML(C.name);
    }
  }

  // about paragraphs
  const aboutP = document.querySelector("[data-c=aboutParagraphs]");
  if (aboutP) {
    if (C.about && C.about.paragraphs && C.about.paragraphs.length) {
      aboutP.innerHTML = C.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("");
    } else {
      aboutP.style.display = "none";
    }
  }

  // about code card
  const codeEl = document.querySelector("[data-c=aboutCode]");
  if (codeEl && C.about && C.about.code) {
    const c = C.about.code;
    const stack = (c.stack || []).map((s) => `<span class="s">"${esc(s)}"</span>`).join(", ");
    const avail = c.available ? `<span class="k">true</span>` : `<span class="k">false</span>`;
    codeEl.innerHTML = [
      `<span class="c"># currently</span>`,
      `role       = <span class="s">"${esc(c.role || "")}"</span>`,
      `stack      = [${stack}]`,
      `location   = <span class="s">"${esc(c.location || "")}"</span>`,
      `available  = ${avail}${c.availableNote ? `  <span class="c">${esc(c.availableNote)}</span>` : ""}`,
      `status     = <span class="s">"${esc(c.status || "")}"</span> ✦`,
    ].join("\n");
  }

  // projects
  const projectsEl = document.querySelector("[data-c=projects]");
  if (projectsEl) {
    if (C.projects && C.projects.length) {
      projectsEl.innerHTML = C.projects
        .map((p, i) => {
          const tone = p.tone || (i % 4) + 1;
          const tags = (p.tags || []).map((t) => `<span>${esc(t)}</span>`).join("");
          return `
          <article class="p-card">
            <div class="thumb t${tone}" aria-hidden="true"><span>${esc(p.icon || "◮")}</span></div>
            <h3>${esc(p.title || "")}</h3>
            <p>${esc(p.desc || "")}</p>
            <div class="tags">${tags}</div>
          </article>`;
        })
        .join("");
    } else {
      projectsEl.style.display = "none";
      const sec = document.getElementById("projects");
      if (sec) sec.style.display = "none";
    }
  }

  // skills
  const skillsEl = document.querySelector("[data-c=skills]");
  if (skillsEl) {
    if (C.skills && C.skills.length) {
      skillsEl.innerHTML = C.skills.map((s) => `<span class="chip">${esc(s)}</span>`).join("");
    } else {
      skillsEl.style.display = "none";
      const sec = document.getElementById("skills");
      if (sec) sec.style.display = "none";
    }
  }

  // experience (timeline)
  const expEl = document.querySelector("[data-c=experience]");
  if (expEl) {
    if (C.experience && C.experience.length) {
      expEl.innerHTML = C.experience
        .map((e) => `
          <div class="t-entry">
            <span class="t-dot"></span>
            <div class="t-card">
              <div class="t-period">${esc(e.period || "")}${e.current ? `<span class="t-now">● Current</span>` : ""}</div>
              <h3>${esc(e.title || "")}</h3>
              <p class="t-company">${esc(e.company || "")}</p>
              <ul>${(e.bullets || []).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
            </div>
          </div>`)
        .join("");
    } else {
      expEl.style.display = "none";
      const sec = document.getElementById("experience");
      if (sec) sec.style.display = "none";
    }
  }

  // certifications
  const certEl = document.querySelector("[data-c=certifications]");
  if (certEl) {
    if (C.certifications && C.certifications.length) {
      certEl.innerHTML = C.certifications
        .map((c) => `<div class="cert-card"><span class="cert-icon">✦</span><span>${esc(c)}</span></div>`)
        .join("");
    } else {
      certEl.style.display = "none";
      const sec = document.getElementById("certifications");
      if (sec) sec.style.display = "none";
    }
  }

  // education
  const eduEl = document.querySelector("[data-c=education]");
  if (eduEl) {
    if (C.education && C.education.length) {
      eduEl.innerHTML = C.education
        .map(
          (e) => `
          <div class="edu-card">
            <div class="t-period">${esc(e.period || "")}</div>
            <h3>${esc(e.degree || "")}</h3>
            <p class="edu-school">${esc(e.school || "")}</p>
            ${e.languages && e.languages.length ? `<p class="edu-lang"><span class="kicker-mini">Languages</span>${esc(e.languages.join(" · "))}</p>` : ""}
          </div>`
        )
        .join("");
    } else {
      eduEl.style.display = "none";
      const sec = document.getElementById("education");
      if (sec) sec.style.display = "none";
    }
  }

  // contact
  fill("[data-c=contactTitle1]", C.contact && C.contact.title1);
  fill("[data-c=contactTitleAccent]", C.contact && C.contact.titleAccent);
  fill("[data-c=contactSubtitle]", C.contact && C.contact.subtitle);
  const emailEl = document.querySelector("[data-c=email]");
  if (emailEl) {
    const em = C.contact && C.contact.email;
    if (em) {
      emailEl.href = "mailto:" + em;
      emailEl.textContent = em;
    } else {
      emailEl.style.display = "none";
    }
  }

  // contact LinkedIn button + footer LinkedIn link
  const linkedinEl = document.querySelector("[data-c=linkedin]");
  if (linkedinEl) {
    const url = C.contact && C.contact.linkedin;
    if (url && url !== "#") linkedinEl.href = url;
    else linkedinEl.style.display = "none";
  }
  const footerLi = document.querySelector("[data-c=footerLinkedin]");
  if (footerLi) {
    const url = C.contact && C.contact.linkedin;
    if (url && url !== "#") footerLi.href = url;
    else footerLi.style.display = "none";
  }

  // socials ("#" urls are treated as empty → hidden)
  const socialsEl = document.querySelector("[data-c=socials]");
  if (socialsEl) {
    const links = (C.socials || []).filter((s) => s && s.label && s.url && s.url !== "#");
    if (links.length) {
      socialsEl.innerHTML = links
        .map((s) => `<a href="${esc(s.url)}" aria-label="${esc(s.label)}">${esc(s.label)}</a>`)
        .join("");
    } else {
      socialsEl.style.display = "none";
    }
  }

  // year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

renderContent();

const canvas = document.getElementById("bg");

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.innerWidth < 768;

if (!webglAvailable()) {
  document.body.classList.add("no-webgl");
} else {
  initScene();
}

function initScene() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05060a, 0.045);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    120
  );
  camera.position.set(0, 0.6, 9);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  /* ---------------- lights ---------------- */
  scene.add(new THREE.AmbientLight(0x1a1f3d, 0.6));

  const cyanLight = new THREE.PointLight(0x00f0ff, 90, 30);
  cyanLight.position.set(3.5, 2.5, 4);
  scene.add(cyanLight);

  const magentaLight = new THREE.PointLight(0xff2bd6, 70, 30);
  magentaLight.position.set(-4, -1.5, 3.5);
  scene.add(magentaLight);

  const violetLight = new THREE.PointLight(0xb14bff, 60, 30);
  violetLight.position.set(0, -3, 2);
  scene.add(violetLight);

  /* ---------------- hero shapes ---------------- */
  const heroGroup = new THREE.Group();
  scene.add(heroGroup);

  // Neon torus knot (main piece)
  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.15, 0.32, 220, 36),
    new THREE.MeshStandardMaterial({
      color: 0x0a0f1e,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.7,
      metalness: 0.9,
      roughness: 0.25,
    })
  );
  heroGroup.add(knot);

  // Wireframe icosahedron shell
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.15, 1),
    new THREE.MeshBasicMaterial({
      color: 0xff2bd6,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    })
  );
  heroGroup.add(shell);

  // Violet ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.62, 0.035, 12, 110),
    new THREE.MeshBasicMaterial({ color: 0xb14bff })
  );
  ring.rotation.x = Math.PI / 2.4;
  heroGroup.add(ring);

  // Orbiting satellites
  const satellites = new THREE.Group();
  const satColors = [0x00f0ff, 0xff2bd6, 0xb14bff];
  for (let i = 0; i < 7; i++) {
    const sat = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.09 + Math.random() * 0.07),
      new THREE.MeshBasicMaterial({ color: satColors[i % 3] })
    );
    const angle = (i / 7) * Math.PI * 2;
    const radius = 2.5 + Math.random() * 0.8;
    sat.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 1.6) * 0.7,
      Math.sin(angle) * radius
    );
    satellites.add(sat);
  }
  heroGroup.add(satellites);

  /* ---------------- starfield ---------------- */
  const starCount = isMobile ? 700 : 1500;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 10 + Math.random() * 26;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
    starPositions[i * 3 + 2] = r * Math.cos(phi);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      color: 0x88ffff,
      size: 0.035,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  scene.add(stars);

  // Neon grid floor
  const grid = new THREE.GridHelper(46, 46, 0x00f0ff, 0x241a55);
  grid.position.y = -3.1;
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  scene.add(grid);

  /* ---------------- bloom post-processing ---------------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.35, // strength
    0.55, // radius
    0.18  // threshold
  );
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------------- optional model: models/hero.glb or hero.3ds ----------------
     If a file exists it replaces the procedural hero shape. Nothing found →
     the procedural torus knot stays. */
  const gltfLoader = new GLTFLoader();
  const tdsLoader = new TDSLoader();

  async function probe(url) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      return res.ok;
    } catch {
      return false;
    }
  }

  function adoptModel(model, scale) {
    model.scale.setScalar(scale);
    model.traverse((o) => {
      if (o.isMesh && o.material) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (m.isLineBasicMaterial) return; // keep line colors
          // Keep materials that were authored with a glow; give plain
          // materials a neon emissive boost so everything lights up.
          const darkEmissive =
            !m.emissive || m.emissive.r + m.emissive.g + m.emissive.b < 0.05;
          if (darkEmissive) {
            m.emissive = m.emissive || new THREE.Color();
            m.emissive.copy(m.color || new THREE.Color(0xffffff)).lerp(new THREE.Color(0x00f0ff), 0.6);
            m.emissiveIntensity = 0.5;
          }
          if ("metalness" in m) m.metalness = 0.8;
          if ("roughness" in m) m.roughness = 0.3;
        });
      }
    });
    scene.remove(heroGroup);
    scene.add(model);
    window.__heroModel = model; // consumed by the animation loop
  }

  (async () => {
    if (await probe("models/hero.glb")) {
      gltfLoader.load("models/hero.glb", (g) => adoptModel(g.scene, 2.2));
    } else if (await probe("models/hero.3ds")) {
      tdsLoader.load("models/hero.3ds", (obj) => adoptModel(obj, 1.8));
    }
  })();

  /* ---------------- interaction ---------------- */
  const mouse = { x: 0, y: 0 };
  let scrollY = 0;

  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener(
    "scroll",
    () => {
      scrollY = window.scrollY;
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ---------------- animation loop ---------------- */
  const clock = new THREE.Clock();
  const speed = prefersReduced ? 0.12 : 1;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime() * speed;

    const hero = window.__heroModel || heroGroup;
    hero.rotation.y = t * 0.14 + mouse.x * 0.35;
    hero.rotation.x = Math.sin(t * 0.12) * 0.18 + mouse.y * 0.18;

    knot.rotation.x = t * 0.4;
    knot.rotation.y = t * 0.25;
    shell.rotation.y = -t * 0.1;
    ring.rotation.z = t * 0.22;
    satellites.rotation.y = -t * 0.55;
    stars.rotation.y = t * 0.02;

    // Mouse parallax
    camera.position.x += (mouse.x * 1.1 - camera.position.x) * 0.045;
    camera.position.y += (0.6 + mouse.y * 0.55 - camera.position.y) * 0.045;

    // Scroll drift: camera drifts back and down as you scroll
    const targetZ = 9 + Math.min(scrollY * 0.006, 4);
    const targetY = 0.6 + mouse.y * 0.55 + Math.min(scrollY * 0.004, 3);
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.lookAt(0, -scrollY * 0.002, 0);

    composer.render();
  }
  animate();
}

/* ============================================================
   NAV TOGGLE
   ============================================================ */
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
});

navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  })
);

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el, i) => {
  el.setAttribute("data-delay", String(i % 4));
  io.observe(el);
});

/* ============================================================
   DOWNLOAD RESUME — generates a PDF from js/content.js
   ============================================================ */
function downloadResume() {
  const C = window.SITE_CONTENT;
  if (!C || !window.jspdf) {
    alert("The resume generator couldn't load. Check your connection and try again.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  const maxW = W - M * 2;
  let y = M;

  const ensure = (need) => {
    if (y + need > H - M) {
      doc.addPage();
      y = M;
    }
  };

  const write = (text, size, opts = {}) => {
    const { bold = false, color = 60, gap = 2, max = maxW, italic = false } = opts;
    doc.setFont("helvetica", italic ? "italic" : bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, max);
    ensure(lines.length * size * 1.35);
    doc.text(lines, M, y);
    y += lines.length * size * 1.35 + gap;
  };

  const section = (title) => {
    ensure(56);
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15);
    doc.text(title.toUpperCase(), M, y);
    y += 6;
    doc.setDrawColor(190);
    doc.setLineWidth(0.8);
    doc.line(M, y, W - M, y);
    y += 18;
  };

  // header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.setTextColor(15);
  doc.text(C.name, M, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(70);
  doc.text(C.role, M, y);
  y += 16;
  doc.setFontSize(9);
  doc.setTextColor(110);
  const contactLine = [C.location, C.contact && C.contact.email, C.contact && C.contact.linkedin]
    .filter(Boolean)
    .join("  |  ");
  doc.text(contactLine, M, y);
  y += 22;

  // about
  section("About");
  (C.about && C.about.paragraphs ? C.about.paragraphs : []).forEach((p) => write(p, 10, { gap: 7 }));

  // experience
  if (C.experience && C.experience.length) {
    section("Experience");
    C.experience.forEach((e) => {
      write(`${e.title} — ${e.company}`, 11, { bold: true, color: 25, gap: 3 });
      write(e.period, 9, { italic: true, color: 110, gap: 5 });
      (e.bullets || []).forEach((b) => write(`•  ${b}`, 10, { max: maxW - 12, gap: 3 }));
      y += 8;
    });
  }

  // education
  if (C.education && C.education.length) {
    section("Education");
    C.education.forEach((e) => {
      write(`${e.degree} — ${e.school}`, 11, { bold: true, color: 25, gap: 3 });
      write(e.period, 9, { italic: true, color: 110, gap: 4 });
      if (e.languages && e.languages.length) write(`Languages: ${e.languages.join(", ")}`, 10, { gap: 3 });
    });
  }

  // projects
  if (C.projects && C.projects.length) {
    section("Projects");
    C.projects.forEach((p) => {
      write(p.title, 11, { bold: true, color: 25, gap: 3 });
      write(p.desc, 10, { gap: 2 });
      if (p.tags && p.tags.length) write(`Technologies: ${p.tags.join(", ")}`, 9, { italic: true, color: 110, gap: 8 });
    });
  }

  // skills
  if (C.skills && C.skills.length) {
    section("Skills");
    write(C.skills.join(", "), 10, { gap: 3 });
  }

  // certifications
  if (C.certifications && C.certifications.length) {
    section("Certifications");
    C.certifications.forEach((c) => write(`•  ${c}`, 10, { max: maxW - 12, gap: 4 }));
  }

  doc.save(`${C.name.replace(/\s+/g, "_")}_Resume.pdf`);
}

const resumeBtn = document.getElementById("resumeBtn");
if (resumeBtn) resumeBtn.addEventListener("click", downloadResume);

