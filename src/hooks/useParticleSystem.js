import { useEffect, useState, useRef } from 'react';

const GLYPHS = ['~', '|', '·', '°', '+', '-', '"', '*', 'x', '^'];
const COUNT = 2000;

export const useParticleSystem = (decayConfig, hasStarted) => {
  const particlesRef = useRef([]);
  const [fadeOpacity, setFadeOpacity] = useState(0);

  useEffect(() => {
    const particles = [];
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        char: GLYPHS[i % GLYPHS.length],
        isFalling: false,
        innerMargin: 10 + Math.random() * 100 
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    if (hasStarted) {
      let start = null;
      const animateFade = (timestamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const val = Math.min(progress / 2000, 1);
        setFadeOpacity(val);
        if (progress < 2000) requestAnimationFrame(animateFade);
      };
      requestAnimationFrame(animateFade);
    }
  }, [hasStarted]);

  useEffect(() => {
    if (decayConfig && decayConfig.glyphs) {
      particlesRef.current.forEach(p => {
        if (!p.isFalling && decayConfig.glyphs.includes(p.char)) {
          p.isFalling = true;
          p.vy = 2 + Math.random() * 4;
          p.vx = (Math.random() - 0.5) * 1.5;
        }
      });
    }
  }, [decayConfig]);

  return { particles: particlesRef.current, fadeOpacity };
};