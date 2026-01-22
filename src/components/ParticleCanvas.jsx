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
            
            // On définit la zone d'exclusion (Rectangle + marge de la particule)
            const halfW = (exclusionBox.width / 2) + p.innerMargin;
            const halfH = (exclusionBox.height / 2) + p.innerMargin;

            // Calcul de la distance par rapport au centre sur chaque axe
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            const absX = Math.abs(dx);
            const absY = Math.abs(dy);

            // Si la particule est à l'intérieur de la zone d'exclusion
            if (absX < halfW && absY < halfH) {
              // On calcule un facteur de pénétration (0 au bord, 1 au centre)
              const overlapX = 1 - (absX / halfW);
              const overlapY = 1 - (absY / halfH);
              
              // On utilise le plus grand chevauchement pour pousser la particule
              const force = Math.max(overlapX, overlapY) * 2.5;
              const angle = Math.atan2(dy, dx);
              
              p.x += Math.cos(angle) * force;
              p.y += Math.sin(angle) * force;

              // Jitter pour éviter les alignements sur les bords
              p.x += (Math.random() - 0.5) * 0.5;
              p.y += (Math.random() - 0.5) * 0.5;
            }
          }

          // Screen wrap
          if (p.x < 0) p.x = window.innerWidth;
          if (p.x > window.innerWidth) p.x = 0;
          if (p.y < 0) p.y = window.innerHeight;
          if (p.y > window.innerHeight) p.y = 0;
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
    return () => { 
      cancelAnimationFrame(frame); 
      window.removeEventListener('resize', resize); 
    };
  }, [exclusionBox, decayConfig, hasStarted, fadeOpacity, particles]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundColor: 'white' }} />;
};

export default ParticleCanvas;