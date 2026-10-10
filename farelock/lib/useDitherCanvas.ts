"use client";

import { useEffect, useRef } from "react";

export type DitherFrame = {
  ctx: CanvasRenderingContext2D;
  /** Canvas size in CSS pixels. Draw in these units. */
  width: number;
  height: number;
  /** Seconds since the previous frame (0 for a one-off redraw). */
  dt: number;
  /** Seconds this canvas has spent animating. */
  elapsed: number;
  /** False when the visitor has asked for reduced motion: draw one still. */
  animated: boolean;
};

export type DitherPainter = (frame: DitherFrame) => void;

/**
 * Everything a canvas animation needs apart from the drawing itself:
 *
 * - keeps the canvas the same size as its box, sharp on high-density screens
 * - runs the frame loop only while the canvas is on screen
 * - draws a single still frame for visitors who prefer reduced motion
 *
 * `createPainter` runs once per canvas and returns the function that draws a
 * frame, so anything it sets up (a flight path, a data series) is private to
 * that canvas. Pass a stable function (module-level, or from useCallback):
 * a new one restarts the animation.
 *
 * `fps` caps the frame rate for drawings that only need to twinkle.
 */
export function useDitherCanvas(
  createPainter: (canvas: HTMLCanvasElement) => DitherPainter,
  fps?: number,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const paint = createPainter(canvas);
    const animated = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    const frameGap = fps ? 1000 / fps : 0;
    const maxStep = Math.max(0.05, frameGap / 500);

    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    let elapsed = 0;
    let onScreen = false;

    const render = (dt: number) => {
      if (!width || !height) return;
      elapsed += dt;
      paint({ ctx, width, height, dt, elapsed, animated });
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (last && now - last < frameGap) return;
      // Clamp the step so returning to a background tab doesn't jump ahead.
      const dt = last ? Math.min((now - last) / 1000, maxStep) : 0;
      last = now;
      render(dt);
    };
    const start = () => {
      if (!raf && animated && onScreen) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const resizeObserver = new ResizeObserver(() => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      // Cap at 2x: beyond that the extra pixels cost more than they show.
      const density = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      ctx.setTransform(density, 0, 0, density, 0, 0);
      render(0); // resizing clears the canvas; also the reduced-motion still
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
  }, [createPainter, fps]);

  return canvasRef;
}
