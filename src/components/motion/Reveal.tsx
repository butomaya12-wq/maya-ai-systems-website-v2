"use client";

import { animated, useSpring } from "@react-spring/web";
import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const styles = useSpring({
    opacity: visible ? 1 : 0,
    y: visible ? 0 : 28,
    blur: visible ? 0 : 10,
    delay,
    config: { tension: 92, friction: 24 },
  });

  return (
    <animated.div
      ref={ref}
      className={className}
      style={{
        opacity: styles.opacity,
        transform: styles.y.to((value) => `translate3d(0, ${value}px, 0)`),
        filter: styles.blur.to((value) => `blur(${value}px)`),
      }}
    >
      {children}
    </animated.div>
  );
}
