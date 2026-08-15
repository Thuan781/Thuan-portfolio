import * as THREE from "three";

const canvas = document.getElementById("globe3d");
if (canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0.1, 6.7);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const globe = new THREE.Group();
  globe.rotation.x = -0.12;
  globe.rotation.z = -0.06;
  scene.add(globe);

  const textureLoader = new THREE.TextureLoader();
  const earthMat = new THREE.MeshPhongMaterial({
    color: 0x51a8ff,
    emissive: 0x06152d,
    emissiveIntensity: 1.0,
    specular: 0x8edfff,
    shininess: 18,
  });

  textureLoader.load(
    "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      earthMat.map = tex;
      earthMat.needsUpdate = true;
    }
  );

  const earth = new THREE.Mesh(new THREE.SphereGeometry(2.02, 96, 96), earthMat);
  globe.add(earth);

  const wire = new THREE.Mesh(
    new THREE.SphereGeometry(2.055, 44, 28),
    new THREE.MeshBasicMaterial({
      color: 0x22dfff,
      wireframe: true,
      transparent: true,
      opacity: 0.13,
      blending: THREE.AdditiveBlending,
    })
  );
  globe.add(wire);

  const dotCount = 5200;
  const dotPositions = new Float32Array(dotCount * 3);
  for (let i = 0; i < dotCount; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r = 2.075 + Math.random() * 0.016;
    dotPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    dotPositions[i * 3 + 1] = r * Math.cos(phi);
    dotPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const dotsGeo = new THREE.BufferGeometry();
  dotsGeo.setAttribute("position", new THREE.BufferAttribute(dotPositions, 3));
  const dots = new THREE.Points(
    dotsGeo,
    new THREE.PointsMaterial({
      color: 0x54e7ff,
      size: 0.014,
      transparent: true,
      opacity: 0.46,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  globe.add(dots);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(2.16, 72, 72),
    new THREE.MeshBasicMaterial({
      color: 0x4f7dff,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
    })
  );
  globe.add(atmosphere);

  const outerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(2.24, 72, 72),
    new THREE.MeshBasicMaterial({
      color: 0x22dfff,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.045,
      blending: THREE.AdditiveBlending,
    })
  );
  globe.add(outerGlow);

  const makeOrbit = (radius, color, tiltX, tiltY, tiltZ, opacity) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.012, 8, 260),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending })
    );
    ring.rotation.set(tiltX, tiltY, tiltZ);
    globe.add(ring);
    return ring;
  };
  const ringA = makeOrbit(2.42, 0x26e6ff, 1.15, 0.10, 0.12, 0.48);
  const ringB = makeOrbit(2.58, 0x8b5cf6, 0.76, 0.55, -0.42, 0.40);
  const ringC = makeOrbit(2.72, 0x367cff, 1.48, -0.30, 0.68, 0.27);

  const latLon = (lat, lon, radius = 2.10) => {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  const arcPairs = [
    [[28.6,77.2],[35.7,139.7]], [[28.6,77.2],[1.35,103.8]],
    [[35.7,139.7],[37.8,-122.4]], [[1.35,103.8],[-33.9,151.2]],
    [[25.2,55.3],[51.5,-0.1]], [[19.1,72.9],[40.7,-74.0]],
    [[13.7,100.5],[34.1,-118.2]], [[31.2,121.5],[52.5,13.4]]
  ];

  const arcGroup = new THREE.Group();
  arcPairs.forEach((pair, i) => {
    const a = latLon(pair[0][0], pair[0][1]);
    const b = latLon(pair[1][0], pair[1][1]);
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(2.9 + (i % 3) * 0.18);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 56, 0.009, 6, false),
      new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0xb04cff : 0x23dfff,
        transparent: true,
        opacity: 0.78,
        blending: THREE.AdditiveBlending,
      })
    );
    arcGroup.add(tube);
  });
  globe.add(arcGroup);

  const nodeGroup = new THREE.Group();
  const nodeCities = [[28.6,77.2],[35.7,139.7],[1.35,103.8],[-33.9,151.2],[25.2,55.3],[51.5,-0.1],[37.8,-122.4],[40.7,-74.0],[31.2,121.5]];
  nodeCities.forEach((c, i) => {
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 12, 12),
      new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xbb55ff : 0x39e7ff })
    );
    node.position.copy(latLon(c[0], c[1], 2.12));
    nodeGroup.add(node);
  });
  globe.add(nodeGroup);

  const base = new THREE.Group();
  const baseRing1 = new THREE.Mesh(
    new THREE.TorusGeometry(2.38, 0.025, 10, 220),
    new THREE.MeshBasicMaterial({ color: 0x20dfff, transparent: true, opacity: 0.76, blending: THREE.AdditiveBlending })
  );
  const baseRing2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.72, 0.011, 8, 220),
    new THREE.MeshBasicMaterial({ color: 0x7b55ff, transparent: true, opacity: 0.50, blending: THREE.AdditiveBlending })
  );
  const baseRing3 = new THREE.Mesh(
    new THREE.TorusGeometry(3.05, 0.005, 8, 220),
    new THREE.MeshBasicMaterial({ color: 0x1f70ff, transparent: true, opacity: 0.25 })
  );
  [baseRing1, baseRing2, baseRing3].forEach((r) => { r.rotation.x = Math.PI / 2; r.position.y = -2.28; base.add(r); });
  scene.add(base);

  scene.add(new THREE.AmbientLight(0x17375c, 1.6));
  const key = new THREE.DirectionalLight(0x6edfff, 3.4);
  key.position.set(-4, 3, 6);
  scene.add(key);
  const cyan = new THREE.PointLight(0x20dfff, 18, 16);
  cyan.position.set(-3.3, 1.5, 4.5);
  scene.add(cyan);
  const purple = new THREE.PointLight(0xa855f7, 17, 16);
  purple.position.set(3.2, 2.2, 3.2);
  scene.add(purple);

  let mx = 0, my = 0;
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
    globe.rotation.y = 0.42 + t * 0.065 + mx * 0.035;
    globe.rotation.x += ((-0.10 - my * 0.035) - globe.rotation.x) * 0.025;
    ringA.rotation.z += 0.0010;
    ringB.rotation.z -= 0.0008;
    ringC.rotation.y += 0.0007;
    arcGroup.children.forEach((arc, i) => { arc.material.opacity = 0.58 + Math.sin(t * 1.5 + i) * 0.20; });
    nodeGroup.children.forEach((node, i) => { const s = 1 + Math.sin(t * 2.3 + i) * 0.35; node.scale.setScalar(s); });
    baseRing1.rotation.z = t * 0.035;
    baseRing2.rotation.z = -t * 0.025;
    baseRing3.rotation.z = t * 0.018;
    renderer.render(scene, camera);
  }
  animate();
}
