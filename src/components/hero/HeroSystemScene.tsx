"use client";

import Link from "next/link";
import { animated, to, useSpring } from "@react-spring/web";
import type { PointerEvent as ReactPointerEvent } from "react";
import { siteContent } from "@/data/site-content";

export function HeroSystemScene() {
  const [{ mx, my }, springApi] = useSpring(() => ({
    mx: 0,
    my: 0,
    config: { tension: 120, friction: 28 },
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
      className="hero hero-cinematic section-shell"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
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
        className="system-universe system-universe-v4"
        style={{ transform: to([mx, my], (x, y) => `translate3d(${x * 0.42}rem, ${y * 0.22}rem, 0)`) }}
        aria-label="Structured system graph"
      >
        <animated.span
          className="system-center-label"
          style={{ transform: to([mx, my], (x, y) => `translate(-50%,-50%) translate3d(${x * 0.28}rem, ${y * 0.18}rem,0)`) }}
        >
          SYSTEM
        </animated.span>
        {siteContent.hero.modules.map((module, index) => (
          <animated.span
            key={module}
            className={`system-node system-node-${index + 1}`}
            style={{
              transform: to(
                [mx, my],
                (x, y) => `translate3d(${x * ((index % 3) - 1) * 0.34}rem, ${y * ((index % 2) ? 0.2 : -0.16)}rem, 0)`,
              ),
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
