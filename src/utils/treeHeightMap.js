import { THEMES } from './themes.js';
import { getStyleProps } from './treeStyles.js';

/**
 * Returns { yBase, height, color } for a given module position.
 *
 * @param {number} row
 * @param {number} col
 * @param {number} size  - matrix dimension (assumed square)
 * @param {boolean} isDark
 * @param {string} style - tree style key (cherry | pine | oak | bonsai)
 * @param {string} theme - color theme key (cherry | autumn | winter | tropical | golden | neon)
 */
export function getBlockProps(row, col, size, isDark, style = 'cherry', theme = 'cherry') {
  if (!isDark) {
    return { yBase: 0, height: 1, color: '#f5f0e8' };
  }

  const cx = (size - 1) / 2;
  const cz = (size - 1) / 2;
  const normDist =
    Math.sqrt(((col - cx) / cx) ** 2 + ((row - cz) / cz) ** 2) / Math.SQRT2;

  const { yBase, height, zone } = getStyleProps(normDist, style);
  const colors = THEMES[theme] ?? THEMES.cherry;
  return { yBase, height, color: colors[zone] ?? colors.base };
}
