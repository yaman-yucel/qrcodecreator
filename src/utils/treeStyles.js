/**
 * Tree style profiles.
 * Each style exports a getStyleProps(normDist, style) -> { yBase, height, zone }
 * where zone is one of: 'trunk' | 'inner' | 'outer' | 'fringe' | 'base'
 *
 * normDist = 0 at centre, 1 at corner.
 */

function cherryProps(normDist) {
  const TRUNK_R  = 0.10;
  const INNER_R  = 0.32;
  const OUTER_R  = 0.52;
  const FRINGE_R = 0.63;

  if (normDist < TRUNK_R) {
    return { yBase: 0, height: 12, zone: 'trunk' };
  }
  if (normDist < INNER_R) {
    const t = (normDist - TRUNK_R) / (INNER_R - TRUNK_R);
    const height = Math.max(2, 8 * Math.sqrt(1 - t * t));
    return { yBase: 10, height, zone: 'inner' };
  }
  if (normDist < OUTER_R) {
    const t = (normDist - INNER_R) / (OUTER_R - INNER_R);
    const height = Math.max(1.2, 4 * (1 - t));
    return { yBase: 10 - 1.5 * t, height, zone: 'outer' };
  }
  if (normDist < FRINGE_R) {
    const t = (normDist - OUTER_R) / (FRINGE_R - OUTER_R);
    return { yBase: 7, height: Math.max(0.5, 1.5 * (1 - t)), zone: 'fringe' };
  }
  return { yBase: 0, height: 1, zone: 'base' };
}

function pineProps(normDist) {
  const TRUNK_R  = 0.10;
  const CANOPY_R = 0.55;
  const FRINGE_R = 0.65;
  const MID_R    = TRUNK_R + (CANOPY_R - TRUNK_R) / 2; // 0.325

  if (normDist < TRUNK_R) {
    return { yBase: 0, height: 14, zone: 'trunk' };
  }
  if (normDist < CANOPY_R) {
    const t = (normDist - TRUNK_R) / (CANOPY_R - TRUNK_R);
    const height = Math.max(1, 12 * (1 - t));
    const zone = normDist < MID_R ? 'inner' : 'outer';
    return { yBase: 0, height, zone };
  }
  if (normDist < FRINGE_R) {
    const t = (normDist - CANOPY_R) / (FRINGE_R - CANOPY_R);
    return { yBase: 0, height: Math.max(0.5, 2 * (1 - t)), zone: 'fringe' };
  }
  return { yBase: 0, height: 1, zone: 'base' };
}

function oakProps(normDist) {
  const TRUNK_R  = 0.08;
  const CANOPY_R = 0.55;
  const FRINGE_R = 0.70;
  const MID_R    = TRUNK_R + (CANOPY_R - TRUNK_R) / 2; // 0.315

  if (normDist < TRUNK_R) {
    return { yBase: 0, height: 7, zone: 'trunk' };
  }
  if (normDist < CANOPY_R) {
    const t = (normDist - TRUNK_R) / (CANOPY_R - TRUNK_R);
    const height = Math.max(1.5, 4.5 * Math.sqrt(1 - t * t));
    const zone = normDist < MID_R ? 'inner' : 'outer';
    return { yBase: 6, height, zone };
  }
  if (normDist < FRINGE_R) {
    const t = (normDist - CANOPY_R) / (FRINGE_R - CANOPY_R);
    return { yBase: 4.5, height: Math.max(0.5, 2 * (1 - t)), zone: 'fringe' };
  }
  return { yBase: 0, height: 1, zone: 'base' };
}

function bonsaiProps(normDist) {
  const TRUNK_R  = 0.07;
  const INNER_R  = 0.40;
  const OUTER_R  = 0.75;
  const FRINGE_R = 0.85;

  if (normDist < TRUNK_R) {
    return { yBase: 0, height: 4, zone: 'trunk' };
  }
  if (normDist < INNER_R) {
    const t = (normDist - TRUNK_R) / (INNER_R - TRUNK_R);
    const height = 2 + 0.5 * Math.cos(t * Math.PI); // slight dome, ~2-2.5
    return { yBase: 3, height, zone: 'inner' };
  }
  if (normDist < OUTER_R) {
    const t = (normDist - INNER_R) / (OUTER_R - INNER_R);
    const height = 2 - 0.5 * t; // very flat, 1.5-2
    return { yBase: 3, height, zone: 'outer' };
  }
  if (normDist < FRINGE_R) {
    return { yBase: 1.5, height: 1, zone: 'fringe' };
  }
  return { yBase: 0, height: 1, zone: 'base' };
}

const STYLE_FNS = {
  cherry: cherryProps,
  pine:   pineProps,
  oak:    oakProps,
  bonsai: bonsaiProps,
};

/**
 * @param {number} normDist - normalised distance from centre (0=centre, 1=corner)
 * @param {string} style - one of 'cherry' | 'pine' | 'oak' | 'bonsai'
 * @returns {{ yBase: number, height: number, zone: string }}
 */
export function getStyleProps(normDist, style = 'cherry') {
  const fn = STYLE_FNS[style] ?? STYLE_FNS.cherry;
  return fn(normDist);
}

export const STYLE_LABELS = {
  cherry:  '🌸 Cherry',
  pine:    '🌲 Pine',
  oak:     '🌳 Oak',
  bonsai:  '🎋 Bonsai',
};
