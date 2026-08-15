import * as THREE from "three";

const canvas = document.getElementById("globe3d");
if (canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 6.4);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const globe = new THREE.Group();
  scene.add(globe);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(2, 72, 72),
    new THREE.MeshPhongMaterial({
      color: 0x061321,
      emissive: 0x02131e,
      emissiveIntensity: 1.4,
      shininess: 35,
      transparent: true,
      opacity: 0.92,
    })
  );
  globe.add(core);

  const wire = new THREE.Mesh(
    new THREE.SphereGeometry(2.025, 34, 22),
    new THREE.MeshBasicMaterial({
      color: 0x19d9ff,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    })
  );
  globe.add(wire);

  const dotCount = 4200;
  const positions = new Float32Array(dotCount * 3);
  for (let i = 0; i < dotCount; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r = 2.045 + Math.random() * 0.015;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const dotsGeo = new THREE.BufferGeometry();
  dotsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const dots = new THREE.Points(
    dotsGeo,
    new THREE.PointsMaterial({
      color: 0x42ddff,
      size: 0.018,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  globe.add(dots);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(2.13, 64, 64),
    new THREE.MeshBasicMaterial({
      color: 0x5b7cff,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.10,
      blending: THREE.AdditiveBlending,
    })
  );
  globe.add(atmosphere);

  const makeRing = (radius, color, tiltX, tiltZ, opacity = 0.32) => {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.011, 8, 220),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity })
    );
    mesh.rotation.x = tiltX;
    mesh.rotation.z = tiltZ;
    globe.add(mesh);
    return mesh;
  };

  const ringA = makeRing(2.42, 0x24dbff, 1.12, 0.18, 0.36);
  const ringB = makeRing(2.55, 0x8b5cf6, 0.66, -0.52, 0.28);
  const ringC = makeRing(2.65, 0x5f7cff, 1.48, 0.78, 0.20);

  const nodeGroup = new THREE.Group();
  for (let i = 0; i < 24; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r = 2.18;
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.024 + Math.random() * 0.022, 10, 10),
      new THREE.MeshBasicMaterial({ color: i % 4 === 0 ? 0x9d5cff : 0x29dfff })
    );
    node.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
    nodeGroup.add(node);
  }
  globe.add(nodeGroup);

  const baseRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.35, 0.025, 12, 180),
    new THREE.MeshBasicMaterial({ color: 0x1adfff, transparent: true, opacity: 0.55 })
  );
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = -2.15;
  scene.add(baseRing);

  const baseRing2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.7, 0.008, 8, 180),
    new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.34 })
  );
  baseRing2.rotation.x = Math.PI / 2;
  baseRing2.position.y = -2.18;
  scene.add(baseRing2);

  scene.add(new THREE.AmbientLight(0x163a5c, 1.1));
  const cyanLight = new THREE.PointLight(0x20dfff, 13, 15);
  cyanLight.position.set(-3, 2, 4);
  scene.add(cyanLight);
  const purpleLight = new THREE.PointLight(0x8b5cf6, 12, 15);
  purpleLight.position.set(3, 1.5, 3);
  scene.add(purpleLight);

  let mx = 0;
  let my = 0;
  window.addEventListener("pointermove", (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    globe.rotation.y = t * 0.13 + mx * 0.07;
    globe.rotation.x += ((-my * 0.05) - globe.rotation.x) * 0.03;
    ringA.rotation.z += 0.0014;
    ringB.rotation.z -= 0.0010;
    ringC.rotation.y += 0.0012;
    nodeGroup.rotation.y = -t * 0.07;
    baseRing.rotation.z = t * 0.045;
    baseRing2.rotation.z = -t * 0.032;
    renderer.render(scene, camera);
  }
  animate();
}
