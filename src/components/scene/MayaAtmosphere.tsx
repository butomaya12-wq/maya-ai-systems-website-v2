"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const VIOLET = new THREE.Color("#9b6dff");
const SOFT_VIOLET = new THREE.Color("#c7b4ff");
const WHITE = new THREE.Color("#eef1f7");

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

export function MayaAtmosphere() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#080a10", mobile ? 0.028 : 0.021);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 120);
    camera.position.set(0.1, 0.15, 15.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x05060a, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.35));
    renderer.domElement.className = "maya-atmosphere-canvas";
    mount.appendChild(renderer.domElement);

    const world = new THREE.Group();
    scene.add(world);

    scene.add(new THREE.AmbientLight(0x78809a, 0.65));
    const key = new THREE.DirectionalLight(0xf5f1ff, 2.1);
    key.position.set(-5, 9, 10);
    scene.add(key);
    const violetLight = new THREE.PointLight(0x8f5bff, 22, 28, 2);
    violetLight.position.set(4.5, 0, 4);
    scene.add(violetLight);

    const coreGroup = new THREE.Group();
    coreGroup.position.set(3.65, 0.15, -1.3);
    world.add(coreGroup);

    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x090a11,
      roughness: 0.64,
      metalness: 0.2,
      emissive: 0x170e2f,
      emissiveIntensity: 0.9,
    });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(2.15, 2), coreMat);
    core.scale.set(1.08, 0.92, 1.02);
    coreGroup.add(core);

    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.25, 1),
      new THREE.MeshBasicMaterial({ color: SOFT_VIOLET, wireframe: true, transparent: true, opacity: 0.26 }),
    );
    wire.rotation.set(0.25, 0.2, -0.16);
    coreGroup.add(wire);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 24, 18),
      new THREE.MeshBasicMaterial({ color: VIOLET, transparent: true, opacity: 0.34, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    coreGroup.add(glow);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xa986ff,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ringSpecs = [
      [3.9, 0.012, 0.15, 0.45, 0.2],
      [4.3, 0.009, -0.42, -0.18, 0.55],
      [3.45, 0.009, 0.72, 0.35, -0.3],
    ] as const;
    const rings: THREE.Mesh[] = [];
    ringSpecs.forEach(([radius, tube, rx, ry, rz]) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 6, 180), ringMaterial.clone());
      ring.rotation.set(rx, ry, rz);
      ring.scale.y = 0.62;
      coreGroup.add(ring);
      rings.push(ring);
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x6e5a94,
      roughness: 0.18,
      metalness: 0.15,
      transmission: 0.36,
      transparent: true,
      opacity: 0.28,
      thickness: 0.7,
      ior: 1.28,
      emissive: 0x2c1749,
      emissiveIntensity: 0.7,
    });
    const modulePositions: [number, number, number, number, number, number][] = [
      [-3.4, 2.25, 0.2, -0.12, 0.35, 0.1], [2.8, 2.4, -0.2, 0.15, -0.25, -0.1],
      [-4.15, 0.35, -0.05, 0.2, 0.3, -0.03], [4.15, 0.55, 0.0, -0.2, -0.25, 0.05],
      [-3.1, -2.35, 0.1, 0.15, 0.4, 0.05], [3.15, -2.25, 0.15, -0.2, -0.3, 0.05],
      [-0.8, -3.35, -0.2, 0.1, 0.2, -0.05], [1.6, -3.15, -0.1, -0.1, -0.2, 0.06],
    ];
    const glassModules: THREE.Mesh[] = [];
    modulePositions.forEach(([x, y, z, rx, ry, rz], i) => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(i % 2 ? 1.7 : 1.9, 0.72, 0.32), glassMat.clone());
      box.position.set(x, y, z);
      box.rotation.set(rx, ry, rz);
      coreGroup.add(box);
      glassModules.push(box);
    });

    const random = rng(20260916);
    const rockGroup = new THREE.Group();
    world.add(rockGroup);
    const rockGeo = [
      new THREE.DodecahedronGeometry(0.48, 0),
      new THREE.IcosahedronGeometry(0.52, 0),
      new THREE.OctahedronGeometry(0.55, 0),
    ];
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x101118,
      roughness: 0.9,
      metalness: 0.05,
      emissive: 0x21172e,
      emissiveIntensity: 0.42,
    });
    const rocks: THREE.Mesh[] = [];
    const rockCount = mobile ? 42 : 86;
    for (let i = 0; i < rockCount; i += 1) {
      const mesh = new THREE.Mesh(rockGeo[i % rockGeo.length], rockMat.clone());
      const angle = random() * Math.PI * 2;
      const radius = 5.1 + random() * 8.4;
      mesh.position.set(3.2 + Math.cos(angle) * radius, (random() - 0.5) * 10.5, -2 - random() * 10 + Math.sin(angle) * 2.5);
      const scale = 0.32 + Math.pow(random(), 2) * 1.35;
      mesh.scale.setScalar(scale);
      mesh.rotation.set(random() * 4, random() * 4, random() * 4);
      mesh.userData.spin = new THREE.Vector3((random() - 0.5) * 0.25, (random() - 0.5) * 0.3, (random() - 0.5) * 0.2);
      mesh.userData.phase = random() * Math.PI * 2;
      rockGroup.add(mesh);
      rocks.push(mesh);
    }

    const particleCount = mobile ? 520 : 1300;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      const spread = 28;
      particlePositions[i * 3] = (random() - 0.5) * spread;
      particlePositions[i * 3 + 1] = (random() - 0.5) * 16;
      particlePositions[i * 3 + 2] = -2 - random() * 34;
      const c = i % 29 === 0 ? SOFT_VIOLET : WHITE;
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particlesGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));
    const particles = new THREE.Points(
      particlesGeo,
      new THREE.PointsMaterial({ size: mobile ? 0.025 : 0.032, vertexColors: true, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    world.add(particles);

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
      const heroExit = THREE.MathUtils.smoothstep(scrollVh, 0.55, 1.45);

      pointer.lerp(pointerTarget, 0.045);
      coreGroup.rotation.x = -pointer.y * 0.045 + Math.sin(t * 0.18) * 0.025;
      coreGroup.rotation.y = pointer.x * 0.07 + Math.sin(t * 0.12) * 0.08;
      coreGroup.position.y = 0.15 + Math.sin(t * 0.35) * 0.08 - heroExit * 0.7;
      coreGroup.position.x = 3.65 + heroExit * 1.7;
      coreGroup.scale.setScalar(1 - heroExit * 0.34);
      coreGroup.visible = heroExit < 0.995;

      core.rotation.y += reduceMotion ? 0 : 0.0018;
      wire.rotation.y -= reduceMotion ? 0 : 0.0012;
      rings.forEach((ring, i) => {
        ring.rotation.z += reduceMotion ? 0 : (i % 2 ? -1 : 1) * 0.0009;
      });
      glassModules.forEach((box, i) => {
        box.position.y += reduceMotion ? 0 : Math.sin(t * 0.65 + i) * 0.0005;
      });

      rockGroup.rotation.y = t * 0.017 + scrollVh * 0.025;
      rocks.forEach((rock, i) => {
        const spin = rock.userData.spin as THREE.Vector3;
        if (!reduceMotion) {
          rock.rotation.x += spin.x * 0.006;
          rock.rotation.y += spin.y * 0.006;
          rock.rotation.z += spin.z * 0.006;
        }
        const phase = rock.userData.phase as number;
        rock.position.y += reduceMotion ? 0 : Math.sin(t * 0.22 + phase + i * 0.03) * 0.00035;
      });

      particles.rotation.y = t * 0.006;
      particles.position.y = -scrollVh * 0.16;
      camera.position.x = pointer.x * 0.22;
      camera.position.y = -pointer.y * 0.12;
      camera.lookAt(2.25, 0, -3.5);

      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(render);
    };
    raf = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (!mobile) window.removeEventListener("pointermove", onPointer);
      renderer.dispose();
      particlesGeo.dispose();
      (particles.material as THREE.Material).dispose();
      core.geometry.dispose();
      coreMat.dispose();
      wire.geometry.dispose();
      (wire.material as THREE.Material).dispose();
      rockGeo.forEach((geo) => geo.dispose());
      rocks.forEach((mesh) => (mesh.material as THREE.Material).dispose());
      glassModules.forEach((mesh) => { mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); });
      rings.forEach((mesh) => { mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); });
      mount.removeChild(renderer.domElement);
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
