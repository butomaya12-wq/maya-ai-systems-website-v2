"use client";

import { useEffect, useState } from "react";

const MIN_DURATION = 2100;
const EXIT_DURATION = 720;

export function HeroIntro() {
  const [phase, setPhase] = useState<"enter" | "exit" | "done">("enter");

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previousOverflow = body.style.overflow;

    root.classList.remove("maya-intro-revealed");
    root.classList.add("maya-intro-active");
    body.style.overflow = "hidden";

    const enterMs = reduced ? 650 : MIN_DURATION;
    const exitMs = reduced ? 260 : EXIT_DURATION;

    const exitTimer = window.setTimeout(() => setPhase("exit"), enterMs);
    const doneTimer = window.setTimeout(() => {
      setPhase("done");
      root.classList.remove("maya-intro-active");
      root.classList.add("maya-intro-revealed");
      body.style.overflow = previousOverflow;
    }, enterMs + exitMs);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
      root.classList.remove("maya-intro-active");
      root.classList.add("maya-intro-revealed");
      body.style.overflow = previousOverflow;
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div className={`maya-intro maya-intro-${phase}`} aria-hidden="true">
      <div className="maya-intro-bloom" />
      <div className="maya-intro-orbit maya-intro-orbit-a" />
      <div className="maya-intro-orbit maya-intro-orbit-b" />
      <div className="maya-intro-core">
        <span className="maya-intro-core-dot" />
        <span className="maya-intro-core-ring" />
      </div>
      <div className="maya-intro-copy">
        <span>MAYA</span>
        <span>AI SYSTEMS</span>
      </div>
      <div className="maya-intro-status">
        <span>STRUCTURE</span>
        <i />
        <span>SIGNAL → SYSTEM → RESULT</span>
      </div>
    </div>
  );
}
