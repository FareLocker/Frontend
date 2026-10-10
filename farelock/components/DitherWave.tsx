"use client";

import { useEffect, useRef } from "react";

/* 4x4 ordered-dither thresholds: this is what gives the wave its halftone edge. */
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const CELL = 6; // px per dither cell
const BAND = 15; // half-thickness of the wave, in cells
const SPEED = 0.02; // phase added per frame
const COLOR = "#eeeeee";

/* How bright the wave is behind the headline, and where it returns to full.
   Fractions of the canvas width, left to right. */
const DIM = 0.26;
const DIM_UNTIL = 0.58;
const FULL_FROM = 0.84;
const NARROW = 900; // below this width the text spans the hero, so dim it all

/**
 * The animated dithered wave behind the hero.
 *
 * It fills its nearest positioned ancestor and sits behind the content. The
 * left part, where the headline is, is drawn dim so white text stays readable;
 * the wave reaches full brightness on the right, clear of the text.
 *
 * It pauses when scrolled out of view and draws one still frame for people
 * who have asked their system for reduced motion.
 */
export default function DitherWave({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let time = 0;
    let raf = 0;
    let onScreen = true;

    const draw = () => {
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = COLOR;

      const cols = Math.ceil(width / CELL);
      const rows = Math.ceil(height / CELL);
      const mid = rows / 2;
      const amplitude = rows / 4;
      const narrow = width < NARROW;

      for (let x = 0; x < cols; x++) {
        const u = x / cols;
        ctx.globalAlpha =
          narrow || u <= DIM_UNTIL
            ? DIM
            : u >= FULL_FROM
              ? 1
              : DIM + ((1 - DIM) * (u - DIM_UNTIL)) / (FULL_FROM - DIM_UNTIL);

        // Two sines of different length, drifting in opposite directions.
        const centre =
          mid +
          Math.sin(x * 0.05 + time) * amplitude +
          Math.cos(x * 0.025 - time) * amplitude * 0.5;

        // Only the cells near the wave can be lit, so only visit those.
        const first = Math.max(0, Math.floor(centre - BAND - 1));
        const last = Math.min(rows - 1, Math.ceil(centre + BAND + 1));
        for (let y = first; y <= last; y++) {
          const intensity =
            Math.max(0, 1 - Math.abs(y - centre) / BAND) +
            (Math.random() - 0.5) * 0.1;
          if (intensity + BAYER[y & 3][x & 3] / 16 - 0.5 > 0.5) {
            ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
          }
        }
      }
    };

    const frame = () => {
      draw();
      time += SPEED;
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf && !reduceMotion && onScreen) raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const resizeObserver = new ResizeObserver(() => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      draw(); // resizing clears the canvas; also the reduced-motion still
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    intersectionObserver.observe(canvas);

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full opacity-80 ${className}`}
    />
  );
}
