/* ============================================================
   Generate models/hero.glb — the neon hero model used by the
   portfolio. Run with:  npm run export:model
   Re-run after tweaking geometry/materials to re-bake the file.
   ============================================================ */
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { Blob } from "node:buffer";
import { mkdirSync, writeFileSync } from "node:fs";

// GLTFExporter relies on browser Blob/FileReader APIs — polyfill for Node.
if (!globalThis.Blob) globalThis.Blob = Blob;
if (!globalThis.FileReader) {
  globalThis.FileReader = class {
    readAsArrayBuffer(blob) {
      blob
        .arrayBuffer()
        .then((buf) => {
          this.result = buf;
          this.onload?.();
          this.onloadend?.();
        })
        .catch((err) => this.onerror?.(err));
    }
  };
}
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const scene = new THREE.Scene();

const neon = (color, intensity = 1.7) =>
  new THREE.MeshStandardMaterial({
    color: 0x0a0f1e,
    emissive: color,
    emissiveIntensity: intensity,
    metalness: 0.9,
    roughness: 0.25,
  });

// Main torus knot
const knot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.15, 0.32, 220, 36),
  neon(0x00f0ff)
);
scene.add(knot);

// Wireframe shell around it
const shellLines = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.15, 1)),
  new THREE.LineBasicMaterial({ color: 0xff2bd6, transparent: true, opacity: 0.35 })
);
scene.add(shellLines);

// Violet ring
const ring = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.035, 12, 110), neon(0xb14bff, 2.2));
ring.rotation.x = Math.PI / 2.4;
scene.add(ring);

// Orbiting satellites
const satColors = [0x00f0ff, 0xff2bd6, 0xb14bff];
for (let i = 0; i < 7; i++) {
  const sat = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.09 + Math.random() * 0.07),
    neon(satColors[i % 3], 2.4)
  );
  const angle = (i / 7) * Math.PI * 2;
  const radius = 2.5 + Math.random() * 0.8;
  sat.position.set(
    Math.cos(angle) * radius,
    Math.sin(angle * 1.6) * 0.7,
    Math.sin(angle) * radius
  );
  scene.add(sat);
}

const exporter = new GLTFExporter();

try {
  const result = await exporter.parseAsync(scene, { binary: true });
  const outDir = join(root, "models");
  mkdirSync(outDir, { recursive: true });
  const out = join(outDir, "hero.glb");
  if (result instanceof ArrayBuffer) {
    writeFileSync(out, Buffer.from(result));
  } else {
    writeFileSync(out, JSON.stringify(result, null, 2));
  }
  console.log(`✔ wrote ${out} (${(Buffer.byteLength(result) / 1024).toFixed(1)} KB)`);
} catch (err) {
  console.error("Export failed:", err);
  process.exit(1);
}
