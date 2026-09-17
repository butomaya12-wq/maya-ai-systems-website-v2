"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const POINTS = 18000;
const DEBRIS = 1600;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const vertexShader = `
uniform float uTime;
uniform vec2 uPointer;
attribute float aSeed;
varying float vAlpha;
varying float vGlow;

void main() {
  vec3 p = position;
  vec3 n = normalize(p + vec3(0.0001));
  float wave = sin(p.y * 4.8 + uTime * 0.65 + aSeed * 12.0) * 0.028;
  float pulse = sin(uTime * 0.72 + aSeed * 6.2831) * 0.022;
  p += n * (wave + pulse);
  p.x += uPointer.x * (0.035 + aSeed * 0.02);
  p.y -= uPointer.y * (0.025 + aSeed * 0.018);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1.8 + aSeed * 2.7) * (5.8 / max(1.0, -mv.z));

  float rim = smoothstep(0.18, 1.55, length(mv.xy));
  vGlow = 0.22 + 0.78 * rim;
  vAlpha = 0.16 + 0.68 * aSeed;
}`;

const fragmentShader = `
precision highp float;
varying float vAlpha;
varying float vGlow;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float soft = smoothstep(0.5, 0.02, d);
  vec3 violet = vec3(0.46, 0.32, 1.0);
  vec3 ice = vec3(0.93, 0.95, 1.0);
  vec3 col = mix(violet, ice, vGlow);
  gl_FragColor = vec4(col, soft * vAlpha);
}`;

export function HeroWebGL() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !coarse,
      alpha: true,
      powerPreference: coarse ? "default" : "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 50);
    camera.position.set(0, 0, 5.4);

    const root = new THREE.Group();
    root.position.set(1.35, -0.02, 0);
    root.rotation.set(-0.08, -0.18, 0.03);
    scene.add(root);

    const positions = new Float32Array(POINTS * 3);
    const seeds = new Float32Array(POINTS);
    for (let i = 0; i < POINTS; i += 1) {
      const y = 1 - (i / (POINTS - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = GOLDEN_ANGLE * i;
      const shell = 1.38 + 0.10 * Math.sin(i * 0.127) + 0.045 * Math.sin(i * 0.019);
      positions[i * 3] = Math.cos(theta) * radius * shell;
      positions[i * 3 + 1] = y * shell;
      positions[i * 3 + 2] = Math.sin(theta) * radius * shell;
      seeds[i] = Math.abs(Math.sin((i + 1) * 12.9898) * 43758.5453) % 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const uniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    };

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const cloud = new THREE.Points(geometry, particleMaterial);
    root.add(cloud);

    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(1.39, 28, 18),
      new THREE.MeshBasicMaterial({
        color: 0xa991ff,
        wireframe: true,
        transparent: true,
        opacity: 0.085,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    wire.scale.set(1.02, 1.02, 1.02);
    root.add(wire);

    const glass = new THREE.Mesh(
      new THREE.SphereGeometry(1.36, 48, 32),
      new THREE.MeshBasicMaterial({
        color: 0x6f64a8,
        transparent: true,
        opacity: 0.025,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    root.add(glass);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xb89cff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const rings: THREE.Mesh[] = [];
    [
      [1.72, 0.009, 0.28, 0.0],
      [1.91, 0.007, -0.48, 0.64],
      [2.08, 0.006, 0.72, -0.4],
      [1.57, 0.005, -0.2, 1.1],
    ].forEach(([r, tube, rx, rz]) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, 220), ringMaterial.clone());
      ring.rotation.x = Math.PI / 2 + rx;
      ring.rotation.z = rz;
      root.add(ring);
      rings.push(ring);
    });

    const coreGroup = new THREE.Group();
    const coreOuter = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x9f84ff,
        transparent: true,
        opacity: 0.14,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    const coreInner = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 28, 28),
      new THREE.MeshBasicMaterial({
        color: 0xf2efff,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    coreGroup.add(coreOuter, coreInner);
    root.add(coreGroup);

    const axisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -2.15, 0),
      new THREE.Vector3(0, 2.15, 0),
    ]);
    const axis = new THREE.Line(axisGeometry, new THREE.LineBasicMaterial({ color: 0xb7a4ff, transparent: true, opacity: 0.22 }));
    root.add(axis);

    const debrisPositions = new Float32Array(DEBRIS * 3);
    for (let i = 0; i < DEBRIS; i += 1) {
      const t = i / DEBRIS;
      const angle = i * GOLDEN_ANGLE;
      const r = 1.2 + Math.pow(t, 0.55) * 1.05 + (Math.sin(i * 0.73) + 1) * 0.09;
      debrisPositions[i * 3] = -0.55 - Math.abs(Math.cos(angle)) * r * 0.75;
      debrisPositions[i * 3 + 1] = Math.sin(angle) * r * 0.92;
      debrisPositions[i * 3 + 2] = Math.sin(angle * 0.73) * r * 0.6;
    }
    const debrisGeometry = new THREE.BufferGeometry();
    debrisGeometry.setAttribute("position", new THREE.BufferAttribute(debrisPositions, 3));
    const debrisMaterial = new THREE.PointsMaterial({
      color: 0xbca9ff,
      size: 0.027,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const debris = new THREE.Points(debrisGeometry, debrisMaterial);
    root.add(debris);

    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xe8e2ff, transparent: true, opacity: 0.72 });
    const nodes: THREE.Mesh[] = [];
    for (let i = 0; i < 14; i += 1) {
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.025 + (i % 4) * 0.006, 12, 12), nodeMaterial.clone());
      const a = (i / 14) * Math.PI * 2;
      const r = 1.52 + (i % 3) * 0.19;
      node.position.set(Math.cos(a) * r, Math.sin(a * 1.37) * 0.9, Math.sin(a) * r * 0.6);
      root.add(node);
      nodes.push(node);
    }

    const targetPointer = new THREE.Vector2();
    const currentPointer = new THREE.Vector2();
    const onPointerMove = (event: PointerEvent) => {
      if (coarse) return;
      targetPointer.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1,
      );
    };
    if (!coarse) window.addEventListener("pointermove", onPointerMove, { passive: true });

    let width = 1;
    let height = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const clock = new THREE.Clock();
    let raf = 0;
    const render = () => {
      const t = clock.getElapsedTime();
      currentPointer.lerp(targetPointer, reduced ? 0.02 : 0.055);
      uniforms.uTime.value = reduced ? 0.6 : t;
      uniforms.uPointer.value.copy(currentPointer);

      if (!reduced) {
        root.rotation.y = -0.18 + t * 0.045 + currentPointer.x * 0.08;
        root.rotation.x = -0.08 - currentPointer.y * 0.05;
        cloud.rotation.y = t * 0.03;
        wire.rotation.y = -t * 0.024;
        debris.rotation.y = t * -0.018;
        rings[0].rotation.z = t * 0.055;
        rings[1].rotation.y = t * -0.043;
        rings[2].rotation.z = -0.4 + t * 0.031;
        rings[3].rotation.y = 1.1 + t * 0.025;
        const pulse = 1 + Math.sin(t * 1.35) * 0.11;
        coreOuter.scale.setScalar(pulse);
        coreInner.scale.setScalar(1 + Math.sin(t * 1.7) * 0.05);
        nodes.forEach((node, i) => {
          node.scale.setScalar(0.9 + 0.28 * Math.sin(t * 1.2 + i));
        });
      }

      root.position.x = (width < 900 ? 0.7 : 1.28) + currentPointer.x * 0.08;
      root.position.y = (width < 900 ? 0.32 : -0.02) - currentPointer.y * 0.05;
      const mobileScale = width < 640 ? 0.7 : width < 900 ? 0.88 : 1;
      root.scale.setScalar(mobileScale);

      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(render);
    };
    raf = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (!coarse) window.removeEventListener("pointermove", onPointerMove);
      geometry.dispose();
      particleMaterial.dispose();
      wire.geometry.dispose();
      (wire.material as THREE.Material).dispose();
      glass.geometry.dispose();
      (glass.material as THREE.Material).dispose();
      rings.forEach((ring) => {
        ring.geometry.dispose();
        (ring.material as THREE.Material).dispose();
      });
      coreOuter.geometry.dispose();
      coreInner.geometry.dispose();
      (coreOuter.material as THREE.Material).dispose();
      (coreInner.material as THREE.Material).dispose();
      axisGeometry.dispose();
      (axis.material as THREE.Material).dispose();
      debrisGeometry.dispose();
      debrisMaterial.dispose();
      nodes.forEach((node) => {
        node.geometry.dispose();
        (node.material as THREE.Material).dispose();
      });
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-particle-canvas hero-webgl-canvas" aria-hidden="true" />;
}
