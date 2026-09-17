"use client";

import { useEffect, useRef } from "react";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function HeroCaseBridge() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let raf = 0;
    const update = () => {
      const rect = element.getBoundingClientRect();
      const vh = Math.max(1, window.innerHeight);
      const raw = (vh - rect.top) / (vh + rect.height * 0.45);
      const progress = clamp01(raw);
      element.style.setProperty("--bridge-p", progress.toFixed(4));
      raf = window.requestAnimationFrame(update);
    };

    raf = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={ref} className="hero-case-bridge" aria-hidden="true">
      <div className="hero-case-bridge-glow" />
      <div className="hero-case-bridge-rail">
        <span className="hero-case-bridge-node hero-case-bridge-node-a" />
        <span className="hero-case-bridge-line hero-case-bridge-line-a" />
        <span className="hero-case-bridge-node hero-case-bridge-node-b" />
        <span className="hero-case-bridge-line hero-case-bridge-line-b" />
        <span className="hero-case-bridge-node hero-case-bridge-node-c" />
      </div>
      <div className="hero-case-bridge-label hero-case-bridge-label-left">СИГНАЛ</div>
      <div className="hero-case-bridge-label hero-case-bridge-label-center">СТРУКТУРА</div>
      <div className="hero-case-bridge-label hero-case-bridge-label-right">ВНЕДРЕНИЕ</div>
      <div className="hero-case-bridge-caption">ОТ ЛОГИКИ СИСТЕМЫ К ОПЛАЧЕННОМУ B2B-РЕЗУЛЬТАТУ</div>
    </div>
  );
}
