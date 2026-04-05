/**
 * Returns { yBase, height, color } for a given module position.
 *
 * The trick that makes it look like a tree from the side:
 *  - Trunk blocks start at y=0 and are tall (anchor the tree to the ground)
 *  - Canopy blocks are ELEVATED — their base starts at ~trunk height
 *    so they appear to float in a round cluster above the trunk
 *  - Outer/ground modules stay flat at y=0, height=1
 *
 * @param {number} row
 * @param {number} col
 * @param {number} size   total grid side length
 * @param {boolean} isDark
 * @returns {{ yBase: number, height: number, color: string }}
 */
export function getBlockProps(row, col, size, isDark) {
  // Light modules → flat white tile
  if (!isDark) {
    return { yBase: 0, height: 1, color: '#f5f0e8' };
  }

  const cx = (size - 1) / 2;
  const cz = (size - 1) / 2;
  // normDist: 0 = centre, 1 = midpoint of an edge
  const normDist =
    Math.sqrt(((col - cx) / cx) ** 2 + ((row - cz) / cz) ** 2) / Math.SQRT2;

  const TRUNK_R   = 0.12;   // trunk zone radius
  const INNER_R   = 0.30;   // inner canopy radius
  const OUTER_R   = 0.50;   // outer canopy radius
  const FRINGE_R  = 0.62;   // fringe / outer edge

  const TRUNK_H   = 6;      // trunk rises from y=0 to y=6
  const CANOPY_BASE = 4.5;  // canopy blocks start above trunk base

  if (normDist < TRUNK_R) {
    // ── Trunk ──
    // Tall column anchored to the ground; brown
    return { yBase: 0, height: TRUNK_H, color: '#8B4513' };
  }

  if (normDist < INNER_R) {
    // ── Inner canopy ──
    // Elevated sphere slice — tallest closest to trunk, tapers outward
    const t = (normDist - TRUNK_R) / (INNER_R - TRUNK_R); // 0→1
    // sphere profile: h = R * sqrt(1 - t²)
    const h = Math.max(1.5, 6 * Math.sqrt(1 - t * t));
    return { yBase: CANOPY_BASE, height: h, color: '#FF69B4' };
  }

  if (normDist < OUTER_R) {
    // ── Outer canopy ──
    const t = (normDist - INNER_R) / (OUTER_R - INNER_R); // 0→1
    const h = Math.max(1, 3.5 * (1 - t));
    // Slightly lower base so it blends with inner ring
    return { yBase: CANOPY_BASE - 1 + t * 0.5, height: h, color: '#FFB6C1' };
  }

  if (normDist < FRINGE_R) {
    // ── Fringe ──
    // Very short elevated wisps at the canopy edge
    const t = (normDist - OUTER_R) / (FRINGE_R - OUTER_R);
    return { yBase: CANOPY_BASE - 2, height: Math.max(0.5, 1.5 * (1 - t)), color: '#FFD1E8' };
  }

  // ── Ground / QR base ──
  return { yBase: 0, height: 1, color: '#3a7d44' };
}
