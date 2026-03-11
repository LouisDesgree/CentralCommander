'use client';

import { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/cn';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  opacityDir: number;
}

interface ParticleFieldProps {
  /** Number of particles */
  count?: number;
  /** Override light color (default: blue) */
  lightColor?: string;
  /** Override dark color (default: white) */
  darkColor?: string;
  /** Max opacity for particles (0-1) */
  maxOpacity?: number;
  /** Speed multiplier */
  speed?: number;
  className?: string;
}

export function ParticleField({
  count = 32,
  lightColor = '59, 130, 246',   // blue-500 RGB
  darkColor = '255, 255, 255',    // white RGB
  maxOpacity = 0.35,
  speed = 0.3,
  className,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const isDarkRef = useRef(false);

  const initParticles = useCallback(
    (width: number, height: number) => {
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * maxOpacity,
        opacityDir: (Math.random() - 0.5) * 0.005,
      }));
    },
    [count, speed, maxOpacity]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const container = canvas.parentElement;
    if (!container) return;

    function resize() {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx!.scale(dpr, dpr);

      if (particlesRef.current.length === 0) {
        initParticles(rect.width, rect.height);
      }
    }

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Detect dark mode
    function checkDark() {
      isDarkRef.current = document.documentElement.classList.contains('dark');
    }
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    function animate() {
      if (!canvas || !ctx) return;

      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      const color = isDarkRef.current ? darkColor : lightColor;

      for (const p of particlesRef.current) {
        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
        if (p.y < -5) p.y = h + 5;
        if (p.y > h + 5) p.y = -5;

        // Gentle opacity pulse
        p.opacity += p.opacityDir;
        if (p.opacity > maxOpacity || p.opacity < 0.05) {
          p.opacityDir *= -1;
          p.opacity = Math.max(0.05, Math.min(maxOpacity, p.opacity));
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
        ctx.fill();
      }

      // Draw sparse connection lines between nearby particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const a = particlesRef.current[i];
          const b = particlesRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const lineOpacity = (1 - dist / 100) * 0.08;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${color}, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    }

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      ro.disconnect();
      observer.disconnect();
    };
  }, [lightColor, darkColor, maxOpacity, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 pointer-events-none', className)}
      aria-hidden
    />
  );
}
