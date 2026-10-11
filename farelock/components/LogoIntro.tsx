"use client";

import { useCallback, useEffect, useRef } from "react";
import { accentColor } from "@/lib/dither";
import { createLogoIntro } from "@/lib/logo-intro";
import { useDitherCanvas, type DitherPainter } from "@/lib/useDitherCanvas";

export type LogoIntroProps = {
  /**
   * "globe" starts with the globe and the plane going round it.
   * "lock" (default) skips that: the body is already there.
   */
  start?: "globe" | "lock";
  /**
   * "logo" (default) plays through the letters.
   * "icon" stops on the finished lock.
   */
  upTo?: "logo" | "icon";
  /**
   * When true, restarts after a short hold. When false (default here for
   * one-shot intros), plays once and holds the last frame.
   */
  loop?: boolean;
  /** Width of the finished logo, as a fraction of the canvas width. */
  logoWidth?: number;
  /** Fires once the first play-through reaches its last frame. */
  onComplete?: () => void;
  className?: string;
};

/**
 * The dotted FareLocker logo animation, as a `<canvas>`.
 *
 * Sized by its box (set height/width with `className`). Drawing and timing
 * live in lib/logo-intro.ts — the short HTML prototype at the repo root.
 */
export default function LogoIntro({
  start = "lock",
  upTo = "logo",
  loop = false,
  logoWidth = 0.72,
  onComplete,
  className = "",
}: LogoIntroProps) {
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const createPainter = useCallback(
    (canvas: HTMLCanvasElement): DitherPainter => {
      const intro = createLogoIntro({
        color: accentColor(canvas),
        start,
        upTo,
        loop,
        logoWidth,
      });
      let time = 0;
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        onCompleteRef.current?.();
      };
      return ({ ctx, width, height, dt, animated }) => {
        if (!animated) {
          intro.draw(ctx, width, height, intro.poseDistance);
          finish();
          return;
        }
        time = intro.advance(time, dt);
        intro.draw(ctx, width, height, time);
        // poseDistance is one full play, whether or not the intro loops after.
        if (time >= intro.poseDistance) finish();
      };
    },
    [start, upTo, loop, logoWidth],
  );
  const canvasRef = useDitherCanvas(createPainter);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`block h-full w-full ${className}`}
    />
  );
}
