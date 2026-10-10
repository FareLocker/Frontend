"use client";

import { useCallback } from "react";
import { accentColor } from "@/lib/dither";
import { createPlaneFlyby, type TextStop } from "@/lib/plane-flyby";
import { useDitherCanvas, type DitherPainter } from "@/lib/useDitherCanvas";

/**
 * The 3D dot-matrix plane, as a background layer.
 *
 * It fills its nearest positioned ancestor and sits behind the content, so
 * put it first inside a `relative overflow-hidden` section. The drawing and
 * the flight path live in lib/plane-flyby.ts.
 *
 * `textStops` must be a constant defined outside the component that renders
 * this (see Hero.tsx): a new array each render would restart the flight.
 */
export default function PlaneFlyby({
  flatten,
  horizon,
  textStops,
  className = "",
}: {
  /** Squash the flight path's height for a short, wide section. */
  flatten?: number;
  /** Height of the horizon, as a fraction down the section. */
  horizon?: number;
  /** Outline of the text to dim behind. */
  textStops?: TextStop[];
  className?: string;
}) {
  const createPainter = useCallback(
    (canvas: HTMLCanvasElement): DitherPainter => {
      const flyby = createPlaneFlyby({
        color: accentColor(canvas),
        flatten,
        horizon,
        textStops,
      });
      let distance = 0;
      return ({ ctx, width, height, dt, animated }) => {
        if (animated) distance = flyby.advance(distance, dt);
        flyby.draw(ctx, width, height, animated ? distance : flyby.poseDistance);
      };
    },
    [flatten, horizon, textStops],
  );
  const canvasRef = useDitherCanvas(createPainter);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full opacity-80 ${className}`}
    />
  );
}
