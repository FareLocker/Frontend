"use client";

import { useCallback } from "react";
import { accentColor, backgroundColor } from "@/lib/dither";
import { createGlobeOrbit } from "@/lib/globe-orbit";
import { useDitherCanvas, type DitherPainter } from "@/lib/useDitherCanvas";

/**
 * The dotted globe with the plane flying round it, as a `<canvas>` that
 * fills its nearest positioned ancestor. The globe makes itself as large as
 * that box allows with every orbit still inside it, so to move or resize the
 * globe, move or resize the box.
 *
 * The drawing, the orbits and the map live in lib/globe-orbit.ts.
 */
export default function GlobeOrbit({ className = "" }: { className?: string }) {
  const createPainter = useCallback((canvas: HTMLCanvasElement): DitherPainter => {
    const orbit = createGlobeOrbit({
      color: accentColor(canvas),
      // Solid behind the globe, so the page's stars don't show through it.
      backdrop: backgroundColor(canvas),
    });
    let time = 0;
    return ({ ctx, width, height, dt, animated }) => {
      if (animated) time = orbit.advance(time, dt);
      orbit.draw(ctx, width, height, animated ? time : orbit.stillTime);
    };
  }, []);
  const canvasRef = useDitherCanvas(createPainter);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
