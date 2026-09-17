"use client";

import Link from "next/link";
import { siteContent } from "@/data/site-content";
import { HeroIntro } from "@/components/hero/HeroIntro";

export function HeroSystemScene() {
  return (
    <section id="top" className="hero hero-cinematic hero-focus section-shell">
      <HeroIntro />

      <div className="hero-system-reference" aria-hidden="true" />
      <div className="hero-system-vignette" aria-hidden="true" />

      <div className="hero-copy hero-copy-cinematic">
        <p className="hero-eyebrow">{siteContent.hero.eyebrow}</p>
        <h1>{siteContent.hero.title}</h1>
        <p className="hero-body">{siteContent.hero.body}</p>
        <div className="actions">
          <Link className="solid-button" href="#work">{siteContent.hero.primaryCta} <span aria-hidden="true">→</span></Link>
          <Link className="ghost-button" href="#contact">{siteContent.hero.secondaryCta}</Link>
        </div>
      </div>

      <div className="proof-strip proof-strip-cinematic">
        {siteContent.hero.proof.map((item) => <span key={item}>● {item}</span>)}
      </div>
    </section>
  );
}
