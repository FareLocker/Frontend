"use client";

import { useCallback } from "react";
import { themeColor } from "@/lib/dither";
import { createStarField } from "@/lib/star-field";
import { useDitherCanvas, type DitherPainter } from "@/lib/useDitherCanvas";

/**
 * The twinkling night sky, as a `<canvas>` that fills its nearest positioned
 * ancestor. Background.tsx puts one behind the whole site, so pages do not
 * add their own.
 *
 * It redraws 20 times a second, which is plenty for a slow twinkle, and
 * draws one still sky for visitors who prefer reduced motion. The stars
 * themselves live in lib/star-field.ts.
 */
export default function StarField({ className = "" }: { className?: string }) {
  const createPainter = useCallback((canvas: HTMLCanvasElement): DitherPainter => {
    const sky = createStarField({
      color: themeColor(canvas, "--foreground", "#ffffff"),
    });
    return ({ ctx, width, height, elapsed }) => {
      ctx.clearRect(0, 0, width, height);
      sky.draw(ctx, width, height, elapsed);
    };
  }, []);
  const canvasRef = useDitherCanvas(createPainter, 20);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
