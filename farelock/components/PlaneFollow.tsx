"use client";

import { useCallback, useEffect, useRef } from "react";
import { accentColor, backgroundColor } from "@/lib/dither";
import { createPlaneFollow, type Box, type Point } from "@/lib/plane-follow";
import { useDitherCanvas, type DitherPainter } from "@/lib/useDitherCanvas";

/** How many frames pass between looks at where the page's text is. */
const MEASURE_EVERY = 45;

/**
 * Three dot-matrix planes that follow the cursor around a page, and so come
 * down the page with the visitor as they scroll.
 *
 * Put it first inside the page's `relative` wrapper (see app/.../about).
 * The planes fly over that wrapper, behind its content:
 *
 *   <main className="relative flex-1">
 *     <PlaneFollow />
 *     ...
 *   </main>
 *
 * Mark any text the planes pass behind with `data-plane-quiet`, and their
 * dots are dimmed there so the words stay readable. Anything with a solid
 * background (a card, a photo, the footer) hides them completely.
 *
 * How it sits on the page:
 * - The canvas is pinned to the window and is only the window's size, so a
 *   long page costs no more to draw than a short one. The planes' positions
 *   are kept in page pixels, and each frame is told where the page currently
 *   is behind the window.
 * - With no mouse (a touch screen, or before it first moves) the planes
 *   circle the middle of the window instead.
 * - For visitors who prefer reduced motion nothing follows anything: the
 *   canvas is fixed to the top of the page, not the window, and shows one
 *   still frame that scrolls away with the heading.
 *
 * The flying and the drawing are in lib/plane-follow.ts.
 */
export default function PlaneFollow({ className = "" }: { className?: string }) {
  /** Where the mouse is in the window, or null when there isn't one. */
  const pointer = useRef<Point | null>(null);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      // A finger is not a cursor: it only exists while it is scrolling.
      if (event.pointerType === "touch") return;
      pointer.current = { x: event.clientX, y: event.clientY };
    };
    const onLeave = () => {
      pointer.current = null;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const createPainter = useCallback((canvas: HTMLCanvasElement): DitherPainter => {
    const page = canvas.parentElement;
    const flock = createPlaneFollow({
      color: accentColor(canvas),
      // Solid behind the planes, so the page's stars don't show through them.
      backdrop: backgroundColor(canvas),
    });
    let placed = false;
    let quiet: Box[] = [];
    let framesSinceMeasure = 0;

    return ({ ctx, width, height, dt, animated }) => {
      if (!page) return;
      // Where the canvas and the page are in the window right now. Read
      // every frame, so scrolling is picked up without a scroll listener.
      const layer = canvas.getBoundingClientRect();
      const host = page.getBoundingClientRect();

      if (!placed) {
        flock.place(host.width);
        placed = true;
      }
      // dt is 0 for the first frame and after a resize: the layout may have
      // moved, so look again. Otherwise look now and then.
      framesSinceMeasure += 1;
      if (dt === 0 || framesSinceMeasure >= MEASURE_EVERY) {
        framesSinceMeasure = 0;
        quiet = Array.from(page.querySelectorAll("[data-plane-quiet]"), (element): Box => {
          const box = element.getBoundingClientRect();
          return [
            box.left - host.left,
            box.top - host.top,
            box.right - host.left,
            box.bottom - host.top,
          ];
        });
      }

      if (animated && dt > 0) {
        // The cursor's place on the PAGE. It moves when the page scrolls
        // under a still mouse, which is what brings the planes along.
        const at = pointer.current ?? {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        };
        flock.step(
          dt,
          {
            x: Math.max(0, Math.min(host.width, at.x - host.left)),
            y: Math.max(0, Math.min(host.height, at.y - host.top)),
          },
          host.width,
        );
      }

      flock.draw(
        ctx,
        width,
        height,
        { x: host.left - layer.left, y: host.top - layer.top },
        host.width,
        quiet,
      );
    };
  }, []);
  const canvasRef = useDitherCanvas(createPainter);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-5 h-full w-full motion-reduce:absolute motion-reduce:bottom-auto motion-reduce:h-svh ${className}`}
    />
  );
}
