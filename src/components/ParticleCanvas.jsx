import React, { useRef, useEffect } from 'react';
import { useParticleSystem } from '../hooks/useParticleSystem';

const ParticleCanvas = ({ exclusionBox, decayConfig, hasStarted }) => {
  const canvasRef = useRef(null);
  const { particles, fadeOpacity } = useParticleSystem(decayConfig, hasStarted);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frame;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "14px serif"; 
      ctx.fillStyle = "#999999"; 

      particles.forEach(p => {
        if (!p.isFalling) {
          p.x += p.vx + (Math.random() - 0.5) * 0.15;
          p.y += p.vy + (Math.random() - 0.5) * 0.15;

          if (exclusionBox && hasStarted) {
            const centerX = exclusionBox.left + exclusionBox.width / 2;
            const centerY = exclusionBox.top + exclusionBox.height / 2;
            
            // Répulsion symétrique pure
            const halfW = (exclusionBox.width / 2) + p.innerMargin;
            const halfH = (exclusionBox.height / 2) + p.innerMargin;

            const dx = p.x - centerX;
            const dy = p.y - centerY;
            const absX = Math.abs(dx);
            const absY = Math.abs(dy);

            if (absX < halfW && absY < halfH) {
              const overlapX = 1 - (absX / halfW);
              const overlapY = 1 - (absY / halfH);
              const force = Math.max(overlapX, overlapY) * 3.5;
              const angle = Math.atan2(dy, dx);
              
              p.x += Math.cos(angle) * force;
              p.y += Math.sin(angle) * force;
            }
          }

          if (p.x < -20) p.x = window.innerWidth + 20;
          if (p.x > window.innerWidth + 20) p.x = -20;
          if (p.y < -20) p.y = window.innerHeight + 20;
          if (p.y > window.innerHeight + 20) p.y = -20;
        } else {
          p.y += p.vy;
          p.x += p.vx;
        }

        if (hasStarted) {
          ctx.globalAlpha = fadeOpacity;
          ctx.fillText(p.char, p.x, p.y);
        }
      });
      frame = requestAnimationFrame(render);
    };

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    window.addEventListener('resize', resize);
    resize();
    render();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, [exclusionBox, decayConfig, hasStarted, fadeOpacity, particles]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundColor: 'white' }} />;
};

export default ParticleCanvas;