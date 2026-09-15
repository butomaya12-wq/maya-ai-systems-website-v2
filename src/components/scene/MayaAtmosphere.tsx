"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const VIOLET = new THREE.Color("#9b6dff");
const SOFT_VIOLET = new THREE.Color("#d5c5ff");
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
  gradient.addColorStop(0, "#596070");
  gradient.addColorStop(0.38, "#171923");
  gradient.addColorStop(0.72, "#08090e");
  gradient.addColorStop(1, "#020307");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const shelf = ctx.createLinearGradient(0, 0, canvas.width, 0);
  shelf.addColorStop(0, "rgba(255,255,255,0)");
  shelf.addColorStop(0.34, "rgba(255,255,255,.62)");
  shelf.addColorStop(0.52, "rgba(228,217,255,.96)");
  shelf.addColorStop(0.71, "rgba(255,255,255,.48)");
  shelf.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = shelf;
  ctx.fillRect(0, 105, canvas.width, 78);

  const glow = (x: number, y: number, radius: number, color: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  };
  glow(250, 160, 180, "rgba(255,255,255,.78)");
  glow(760, 175, 155, "rgba(230,218,255,.72)");
  glow(545, 350, 205, "rgba(131,89,235,.38)");

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromEquirectangular(texture);
  texture.dispose();
  pmrem.dispose();
  return target;
}

function makeBeamMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: new THREE.Color("#d7c7ff") },
      uOpacity: { value: 0.18 },
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
        float across = exp(-pow((vUv.x - .5) * 4.1, 2.0));
        float lengthFade = smoothstep(0.0, .18, vUv.y) * pow(clamp(vUv.y, 0.0, 1.0), 1.2);
        float edge = smoothstep(0.0, .12, vUv.x) * smoothstep(0.0, .12, 1.0-vUv.x);
        gl_FragColor = vec4(uColor, uOpacity * across * lengthFade * edge);
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

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#080a10", mobile ? 0.031 : 0.0215);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 140);
    camera.position.set(0, 0.15, 15.4);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x05060a, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.4));
    renderer.domElement.className = "maya-atmosphere-canvas";
    mount.appendChild(renderer.domElement);

    const envTarget = makeEnvironment(renderer);
    if (envTarget) scene.environment = envTarget.texture;

    const world = new THREE.Group();
    scene.add(world);

    scene.add(new THREE.AmbientLight(0x8a8ea0, 0.24));
    scene.add(new THREE.HemisphereLight(0xdde4ef, 0x090a11, 0.62));

    const key = new THREE.SpotLight(0xf5f0ff, 46, 42, 0.58, 0.9, 1.5);
    key.position.set(-1.8, 9.5, 10);
    key.target.position.set(3.3, 0, -2.3);
    scene.add(key, key.target);

    const rim = new THREE.PointLight(0x9a67ff, 72, 22, 2);
    rim.position.set(7.4, 1.5, 2.5);
    scene.add(rim);
    const coolRim = new THREE.PointLight(0xdfe7ff, 34, 20, 2);
    coolRim.position.set(0.4, -2.6, 4.8);
    scene.add(coolRim);

    const beam = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 18), makeBeamMaterial());
    beam.position.set(2.55, 3.7, -7.7);
    beam.rotation.z = -0.18;
    beam.rotation.x = -0.04;
    world.add(beam);

    const coreGroup = new THREE.Group();
    coreGroup.position.set(3.65, 0.1, -1.45);
    world.add(coreGroup);

    const innerGlow = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.78, 3),
      new THREE.MeshBasicMaterial({
        color: 0xa26fff,
        transparent: true,
        opacity: 0.78,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    innerGlow.scale.set(1, 0.85, 0.92);
    coreGroup.add(innerGlow);

    const shardMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0d0e14,
      roughness: 0.19,
      metalness: 0.78,
      clearcoat: 1,
      clearcoatRoughness: 0.09,
      emissive: 0x190d2d,
      emissiveIntensity: 0.36,
      envMapIntensity: 1.6,
    });
    const shardGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x49316e,
      roughness: 0.08,
      metalness: 0.25,
      transmission: 0.38,
      transparent: true,
      opacity: 0.58,
      thickness: 0.9,
      ior: 1.34,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      emissive: 0x24113f,
      emissiveIntensity: 0.42,
      envMapIntensity: 1.7,
      side: THREE.DoubleSide,
    });

    const random = rng(20260916);
    const shardGeometries = [
      new THREE.DodecahedronGeometry(0.9, 0),
      new THREE.IcosahedronGeometry(0.86, 0),
      new THREE.OctahedronGeometry(0.9, 0),
    ];
    const shards: THREE.Mesh[] = [];
    const shardEdges: THREE.LineSegments[] = [];
    for (let i = 0; i < 15; i += 1) {
      const angle = (i / 15) * Math.PI * 2 + random() * 0.42;
      const radius = 0.52 + random() * 1.78;
      const y = (random() - 0.5) * 3.0;
      const geo = shardGeometries[i % shardGeometries.length];
      const mat = i % 4 === 0 ? shardGlassMaterial.clone() : shardMaterial.clone();
      const shard = new THREE.Mesh(geo, mat);
      shard.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius * 0.8);
      shard.rotation.set(random() * 3.2, random() * 3.2, random() * 3.2);
      const s = 0.4 + random() * 0.95;
      shard.scale.set(s * (0.72 + random() * 0.6), s * (0.5 + random() * 0.9), s * (0.62 + random() * 0.72));
      shard.userData.spin = new THREE.Vector3((random() - 0.5) * 0.006, (random() - 0.5) * 0.008, (random() - 0.5) * 0.006);
      coreGroup.add(shard);
      shards.push(shard);

      if (i < 9) {
        const edge = new THREE.LineSegments(
          new THREE.EdgesGeometry(geo, 24),
          new THREE.LineBasicMaterial({ color: 0xcab3ff, transparent: true, opacity: 0.2 }),
        );
        edge.position.copy(shard.position);
        edge.rotation.copy(shard.rotation);
        edge.scale.copy(shard.scale).multiplyScalar(1.01);
        coreGroup.add(edge);
        shardEdges.push(edge);
      }
    }

    const cage = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.65, 2),
      new THREE.MeshBasicMaterial({ color: 0xc8b2ff, wireframe: true, transparent: true, opacity: 0.09, depthWrite: false }),
    );
    cage.scale.set(1.05, 0.92, 1);
    cage.rotation.set(0.25, 0.18, -0.14);
    coreGroup.add(cage);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xb398ff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ringSpecs = [
      [3.8, 0.012, 0.16, 0.46, 0.22],
      [4.32, 0.01, -0.44, -0.16, 0.52],
      [3.42, 0.009, 0.72, 0.34, -0.28],
    ] as const;
    const rings: THREE.Mesh[] = [];
    ringSpecs.forEach(([radius, tube, rx, ry, rz]) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 6, 220), ringMaterial.clone());
      ring.rotation.set(rx, ry, rz);
      ring.scale.y = 0.62;
      coreGroup.add(ring);
      rings.push(ring);
    });

    const glassBodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x6d568e,
      roughness: 0.08,
      metalness: 0.15,
      transmission: 0.72,
      transparent: true,
      opacity: 0.34,
      thickness: 1.2,
      ior: 1.34,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      emissive: 0x211038,
      emissiveIntensity: 0.55,
      envMapIntensity: 1.7,
    });
    const modulePositions: [number, number, number, number, number, number][] = [
      [-3.35, 2.22, 0.18, -0.12, 0.35, 0.1], [2.85, 2.38, -0.18, 0.15, -0.25, -0.1],
      [-4.12, 0.36, -0.03, 0.2, 0.3, -0.03], [4.14, 0.54, 0.0, -0.2, -0.25, 0.05],
      [-3.08, -2.32, 0.12, 0.15, 0.4, 0.05], [3.12, -2.22, 0.14, -0.2, -0.3, 0.05],
      [-0.82, -3.32, -0.18, 0.1, 0.2, -0.05], [1.58, -3.1, -0.1, -0.1, -0.2, 0.06],
    ];
    const glassModules: THREE.Group[] = [];
    modulePositions.forEach(([x, y, z, rx, ry, rz], i) => {
      const group = new THREE.Group();
      group.position.set(x, y, z);
      group.rotation.set(rx, ry, rz);
      const body = new THREE.Mesh(new THREE.BoxGeometry(i % 2 ? 1.62 : 1.82, 0.72, 0.24), glassBodyMaterial.clone());
      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(body.geometry),
        new THREE.LineBasicMaterial({ color: 0xd7c8ff, transparent: true, opacity: 0.34 }),
      );
      group.add(body, edge);
      coreGroup.add(group);
      group.userData.baseY = y;
      glassModules.push(group);
    });

    const rockGroup = new THREE.Group();
    world.add(rockGroup);
    const rockGeo = [
      new THREE.DodecahedronGeometry(0.48, 0),
      new THREE.IcosahedronGeometry(0.52, 0),
      new THREE.OctahedronGeometry(0.55, 0),
    ];
    const rocks: THREE.Mesh[] = [];
    const rockCount = mobile ? 32 : 62;
    for (let i = 0; i < rockCount; i += 1) {
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x0b0c11,
        roughness: 0.42 + random() * 0.35,
        metalness: 0.3,
        clearcoat: 0.72,
        clearcoatRoughness: 0.24,
        emissive: 0x130d1c,
        emissiveIntensity: 0.18,
        transparent: true,
        opacity: 0.82,
        envMapIntensity: 1.0,
      });
      const mesh = new THREE.Mesh(rockGeo[i % rockGeo.length], material);
      const angle = random() * Math.PI * 2;
      const radius = 5.4 + random() * 9.8;
      mesh.position.set(3.1 + Math.cos(angle) * radius, (random() - 0.5) * 11, -1.8 - random() * 13 + Math.sin(angle) * 2.7);
      const scale = 0.24 + Math.pow(random(), 2) * 1.22;
      mesh.scale.set(scale * (0.7 + random() * 0.7), scale, scale * (0.68 + random() * 0.65));
      mesh.rotation.set(random() * 4, random() * 4, random() * 4);
      mesh.userData.spin = new THREE.Vector3((random() - 0.5) * 0.22, (random() - 0.5) * 0.28, (random() - 0.5) * 0.18);
      mesh.userData.phase = random() * Math.PI * 2;
      rockGroup.add(mesh);
      rocks.push(mesh);
    }

    const particleCount = mobile ? 430 : 1050;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      const spread = 29;
      particlePositions[i * 3] = (random() - 0.5) * spread;
      particlePositions[i * 3 + 1] = (random() - 0.5) * 16;
      particlePositions[i * 3 + 2] = -1.5 - random() * 36;
      const c = i % 31 === 0 ? SOFT_VIOLET : WHITE;
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particlesGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: mobile ? 0.024 : 0.031,
      vertexColors: true,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particlesGeo, particleMaterial);
    world.add(particles);

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
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
      const heroExit = smoothstep(scrollVh, 0.5, 1.28);
      const calmField = smoothstep(scrollVh, 2.4, 4.0);

      pointer.lerp(pointerTarget, 0.045);
      coreGroup.rotation.x = -pointer.y * 0.045 + Math.sin(t * 0.18) * 0.024;
      coreGroup.rotation.y = pointer.x * 0.068 + Math.sin(t * 0.12) * 0.07;
      coreGroup.position.y = 0.1 + Math.sin(t * 0.34) * 0.07 - heroExit * 0.58;
      coreGroup.position.x = 3.65 + heroExit * 1.45;
      coreGroup.scale.setScalar(1 - heroExit * 0.28);
      coreGroup.visible = heroExit < 0.995;

      innerGlow.rotation.y += reduceMotion ? 0 : 0.0016;
      innerGlow.scale.setScalar(1 + Math.sin(t * 1.2) * 0.025);
      cage.rotation.y += reduceMotion ? 0 : 0.0012;
      cage.rotation.x = 0.25 + Math.sin(t * 0.21) * 0.025;

      shards.forEach((shard, i) => {
        const spin = shard.userData.spin as THREE.Vector3;
        if (!reduceMotion) {
          shard.rotation.x += spin.x;
          shard.rotation.y += spin.y;
          shard.rotation.z += spin.z;
        }
        shard.position.y += reduceMotion ? 0 : Math.sin(t * 0.42 + i * 0.77) * 0.00045;
      });
      shardEdges.forEach((edge, i) => {
        if (shards[i]) {
          edge.position.copy(shards[i].position);
          edge.rotation.copy(shards[i].rotation);
          edge.scale.copy(shards[i].scale).multiplyScalar(1.01);
        }
      });

      rings.forEach((ring, i) => {
        ring.rotation.z += reduceMotion ? 0 : (i % 2 ? -1 : 1) * 0.0007;
      });
      glassModules.forEach((group, i) => {
        group.position.y = (group.userData.baseY as number) + (reduceMotion ? 0 : Math.sin(t * 0.5 + i) * 0.045);
        group.rotation.z += reduceMotion ? 0 : Math.sin(t * 0.33 + i) * 0.00005;
      });

      beam.material.uniforms.uOpacity.value = 0.18 * (1 - heroExit * 0.7);
      beam.rotation.y = Math.atan2(camera.position.x - beam.position.x, camera.position.z - beam.position.z);

      rockGroup.rotation.y = t * 0.012 + scrollVh * 0.018;
      rocks.forEach((rock, i) => {
        const spin = rock.userData.spin as THREE.Vector3;
        if (!reduceMotion) {
          rock.rotation.x += spin.x * 0.0045;
          rock.rotation.y += spin.y * 0.0045;
          rock.rotation.z += spin.z * 0.0045;
        }
        const phase = rock.userData.phase as number;
        rock.position.y += reduceMotion ? 0 : Math.sin(t * 0.2 + phase + i * 0.03) * 0.00022;
        const mat = rock.material as THREE.MeshPhysicalMaterial;
        mat.opacity = 0.82 * (1 - calmField * 0.8);
      });

      particles.rotation.y = t * 0.004;
      particles.position.y = -scrollVh * 0.1;
      particleMaterial.opacity = 0.62 * (1 - calmField * 0.62);

      camera.position.x = pointer.x * 0.18 + Math.sin(t * 0.08) * 0.08;
      camera.position.y = -pointer.y * 0.1 + Math.sin(t * 0.06) * 0.04;
      camera.lookAt(2.35, 0, -3.8);

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
      particlesGeo.dispose();
      particleMaterial.dispose();
      (beam.material as THREE.Material).dispose();
      beam.geometry.dispose();
      innerGlow.geometry.dispose();
      (innerGlow.material as THREE.Material).dispose();
      cage.geometry.dispose();
      (cage.material as THREE.Material).dispose();
      shardGeometries.forEach((geo) => geo.dispose());
      shards.forEach((mesh) => (mesh.material as THREE.Material).dispose());
      shardEdges.forEach((edge) => {
        edge.geometry.dispose();
        (edge.material as THREE.Material).dispose();
      });
      rockGeo.forEach((geo) => geo.dispose());
      rocks.forEach((mesh) => (mesh.material as THREE.Material).dispose());
      glassModules.forEach((group) => {
        group.children.forEach((child) => {
          const mesh = child as THREE.Mesh | THREE.LineSegments;
          if ("geometry" in mesh && mesh.geometry) mesh.geometry.dispose();
          const material = (mesh as THREE.Mesh).material as THREE.Material | undefined;
          material?.dispose();
        });
      });
      rings.forEach((mesh) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
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
