"use client";

import Link from "next/link";
import { animated, to, useSpring } from "@react-spring/web";
import { useEffect, useMemo, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { siteContent } from "@/data/site-content";

type Particle = {
  x: number;
  y: number;
  z: number;
  size: number;
  phase: number;
  speed: number;
};

const seeded = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export function HeroSystemScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useRef(false);
  const particles = useMemo<Particle[]>(() => {
    const random = seeded(20260916);
    return Array.from({ length: 220 }, () => ({
      x: random() * 2 - 1,
      y: random() * 2 - 1,
      z: 0.28 + random() * 0.72,
      size: 0.45 + random() * 1.55,
      phase: random() * Math.PI * 2,
      speed: 0.16 + random() * 0.34,
    }));
  }, []);

  const [{ mx, my }, springApi] = useSpring(() => ({
    mx: 0,
    my: 0,
    config: { tension: 120, friction: 28 },
  }));

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = (now: number) => {
      const t = now * 0.001;
      ctx.clearRect(0, 0, width, height);

      const px = reducedMotion.current ? 0 : mx.get();
      const py = reducedMotion.current ? 0 : my.get();
      const cx = width * 0.54 + px * 18;
      const cy = height * 0.48 + py * 14;

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.38);
      glow.addColorStop(0, "rgba(151, 103, 255, 0.19)");
      glow.addColorStop(0.26, "rgba(125, 79, 255, 0.07)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      const projected = particles.map((particle) => {
        const drift = reducedMotion.current ? 0 : t * particle.speed;
        const orbitX = Math.sin(drift + particle.phase) * 18 * particle.z;
        const orbitY = Math.cos(drift * 0.74 + particle.phase) * 13 * particle.z;
        return {
          x: cx + particle.x * width * 0.47 * particle.z + orbitX + px * 16 * particle.z,
          y: cy + particle.y * height * 0.5 * particle.z + orbitY + py * 12 * particle.z,
          z: particle.z,
          size: particle.size,
        };
      });

      for (let i = 0; i < projected.length; i += 1) {
        const a = projected[i];
        if (a.z < 0.58) continue;
        for (let j = i + 1; j < Math.min(projected.length, i + 15); j += 1) {
          const b = projected[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 72) {
            ctx.strokeStyle = `rgba(176, 145, 255, ${0.035 * (1 - dist / 72)})`;
            ctx.lineWidth = 0.55;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      projected.forEach((particle, index) => {
        const isAccent = index % 31 === 0;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.z, 0, Math.PI * 2);
        ctx.fillStyle = isAccent
          ? `rgba(190, 154, 255, ${0.5 + particle.z * 0.38})`
          : `rgba(238, 241, 248, ${0.14 + particle.z * 0.38})`;
        ctx.fill();
      });

      raf = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = window.requestAnimationFrame(render);
    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(raf);
    };
  }, [mx, my, particles]);

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    springApi.start({ mx: x, my: y });
  };

  const onPointerLeave = () => springApi.start({ mx: 0, my: 0 });

  return (
    <section
      id="top"
      className="hero hero-cinematic section-shell"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <canvas ref={canvasRef} className="hero-particle-canvas" aria-hidden="true" />
      <div className="hero-noise" aria-hidden="true" />
      <div className="hero-ray" aria-hidden="true" />

      <div className="hero-copy hero-copy-cinematic">
        <p className="section-index">01 · FROM COMPLEXITY TO CLARITY</p>
        <h1>{siteContent.hero.title}</h1>
        <p className="hero-body">{siteContent.hero.body}</p>
        <div className="actions">
          <Link className="solid-button" href="#work">{siteContent.hero.primaryCta} <span aria-hidden="true">→</span></Link>
          <Link className="ghost-button" href="#contact">{siteContent.hero.secondaryCta}</Link>
        </div>
      </div>

      <animated.div
        className="system-universe"
        style={{ transform: to([mx, my], (x, y) => `translate3d(${x * 0.7}rem, ${y * 0.35}rem, 0)`) }}
        aria-label="Structured system graph"
      >
        <div className="orbit orbit-a" aria-hidden="true" />
        <div className="orbit orbit-b" aria-hidden="true" />
        <div className="orbit orbit-c" aria-hidden="true" />
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index} className={`hero-fragment hero-fragment-${index + 1}`} aria-hidden="true" />
        ))}
        <animated.div
          className="system-core-v2"
          style={{ transform: to([mx, my], (x, y) => `translate(-50%,-50%) rotateX(${-y * 5}deg) rotateY(${x * 7}deg)`) }}
        >
          <span className="core-label">SYSTEM</span>
          <span className="core-glow" aria-hidden="true" />
        </animated.div>
        {siteContent.hero.modules.map((module, index) => (
          <animated.span
            key={module}
            className={`system-node system-node-${index + 1}`}
            style={{
              transform: to([mx, my], (x, y) => `translate3d(${x * ((index % 3) - 1) * 0.55}rem, ${y * ((index % 2) ? 0.3 : -0.25)}rem, 0)`),
            }}
          >
            {module}
          </animated.span>
        ))}
      </animated.div>

      <div className="hero-axis" aria-hidden="true">
        <span>02<br />STRUCTURE</span>
        <span>03<br />SYSTEM</span>
        <span>04<br />REAL IMPACT</span>
      </div>

      <div className="proof-strip proof-strip-cinematic">
        <span className="proof-label">SELECTED PROOF</span>
        {siteContent.hero.proof.map((item) => <span key={item}>● {item}</span>)}
      </div>

      <div className="scroll-cue" aria-hidden="true"><span>SCROLL TO EXPLORE</span><i /></div>
    </section>
  );
}
