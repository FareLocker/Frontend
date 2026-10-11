import type { Vec3 } from "./vec3";

/*
 * The plane every dot animation flies: about 70 triangles with hand-typed
 * corner coordinates. The landing page's fly-by (plane-flyby.ts) and the
 * sign-up page's globe (globe-orbit.ts) both draw this one model, so a change
 * to its shape here changes it everywhere.
 *
 * Nose along +x, up +y, wings along z. About 5.5 units long and wide.
 */

export type Triangle = [Vec3, Vec3, Vec3];

export const TRIANGLES: Triangle[] = [];
/**
 * Edges of the thin, flat parts (wings, tailplane, fin). Seen edge-on these
 * are thinner than one dot and would vanish, so they are drawn as lines too.
 */
export const OUTLINES: [Vec3, Vec3][] = [];

const quad = (a: Vec3, b: Vec3, c: Vec3, d: Vec3) => {
  TRIANGLES.push([a, b, c], [a, c, d]);
};
/** A ring of `sides` points around the x axis, for tubes. */
const ring = (
  x: number,
  radius: number,
  cy: number,
  cz: number,
  sides: number,
  turn: number,
): Vec3[] =>
  Array.from({ length: sides }, (_, i) => {
    const angle = (Math.PI * 2 * i) / sides + turn;
    return [x, cy + radius * Math.sin(angle), cz + radius * Math.cos(angle)];
  });
const tube = (front: Vec3[], back: Vec3[]) => {
  front.forEach((_, i) => {
    const j = (i + 1) % front.length;
    quad(front[i], front[j], back[j], back[i]);
  });
};
const cone = (tip: Vec3, base: Vec3[]) => {
  base.forEach((_, i) => {
    TRIANGLES.push([tip, base[i], base[(i + 1) % base.length]]);
  });
};

// Fuselage: a six-sided tube that narrows to the tail, capped by two cones.
const body = ring(1.85, 0.36, 0, 0, 6, Math.PI / 6);
const waist = ring(-1.5, 0.36, 0, 0, 6, Math.PI / 6);
const rear = ring(-2.25, 0.2, 0.13, 0, 6, Math.PI / 6);
tube(body, waist);
tube(waist, rear);
cone([2.7, -0.06, 0], body);
cone([-2.8, 0.2, 0], rear);

for (const side of [1, -1]) {
  // Wing
  const w1: Vec3 = [0.8, -0.12, 0.3 * side];
  const w2: Vec3 = [-0.55, -0.12, 0.3 * side];
  const w3: Vec3 = [-1.1, 0.1, 2.75 * side];
  const w4: Vec3 = [-0.55, 0.1, 2.75 * side];
  quad(w1, w2, w3, w4);
  OUTLINES.push([w1, w4], [w4, w3], [w3, w2]);
  // Tailplane
  const t1: Vec3 = [-1.85, 0.16, 0.15 * side];
  const t2: Vec3 = [-2.45, 0.16, 0.15 * side];
  const t3: Vec3 = [-2.72, 0.22, 1.05 * side];
  const t4: Vec3 = [-2.38, 0.22, 1.05 * side];
  quad(t1, t2, t3, t4);
  OUTLINES.push([t1, t4], [t4, t3], [t3, t2]);
  // Engine: a short four-sided box under the wing
  const intake = ring(0.85, 0.18, -0.42, 1.15 * side, 4, Math.PI / 4);
  const exhaust = ring(-0.1, 0.15, -0.42, 1.15 * side, 4, Math.PI / 4);
  tube(intake, exhaust);
  quad(intake[0], intake[1], intake[2], intake[3]);
  quad(exhaust[0], exhaust[1], exhaust[2], exhaust[3]);
}

// Tail fin
const f1: Vec3 = [-1.75, 0.3, 0];
const f2: Vec3 = [-2.6, 0.25, 0];
const f3: Vec3 = [-2.82, 1.25, 0];
const f4: Vec3 = [-2.45, 1.25, 0];
quad(f1, f2, f3, f4);
OUTLINES.push([f1, f4], [f4, f3], [f3, f2]);
