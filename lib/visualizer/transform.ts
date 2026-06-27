/**
 * Compute the CSS `matrix3d(...)` string that warps the unit source rectangle
 * (0,0)→(srcW,0)→(srcW,srcH)→(0,srcH) onto a 4-corner destination quadrilateral.
 *
 * Used by the room visualizer to project a rug image into a room photo's
 * placement quad. The destination corners are in CSS pixel coords (i.e. they
 * must already match the displayed size of the surrounding container — the
 * caller is responsible for scaling them from intrinsic image-pixel coords).
 *
 * Math: solve the 8 unknowns of the 3×3 projective transform via direct linear
 * transform (DLT). Then encode as a column-major 4×4 for CSS matrix3d.
 */

import type { Quadrilateral } from "./rooms";

type Point = readonly [number, number];

function solveLinearSystem(A: number[][], b: number[]): number[] {
  // Gaussian elimination with partial pivoting on an augmented matrix.
  const n = A.length;
  const M: number[][] = A.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < n; i++) {
    let pivot = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[pivot][i])) pivot = k;
    }
    [M[i], M[pivot]] = [M[pivot], M[i]];
    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / M[i][i];
      for (let j = i; j <= n; j++) M[k][j] -= factor * M[i][j];
    }
  }
  const x: number[] = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) sum += M[i][j] * x[j];
    x[i] = (M[i][n] - sum) / M[i][i];
  }
  return x;
}

/** Solve for the 3×3 projective transform mapping `src` corners onto `dst` corners. */
export function computeHomography(
  src: readonly [Point, Point, Point, Point],
  dst: readonly [Point, Point, Point, Point],
): readonly [number, number, number, number, number, number, number, number] {
  // 8 equations (2 per correspondence), 8 unknowns (3×3 with h33 fixed at 1).
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [sx, sy] = src[i];
    const [dx, dy] = dst[i];
    A.push([sx, sy, 1, 0, 0, 0, -sx * dx, -sy * dx]);
    b.push(dx);
    A.push([0, 0, 0, sx, sy, 1, -sx * dy, -sy * dy]);
    b.push(dy);
  }
  const h = solveLinearSystem(A, b);
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7]] as const;
}

/**
 * Build the CSS `matrix3d(...)` string for warping a `srcW × srcH` rectangle
 * onto `dst`. The 3×3 projective matrix becomes a 4×4 by leaving Z untouched.
 */
export function buildMatrix3d(srcW: number, srcH: number, dst: Quadrilateral): string {
  const src: [Point, Point, Point, Point] = [
    [0, 0],
    [srcW, 0],
    [srcW, srcH],
    [0, srcH],
  ];
  const dstArr: [Point, Point, Point, Point] = [
    dst.topLeft,
    dst.topRight,
    dst.bottomRight,
    dst.bottomLeft,
  ];
  const [a, b, c, d, e, f, g, hh] = computeHomography(src, dstArr);
  // Column-major 4×4 (each group of 4 is a column):
  //   col 0:  a, d, 0, g
  //   col 1:  b, e, 0, hh
  //   col 2:  0, 0, 1, 0
  //   col 3:  c, f, 0, 1
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,1)`;
}

/** Scale a quadrilateral uniformly (used when the displayed room is smaller than its intrinsic photo). */
export function scaleQuad(q: Quadrilateral, scale: number): Quadrilateral {
  return {
    topLeft: [q.topLeft[0] * scale, q.topLeft[1] * scale] as const,
    topRight: [q.topRight[0] * scale, q.topRight[1] * scale] as const,
    bottomRight: [q.bottomRight[0] * scale, q.bottomRight[1] * scale] as const,
    bottomLeft: [q.bottomLeft[0] * scale, q.bottomLeft[1] * scale] as const,
  };
}

/**
 * Bilinear interpolation inside a quadrilateral. (u, v) are unit coords where
 * u=0 is the left edge, u=1 is the right edge, v=0 is the top (far) edge, and
 * v=1 is the bottom (near) edge. Used to find the corners of a rug's actual
 * coverage area inside the room's full placement quad.
 */
function bilerp(q: Quadrilateral, u: number, v: number): Point {
  const [tlx, tly] = q.topLeft;
  const [trx, try_] = q.topRight;
  const [brx, bry] = q.bottomRight;
  const [blx, bly] = q.bottomLeft;
  const x =
    (1 - u) * (1 - v) * tlx + u * (1 - v) * trx + u * v * brx + (1 - u) * v * blx;
  const y =
    (1 - u) * (1 - v) * tly + u * (1 - v) * try_ + u * v * bry + (1 - u) * v * bly;
  return [x, y];
}

/**
 * Compute the sub-quadrilateral that a `rugWidthFt × rugDepthFt` rug occupies
 * inside the room's full placement quad, centered. Respects the room's
 * `realDimensions` so a 4×6 reads as a scatter and a 9×12 nearly fills the floor.
 *
 * If the rug is taller than the room's depth, the depth ratio clamps to 1
 * (rug doesn't extend past the back of the room).
 */
export function rugSubQuad(
  room: { placement: Quadrilateral; realDimensions: { widthFt: number; depthFt: number } },
  rugWidthFt: number,
  rugDepthFt: number,
): Quadrilateral {
  const wRatio = Math.min(rugWidthFt / room.realDimensions.widthFt, 1);
  const dRatio = Math.min(rugDepthFt / room.realDimensions.depthFt, 1);
  const uLo = (1 - wRatio) / 2;
  const uHi = (1 + wRatio) / 2;
  const vLo = (1 - dRatio) / 2;
  const vHi = (1 + dRatio) / 2;
  return {
    topLeft: bilerp(room.placement, uLo, vLo),
    topRight: bilerp(room.placement, uHi, vLo),
    bottomRight: bilerp(room.placement, uHi, vHi),
    bottomLeft: bilerp(room.placement, uLo, vHi),
  };
}

/**
 * Parse an `sizeImperial` like `4'2" × 8'0"` into `{ widthFt, depthFt }`. The
 * convention used throughout the catalog: the first dimension is the rug's
 * shorter (width) side, the second is the longer (length / depth) side.
 * Falls back to 6×9 if parsing fails — sensible default for an unknown rug.
 */
export function parseRugSizeFt(sizeImperial: string): { widthFt: number; depthFt: number } {
  const m = sizeImperial.match(/(\d+)'\s*(\d+)?"?\s*[×x]\s*(\d+)'\s*(\d+)?"?/);
  if (!m) return { widthFt: 6, depthFt: 9 };
  const w = parseInt(m[1] ?? "0", 10) + parseInt(m[2] ?? "0", 10) / 12;
  const l = parseInt(m[3] ?? "0", 10) + parseInt(m[4] ?? "0", 10) / 12;
  if (!w || !l) return { widthFt: 6, depthFt: 9 };
  return { widthFt: w, depthFt: l };
}
