/**
 * Returns { height, color } for a given module position in the QR/DataMatrix grid.
 *
 * @param {number} row        - Row index (0-based)
 * @param {number} col        - Column index (0-based)
 * @param {number} size       - Total grid size (number of modules along one side)
 * @param {boolean} isDark    - Whether this module is a dark (1) module
 * @returns {{ height: number, color: string }}
 */
export function getBlockProps(row, col, size, isDark) {
  // Light modules are always flat white/cream blocks at height 1
  if (!isDark) {
    return { height: 1, color: '#f5f0e8' };
  }

  // Normalised radial distance from centre: 0 = centre, 1 = corner
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  const dx = (col - cx) / cx;
  const dy = (row - cy) / cy;
  const dist = Math.sqrt(dx * dx + dy * dy) / Math.SQRT2; // normalise so corner = 1

  if (dist < 0.12) {
    // Trunk – tall brown column
    return { height: 6, color: '#8B4513' };
  } else if (dist < 0.20) {
    // Inner canopy base – tallest pink band
    return { height: 9, color: '#FF69B4' };
  } else if (dist < 0.38) {
    // Inner canopy – height decreases with distance
    const h = Math.max(2, 8 - dist * 8);
    return { height: h, color: '#FF69B4' };
  } else if (dist < 0.55) {
    // Outer canopy – lower pink
    const h = Math.max(1.5, 5 - dist * 4);
    return { height: h, color: '#FFB6C1' };
  } else {
    // Ground / far edges – short dark-green base
    return { height: 1, color: '#3a7d44' };
  }
}
