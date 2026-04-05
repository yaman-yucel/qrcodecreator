/**
 * Returns { yBase, height, color } for a given module position.
 *
 * Tree anatomy:
 *  - Trunk:  narrow, tall, brown — anchored at y=0
 *  - Canopy: elevated sphere of pink blocks sitting well above the ground
 *  - Ground: flat QR base tiles (dark green / white)
 */
export function getBlockProps(row, col, size, isDark) {
  if (!isDark) {
    return { yBase: 0, height: 1, color: '#f5f0e8' };
  }

  const cx = (size - 1) / 2;
  const cz = (size - 1) / 2;
  const normDist =
    Math.sqrt(((col - cx) / cx) ** 2 + ((row - cz) / cz) ** 2) / Math.SQRT2;

  // ── Radii ──
  const TRUNK_R  = 0.10;  // thin trunk
  const INNER_R  = 0.32;  // inner canopy ring
  const OUTER_R  = 0.52;  // outer canopy ring
  const FRINGE_R = 0.63;  // wisps at edge

  // ── Heights ──
  const TRUNK_H    = 12;   // trunk is tall so canopy is well off the ground
  const CANOPY_BASE = 10;  // canopy blocks start here (near trunk top)
  const CANOPY_PEAK = 8;   // max extra height added by the sphere profile

  if (normDist < TRUNK_R) {
    return { yBase: 0, height: TRUNK_H, color: '#8B4513' };
  }

  if (normDist < INNER_R) {
    const t = (normDist - TRUNK_R) / (INNER_R - TRUNK_R); // 0→1
    // Sphere profile — tall near centre, tapers to edge
    const h = Math.max(2, CANOPY_PEAK * Math.sqrt(1 - t * t));
    return { yBase: CANOPY_BASE, height: h, color: '#FF69B4' };
  }

  if (normDist < OUTER_R) {
    const t = (normDist - INNER_R) / (OUTER_R - INNER_R); // 0→1
    const h = Math.max(1.2, 4 * (1 - t));
    // Outer canopy base drops slightly to create a natural droop
    return { yBase: CANOPY_BASE - 1.5 * t, height: h, color: '#FFB6C1' };
  }

  if (normDist < FRINGE_R) {
    const t = (normDist - OUTER_R) / (FRINGE_R - OUTER_R);
    return { yBase: CANOPY_BASE - 3, height: Math.max(0.5, 1.5 * (1 - t)), color: '#FFD1E8' };
  }

  return { yBase: 0, height: 1, color: '#3a7d44' };
}
