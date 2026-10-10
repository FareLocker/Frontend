/*
 * The small amount of 3D vector maths the dot animations share.
 * Space is measured from the viewer: x to the right, y up, z away.
 */

export type Vec3 = [number, number, number];

export const length3 = (v: Vec3) => Math.hypot(v[0], v[1], v[2]);

export const sub = (a: Vec3, b: Vec3): Vec3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];

export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** The same direction, one unit long. */
export const unit = (v: Vec3): Vec3 => {
  const size = length3(v) || 1;
  return [v[0] / size, v[1] / size, v[2] / size];
};

/** Direction the light comes from: above, to the left, on the viewer's side. */
export const LIGHT = unit([-0.35, 0.75, -0.55]);
