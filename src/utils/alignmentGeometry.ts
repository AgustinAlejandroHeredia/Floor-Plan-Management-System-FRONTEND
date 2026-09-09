// 2-D transform helpers for the alignment UI. A transform is a 2x3 matrix
// [[a,b,e],[c,d,f]] mapping (x,y) -> (a*x+b*y+e, c*x+d*y+f), matching the backend
// (source blueprint pixels -> counterpart pixels).

export interface Similarity {
  scale: number
  rotationDeg: number
  tx: number
  ty: number
}

export const IDENTITY: number[][] = [
  [1, 0, 0],
  [0, 1, 0],
]

export function matrixToSimilarity(m: number[][]): Similarity {
  const a = m[0][0], b = m[0][1], e = m[0][2]
  const c = m[1][0], d = m[1][1], f = m[1][2]
  const scale = Math.sqrt(Math.abs(a * d - b * c)) || 1
  const rotationDeg = (Math.atan2(c, a) * 180) / Math.PI
  return { scale, rotationDeg, tx: e, ty: f }
}

export function similarityToMatrix(s: Similarity): number[][] {
  const th = (s.rotationDeg * Math.PI) / 180
  const cos = s.scale * Math.cos(th)
  const sin = s.scale * Math.sin(th)
  return [
    [cos, -sin, s.tx],
    [sin, cos, s.ty],
  ]
}

export function applyMatrix(m: number[][], x: number, y: number): [number, number] {
  return [
    m[0][0] * x + m[0][1] * y + m[0][2],
    m[1][0] * x + m[1][1] * y + m[1][2],
  ]
}

// Least-squares similarity (scale+rotation+translation) mapping src -> dst point
// pairs (>= 2). Returns null if degenerate. Uses the complex-number closed form.
export function similarityFromPairs(
  pairs: { sx: number; sy: number; dx: number; dy: number }[],
): number[][] | null {
  const n = pairs.length
  if (n < 2) return null

  let ax = 0, ay = 0, bx = 0, by = 0
  for (const p of pairs) {
    ax += p.sx; ay += p.sy; bx += p.dx; by += p.dy
  }
  ax /= n; ay /= n; bx /= n; by /= n

  let numRe = 0, numIm = 0, den = 0
  for (const p of pairs) {
    const acx = p.sx - ax, acy = p.sy - ay
    const bcx = p.dx - bx, bcy = p.dy - by
    numRe += acx * bcx + acy * bcy
    numIm += acx * bcy - acy * bcx
    den += acx * acx + acy * acy
  }
  if (den < 1e-9) return null

  const wr = numRe / den, wi = numIm / den
  const tx = bx - (wr * ax - wi * ay)
  const ty = by - (wi * ax + wr * ay)
  return [
    [wr, -wi, tx],
    [wi, wr, ty],
  ]
}
