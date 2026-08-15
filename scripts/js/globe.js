import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const canvas = document.getElementById("globe3d");
if (canvas) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x01040b, 0.055);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.1, 6.45);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 1.15, 0.65, 0.2));
  composer.addPass(new OutputPass());

  const world = new THREE.Group();
  world.rotation.z = -0.08;
  scene.add(world);

  const R = 2.02;
  const loader = new THREE.TextureLoader();

  const earthMaterial = new THREE.MeshStandardMaterial({
    color: 0x07111f,
    roughness: 0.78,
    metalness: 0.12,
    emissive: 0x02111f,
    emissiveIntensity: 1.15,
  });

  loader.load(
    "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      earthMaterial.map = texture;
      earthMaterial.color.set(0x0b2941);
      earthMaterial.emissiveMap = texture;
      earthMaterial.emissive.set(0x0088bb);
      earthMaterial.emissiveIntensity = 0.42;
      earthMaterial.needsUpdate = true;
    },
    undefined,
    () => {}
  );

  const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 96, 96), earthMaterial);
  world.add(earth);

  // Electric-blue grid shell.
  const grid = new THREE.Mesh(
    new THREE.SphereGeometry(R + 0.025, 48, 32),
    new THREE.MeshBasicMaterial({ color: 0x1ccfff, wireframe: true, transparent: true, opacity: 0.075, depthWrite: false })
  );
  world.add(grid);

  // Cyan coastline-like edge shimmer using a second transparent shell.
  const coastShell = new THREE.Mesh(
    new THREE.SphereGeometry(R + 0.014, 96, 96),
    new THREE.MeshBasicMaterial({ color: 0x00d8ff, transparent: true, opacity: 0.045, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  world.add(coastShell);

  // Atmospheric rim glow.
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(R + 0.13, 80, 80),
    new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        glowColor: { value: new THREE.Color(0x1bdcff) },
        purpleColor: { value: new THREE.Color(0x7c4dff) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main(){
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPosition = modelMatrix * vec4(position,1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        uniform vec3 glowColor;
        uniform vec3 purpleColor;
        void main(){
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          float rim = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.35);
          vec3 col = mix(glowColor, purpleColor, smoothstep(0.58, 1.0, rim));
          gl_FragColor = vec4(col, rim * 0.78);
        }
      `,
    })
  );
  world.add(atmosphere);

  // Major illuminated city points.
  const cities = [
    [40.71,-74.00],[34.05,-118.24],[51.50,-0.12],[48.85,2.35],[52.52,13.40],[25.20,55.27],
    [19.07,72.87],[28.61,77.20],[1.35,103.81],[35.67,139.65],[37.56,126.97],[-33.86,151.20],
    [31.23,121.47],[22.31,114.16],[-23.55,-46.63],[-26.20,28.04],[6.52,3.37],[30.04,31.23]
  ];
  const latLonToVec = (lat, lon, radius = R + 0.045) => {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  const cityGroup = new THREE.Group();
  cities.forEach((c, i) => {
    const p = latLonToVec(c[0], c[1]);
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(i % 5 === 0 ? 0.034 : 0.022, 10, 10),
      new THREE.MeshBasicMaterial({ color: i % 4 === 0 ? 0x9a6dff : 0x30e5ff })
    );
    dot.position.copy(p);
    cityGroup.add(dot);
  });
  world.add(cityGroup);

  // Thousands of subtle city-like light points distributed over the sphere.
  const count = window.innerWidth < 768 ? 1800 : 4300;
  const pts = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const rr = R + 0.035 + Math.random() * 0.018;
    pts[i*3] = rr * Math.sin(phi) * Math.cos(theta);
    pts[i*3+1] = rr * Math.cos(phi);
    pts[i*3+2] = rr * Math.sin(phi) * Math.sin(theta);
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pts, 3));
  const lights = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({ color: 0x5ee9ff, size: 0.014, transparent: true, opacity: 0.48, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  world.add(lights);

  // Connection arcs + traveling particles.
  const routes = [
    [[51.50,-0.12],[28.61,77.20]], [[40.71,-74.00],[51.50,-0.12]], [[25.20,55.27],[1.35,103.81]],
    [[35.67,139.65],[-33.86,151.20]], [[19.07,72.87],[35.67,139.65]], [[31.23,121.47],[37.56,126.97]]
  ];
  const movers = [];
  routes.forEach((route, idx) => {
    const a = latLonToVec(route[0][0], route[0][1], R + 0.05);
    const b = latLonToVec(route[1][0], route[1][1], R + 0.05);
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R + 0.72 + idx * 0.045);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(90));
    const color = idx % 3 === 0 ? 0x9b6cff : 0x25dcff;
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.42, blending: THREE.AdditiveBlending }));
    world.add(line);

    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 10, 10),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 })
    );
    world.add(particle);
    movers.push({ particle, curve, speed: 0.055 + idx * 0.007, offset: idx / routes.length });
  });

  // Elegant orbital rings.
  const rings = [];
  [[2.53,0x19dfff,1.18,0.14,.26],[2.64,0x8764ff,.72,-.52,.22],[2.77,0x4c7dff,1.46,.76,.15]].forEach(r => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r[0],0.009,8,240),new THREE.MeshBasicMaterial({color:r[1],transparent:true,opacity:r[4]}));
    ring.rotation.x = r[2]; ring.rotation.z = r[3]; world.add(ring); rings.push(ring);
  });

  // Holographic base.
  const base = new THREE.Group();
  [2.25,2.58,2.92].forEach((radius,i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, i === 0 ? 0.022 : 0.008, 8, 200),new THREE.MeshBasicMaterial({color:i===1?0x875cff:0x22dfff,transparent:true,opacity:0.42-i*0.07}));
    ring.rotation.x = Math.PI/2; ring.position.y = -2.2; base.add(ring);
  });
  scene.add(base);

  // Starfield inside the globe canvas for cinematic depth.
  const starCount = window.innerWidth < 768 ? 550 : 1300;
  const starPos = new Float32Array(starCount * 3);
  for (let i=0;i<starCount;i++) {
    const rr = 8 + Math.random()*18;
    const th = Math.random()*Math.PI*2;
    const ph = Math.acos(2*Math.random()-1);
    starPos[i*3]=rr*Math.sin(ph)*Math.cos(th);
    starPos[i*3+1]=rr*Math.cos(ph);
    starPos[i*3+2]=rr*Math.sin(ph)*Math.sin(th);
  }
  const sGeo = new THREE.BufferGeometry(); sGeo.setAttribute("position",new THREE.BufferAttribute(starPos,3));
  const stars = new THREE.Points(sGeo,new THREE.PointsMaterial({color:0xa6dfff,size:0.025,transparent:true,opacity:0.55,depthWrite:false}));
  scene.add(stars);

  scene.add(new THREE.AmbientLight(0x143a52, 1.25));
  const cyanLight = new THREE.PointLight(0x22ddff, 26, 18); cyanLight.position.set(-3.2,2.8,4.2); scene.add(cyanLight);
  const purpleLight = new THREE.PointLight(0x754cff, 22, 16); purpleLight.position.set(3.2,1.4,3.2); scene.add(purpleLight);
  const rimLight = new THREE.DirectionalLight(0x9feaff, 1.7); rimLight.position.set(-4,1,5); scene.add(rimLight);

  let targetX = 0, targetY = 0, mx = 0, my = 0;
  window.addEventListener("pointermove", e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
    targetX = -my * 0.08;
    targetY = mx * 0.12;
  }, { passive: true });

  function resize(){
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1,rect.width), h = Math.max(1,rect.height);
    renderer.setSize(w,h,false); composer.setSize(w,h);
    camera.aspect = w/h; camera.updateProjectionMatrix();
  }
  resize(); window.addEventListener("resize",resize);

  const clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    world.rotation.y = t * 0.075 + targetY;
    world.rotation.x += (targetX - world.rotation.x) * 0.035;
    grid.rotation.y = -t * 0.01;
    lights.rotation.y = t * 0.012;
    cityGroup.rotation.y = -t * 0.005;
    rings[0].rotation.z += 0.0008;
    rings[1].rotation.z -= 0.00065;
    rings[2].rotation.y += 0.00055;
    base.rotation.z = t * 0.018;
    stars.rotation.y = t * 0.004;
    movers.forEach(m => {
      const u = (t * m.speed + m.offset) % 1;
      m.particle.position.copy(m.curve.getPointAt(u));
    });
    composer.render();
  }
  animate();
}
