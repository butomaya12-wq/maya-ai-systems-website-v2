"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const POINTS = 12000;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const vertexShader = `
uniform float uTime;
uniform vec2 uPointer;
attribute float aSeed;
varying float vAlpha;
varying float vGlow;

void main() {
  vec3 p = position;
  float wave = sin(p.y * 4.2 + uTime * 0.72 + aSeed * 10.0) * 0.055;
  float pulse = sin(uTime * 0.55 + aSeed * 6.2831) * 0.035;
  vec3 n = normalize(p + vec3(0.0001));
  p += n * (wave + pulse);

  float pointerFalloff = exp(-length(uPointer) * 0.65);
  p.x += uPointer.x * (0.05 + 0.05 * aSeed) * pointerFalloff;
  p.y -= uPointer.y * (0.04 + 0.04 * aSeed) * pointerFalloff;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (2.2 + aSeed * 2.8) * (5.2 / max(1.0, -mv.z));

  float edge = smoothstep(0.15, 1.2, length(mv.xy));
  vGlow = 0.35 + 0.65 * edge;
  vAlpha = 0.22 + 0.58 * aSeed;
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
  vec3 violet = vec3(0.61, 0.43, 1.0);
  vec3 ice = vec3(0.90, 0.91, 1.0);
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
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.set(0, 0, 5.35);

    const root = new THREE.Group();
    root.position.set(1.35, -0.05, 0);
    root.rotation.set(-0.08, -0.18, 0.04);
    scene.add(root);

    const positions = new Float32Array(POINTS * 3);
    const seeds = new Float32Array(POINTS);
    for (let i = 0; i < POINTS; i += 1) {
      const y = 1 - (i / (POINTS - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = GOLDEN_ANGLE * i;
      const shell = 1.42 + 0.17 * Math.sin(i * 0.173) + 0.07 * Math.sin(i * 0.017);
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

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const cloud = new THREE.Points(geometry, material);
    root.add(cloud);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x9a73f0,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const rings: THREE.Mesh[] = [];
    [
      [1.75, 0.008, 0.25, 0.0],
      [1.92, 0.006, -0.42, 0.75],
      [2.12, 0.005, 0.72, -0.35],
    ].forEach(([r, tube, rx, rz]) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, 220), ringMaterial.clone());
      ring.rotation.x = Math.PI / 2 + rx;
      ring.rotation.z = rz;
      root.add(ring);
      rings.push(ring);
    });

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0xc8b5ff,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    root.add(core);

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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.6));
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
        cloud.rotation.y = t * 0.085 + currentPointer.x * 0.12;
        cloud.rotation.x = Math.sin(t * 0.22) * 0.055 - currentPointer.y * 0.065;
        rings[0].rotation.z = t * 0.07;
        rings[1].rotation.y = t * -0.055;
        rings[2].rotation.z = -0.35 + t * 0.038;
        core.scale.setScalar(1 + Math.sin(t * 1.25) * 0.08);
      }

      root.position.x = (width < 900 ? 0.75 : 1.35) + currentPointer.x * 0.08;
      root.position.y = (width < 900 ? 0.28 : -0.05) - currentPointer.y * 0.06;
      const mobileScale = width < 640 ? 0.72 : width < 900 ? 0.88 : 1;
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
      material.dispose();
      rings.forEach((ring) => {
        ring.geometry.dispose();
        (ring.material as THREE.Material).dispose();
      });
      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-particle-canvas hero-webgl-canvas" aria-hidden="true" />;
}
