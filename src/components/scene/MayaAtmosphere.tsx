"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const VIOLET = new THREE.Color("#9d6bff");
const SOFT_VIOLET = new THREE.Color("#dbcaff");
const WHITE = new THREE.Color("#f4f6fb");

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smoothstep(value: number, min: number, max: number) {
  if (value <= min) return 0;
  if (value >= max) return 1;
  const x = (value - min) / (max - min);
  return x * x * (3 - 2 * x);
}

function makeEnvironment(renderer: THREE.WebGLRenderer) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#687080");
  gradient.addColorStop(0.25, "#313540");
  gradient.addColorStop(0.55, "#10121a");
  gradient.addColorStop(1, "#020307");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const shelf = ctx.createLinearGradient(0, 0, canvas.width, 0);
  shelf.addColorStop(0, "rgba(255,255,255,0)");
  shelf.addColorStop(0.32, "rgba(255,255,255,.5)");
  shelf.addColorStop(0.52, "rgba(242,237,255,.95)");
  shelf.addColorStop(0.72, "rgba(255,255,255,.35)");
  shelf.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shelf;
  ctx.fillRect(0, 82, canvas.width, 88);

  const violet = ctx.createRadialGradient(610, 342, 0, 610, 342, 230);
  violet.addColorStop(0, "rgba(151,103,255,.45)");
  violet.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = violet;
  ctx.fillRect(360, 100, 500, 430);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromEquirectangular(texture);
  texture.dispose();
  pmrem.dispose();
  return target;
}

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 126);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.08, "rgba(220,197,255,.98)");
  gradient.addColorStop(0.22, "rgba(158,102,255,.76)");
  gradient.addColorStop(0.52, "rgba(111,62,215,.24)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeDistortedRock(radius: number, detail: number, seed: number) {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const pos = geo.attributes.position;
  const random = rng(seed);
  const phaseA = random() * Math.PI * 2;
  const phaseB = random() * Math.PI * 2;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i += 1) {
    v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
    const n = v.clone().normalize();
    const waveA = Math.sin(n.x * 8.2 + n.y * 5.1 + n.z * 6.4 + phaseA) * 0.075;
    const waveB = Math.sin(n.x * 15.4 - n.y * 10.1 + n.z * 12.7 + phaseB) * 0.035;
    const ridge = Math.abs(Math.sin((n.x + n.z) * 10.0 + phaseB)) * 0.045;
    const scale = 1 + waveA + waveB - ridge + (random() - 0.5) * 0.018;
    v.multiplyScalar(scale);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function makeBeamMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: new THREE.Color("#e7defc") },
      uOpacity: { value: 0.26 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform vec3 uColor;
      uniform float uOpacity;
      void main(){
        float across = exp(-pow((vUv.x - .5) * 3.4, 2.0));
        float vertical = smoothstep(.02, .22, vUv.y) * (1.0 - smoothstep(.76, 1.0, vUv.y));
        gl_FragColor = vec4(uColor, uOpacity * across * vertical);
      }
    `,
  });
}

export function MayaAtmosphere() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const random = rng(2026091602);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#07080d", mobile ? 0.033 : 0.0205);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 120);
    camera.position.set(0, 0.1, 15.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x05060a, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.45));
    renderer.domElement.className = "maya-atmosphere-canvas";
    mount.appendChild(renderer.domElement);

    const envTarget = makeEnvironment(renderer);
    if (envTarget) scene.environment = envTarget.texture;

    const world = new THREE.Group();
    scene.add(world);

    scene.add(new THREE.AmbientLight(0x757985, 0.16));
    scene.add(new THREE.HemisphereLight(0xe5e8ef, 0x05060b, 0.72));

    const key = new THREE.SpotLight(0xf7f3ff, 78, 46, 0.48, 0.82, 1.35);
    key.position.set(-1.6, 10.5, 9.4);
    key.target.position.set(3.0, 0.15, -2.6);
    scene.add(key, key.target);

    const violetRim = new THREE.PointLight(0x8f55ff, 96, 24, 1.7);
    violetRim.position.set(5.8, -0.25, 3.6);
    scene.add(violetRim);

    const coldRim = new THREE.PointLight(0xe6ebff, 54, 20, 1.7);
    coldRim.position.set(1.0, 3.2, 5.2);
    scene.add(coldRim);

    const beam = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 19), makeBeamMaterial());
    beam.position.set(2.55, 3.5, -8.6);
    beam.rotation.z = -0.08;
    beam.rotation.x = -0.02;
    world.add(beam);

    const coreGroup = new THREE.Group();
    coreGroup.position.set(3.3, 0.0, -2.2);
    coreGroup.rotation.set(-0.06, 0.12, -0.04);
    world.add(coreGroup);

    const rockGeometry = makeDistortedRock(2.18, mobile ? 3 : 4, 77);
    const rockMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x090a0e,
      roughness: 0.48,
      metalness: 0.28,
      clearcoat: 0.42,
      clearcoatRoughness: 0.28,
      emissive: 0x12091f,
      emissiveIntensity: 0.22,
      envMapIntensity: 1.45,
    });
    const coreRock = new THREE.Mesh(rockGeometry, rockMaterial);
    coreRock.scale.set(1.12, 1.0, 0.94);
    coreGroup.add(coreRock);

    const glowTexture = makeGlowTexture();
    const glowSprite = glowTexture
      ? new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: glowTexture,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            opacity: 0.98,
          }),
        )
      : null;
    if (glowSprite) {
      glowSprite.scale.set(3.7, 3.7, 1);
      glowSprite.position.set(0.2, -0.05, 1.48);
      coreGroup.add(glowSprite);
    }

    const crackPositions: number[] = [];
    const crackRandom = rng(404);
    for (let i = 0; i < 88; i += 1) {
      const theta = crackRandom() * Math.PI * 2;
      const y = (crackRandom() - 0.5) * 1.5;
      const front = 0.42 + crackRandom() * 0.55;
      const dir = new THREE.Vector3(Math.cos(theta), y, front).normalize();
      const tangent = new THREE.Vector3(-dir.y, dir.x, (crackRandom() - 0.5) * 0.55).normalize();
      const len = 0.11 + crackRandom() * 0.42;
      const p1 = dir.clone().multiplyScalar(2.12 + crackRandom() * 0.12);
      const p2 = p1.clone().add(tangent.multiplyScalar(len)).normalize().multiplyScalar(2.14 + crackRandom() * 0.11);
      crackPositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }
    const crackGeo = new THREE.BufferGeometry();
    crackGeo.setAttribute("position", new THREE.Float32BufferAttribute(crackPositions, 3));
    const cracks = new THREE.LineSegments(
      crackGeo,
      new THREE.LineBasicMaterial({
        color: 0xc6a8ff,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    cracks.scale.copy(coreRock.scale).multiplyScalar(1.012);
    coreGroup.add(cracks);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xc3a5ff,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ringSpecs = [
      [3.48, 0.009, 0.16, 0.5, 0.14],
      [3.9, 0.008, -0.42, -0.18, 0.5],
      [3.08, 0.007, 0.72, 0.32, -0.3],
      [4.25, 0.006, 0.28, -0.5, -0.1],
    ] as const;
    const rings: THREE.Mesh[] = [];
    ringSpecs.forEach(([radius, tube, rx, ry, rz]) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 5, 220), ringMaterial.clone());
      ring.rotation.set(rx, ry, rz);
      ring.scale.y = 0.62;
      coreGroup.add(ring);
      rings.push(ring);
    });

    const satelliteMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0a0b10,
      roughness: 0.56,
      metalness: 0.24,
      clearcoat: 0.32,
      clearcoatRoughness: 0.24,
      emissive: 0x11091d,
      emissiveIntensity: 0.2,
      envMapIntensity: 1.15,
    });
    const satellites: THREE.Mesh[] = [];
    for (let i = 0; i < (mobile ? 12 : 26); i += 1) {
      const geo = makeDistortedRock(0.24 + random() * 0.34, 1, 200 + i);
      const shard = new THREE.Mesh(geo, satelliteMaterial.clone());
      const angle = random() * Math.PI * 2;
      const radius = 2.65 + random() * 3.6;
      shard.position.set(Math.cos(angle) * radius, (random() - 0.5) * 6.2, Math.sin(angle) * radius * 0.52 + (random() - 0.5) * 1.4);
      shard.rotation.set(random() * 4, random() * 4, random() * 4);
      shard.scale.set(0.7 + random() * 0.9, 0.7 + random() * 1.2, 0.65 + random() * 0.95);
      shard.userData.spin = new THREE.Vector3((random() - 0.5) * 0.005, (random() - 0.5) * 0.006, (random() - 0.5) * 0.004);
      coreGroup.add(shard);
      satellites.push(shard);
    }

    const particleCount = mobile ? 520 : 1450;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      particlePositions[i * 3] = (random() - 0.5) * 25;
      particlePositions[i * 3 + 1] = (random() - 0.5) * 14;
      particlePositions[i * 3 + 2] = -1 - random() * 30;
      const c = i % 37 === 0 ? SOFT_VIOLET : WHITE;
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particlesGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: mobile ? 0.021 : 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    world.add(particles);

    const backgroundRocks = new THREE.Group();
    world.add(backgroundRocks);
    const bgMaterial = new THREE.MeshStandardMaterial({
      color: 0x06070a,
      roughness: 0.94,
      metalness: 0.04,
      emissive: 0x0c0811,
      emissiveIntensity: 0.18,
      envMapIntensity: 0.5,
    });
    const bgRocks: THREE.Mesh[] = [];
    const bgCount = mobile ? 18 : 42;
    for (let i = 0; i < bgCount; i += 1) {
      const geo = makeDistortedRock(0.38 + random() * 0.7, 1, 800 + i);
      const rock = new THREE.Mesh(geo, bgMaterial.clone());
      const side = i % 2 === 0 ? -1 : 1;
      rock.position.set(side * (4.8 + random() * 7.5), (random() - 0.5) * 9.5, -3 - random() * 18);
      const s = 0.45 + random() * 1.5;
      rock.scale.setScalar(s);
      rock.rotation.set(random() * 4, random() * 4, random() * 4);
      backgroundRocks.add(rock);
      bgRocks.push(rock);
    }

    let width = 1;
    let height = 1;
    const resize = () => {
      const rect = mount.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    window.addEventListener("resize", resize);

    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    const onPointer = (event: PointerEvent) => {
      pointerTarget.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!mobile) window.addEventListener("pointermove", onPointer, { passive: true });

    const clock = new THREE.Clock();
    let raf = 0;
    const render = () => {
      const t = clock.getElapsedTime();
      const scrollVh = window.scrollY / Math.max(1, window.innerHeight);
      const heroFade = smoothstep(scrollVh, 0.78, 1.5);

      pointer.lerp(pointerTarget, 0.04);
      coreGroup.rotation.x = -0.06 - pointer.y * 0.035 + Math.sin(t * 0.15) * 0.018;
      coreGroup.rotation.y = 0.12 + pointer.x * 0.055 + Math.sin(t * 0.11) * 0.045;
      coreGroup.position.y = Math.sin(t * 0.3) * 0.055 - heroFade * 0.45;
      coreGroup.position.x = 3.3 + heroFade * 0.8;

      if (!reduceMotion) {
        coreRock.rotation.y += 0.00042;
        cracks.rotation.y = coreRock.rotation.y;
        rings.forEach((ring, i) => {
          ring.rotation.z += (i % 2 ? -1 : 1) * 0.00052;
        });
        satellites.forEach((mesh) => {
          const spin = mesh.userData.spin as THREE.Vector3;
          mesh.rotation.x += spin.x;
          mesh.rotation.y += spin.y;
          mesh.rotation.z += spin.z;
        });
      }

      particles.rotation.y = t * 0.004;
      particles.position.y = -heroFade * 0.35;
      backgroundRocks.rotation.y = t * 0.004;

      renderer.domElement.style.opacity = String(1 - heroFade * 0.88);
      mount.style.setProperty("--hero-fade", String(heroFade));

      camera.position.x = pointer.x * 0.16;
      camera.position.y = -pointer.y * 0.09;
      camera.lookAt(2.1, 0, -4.2);

      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(render);
    };
    raf = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (!mobile) window.removeEventListener("pointermove", onPointer);

      renderer.dispose();
      envTarget?.dispose();
      glowTexture?.dispose();
      rockGeometry.dispose();
      rockMaterial.dispose();
      crackGeo.dispose();
      (cracks.material as THREE.Material).dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      rings.forEach((mesh) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      satellites.forEach((mesh) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      bgRocks.forEach((mesh) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      (beam.material as THREE.Material).dispose();
      beam.geometry.dispose();
      if (glowSprite) (glowSprite.material as THREE.Material).dispose();

      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={mountRef} className="maya-atmosphere" aria-hidden="true">
      <div className="maya-light maya-light-rays" />
      <div className="maya-light maya-light-glint" />
      <div className="maya-light maya-light-bokeh" />
      <div className="maya-grain" />
    </div>
  );
}
