"use client";

import Link from "next/link";
import { animated, to, useSpring } from "@react-spring/web";
import type { PointerEvent as ReactPointerEvent } from "react";
import { siteContent } from "@/data/site-content";
import { HeroIntro } from "@/components/hero/HeroIntro";
import { HeroWebGL } from "@/components/hero/HeroWebGL";

export function HeroSystemScene() {
  const [{ mx, my }, springApi] = useSpring(() => ({
    mx: 0,
    my: 0,
    config: { tension: 90, friction: 30 },
  }));

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
      className="hero hero-cinematic hero-focus section-shell"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <HeroIntro />
      <HeroWebGL />
      <div className="hero-noise" aria-hidden="true" />
      <div className="hero-ray" aria-hidden="true" />
      <div className="hero-foreground-debris" aria-hidden="true">
        <span className="foreground-rock foreground-rock-1" />
        <span className="foreground-rock foreground-rock-2" />
        <span className="foreground-rock foreground-rock-3" />
        <span className="foreground-rock foreground-rock-4" />
      </div>

      <div className="hero-copy hero-copy-cinematic">
        <p className="section-index">01 · ОТ СЛОЖНОСТИ К СИСТЕМЕ</p>
        <p className="hero-eyebrow">{siteContent.hero.eyebrow}</p>
        <h1>{siteContent.hero.title}</h1>
        <p className="hero-body">{siteContent.hero.body}</p>
        <div className="actions">
          <Link className="solid-button" href="#work">{siteContent.hero.primaryCta} <span aria-hidden="true">→</span></Link>
          <Link className="ghost-button" href="#contact">{siteContent.hero.secondaryCta}</Link>
        </div>
      </div>

      <animated.div
        className="system-universe"
        style={{ transform: to([mx, my], (x, y) => `translate3d(${x * 0.26}rem, ${y * 0.14}rem, 0)`) }}
        aria-label="Структурная схема системы"
      >
        {siteContent.hero.modules.map((module, index) => (
          <animated.span
            key={module}
            className={`system-node system-node-${index + 1}`}
            style={{
              transform: to([mx, my], (x, y) => `translate3d(${x * ((index % 3) - 1) * 0.18}rem, ${y * ((index % 2) ? 0.11 : -0.09)}rem, 0)`),
            }}
          >
            {module}
          </animated.span>
        ))}
      </animated.div>

      <div className="hero-axis" aria-hidden="true">
        <span>02<br />СТРУКТУРА</span>
        <span>03<br />СИСТЕМА</span>
        <span>04<br />РЕЗУЛЬТАТ</span>
      </div>

      <div className="proof-strip proof-strip-cinematic">
        <span className="proof-label">ПОДТВЕРЖДЁННЫЙ ОПЫТ</span>
        {siteContent.hero.proof.map((item) => <span key={item}>● {item}</span>)}
      </div>

      <div className="scroll-cue" aria-hidden="true"><span>ЛИСТАЙТЕ ДАЛЬШЕ</span><i /></div>
    </section>
  );
}
