/**
 * Generates a 2-D binary matrix from a Data Matrix code.
 * 1 = dark module, 0 = light module.
 *
 * Uses datamatrix-svg-ts which provides encodeToMatrix() that returns
 * { matrix, width, height } directly — no SVG parsing needed.
 *
 * @param {string} text
 * @returns {Promise<number[][]>}
 */
export async function generateDataMatrix(text) {
  const { encodeToMatrix } = await import('datamatrix-svg-ts');
  const result = encodeToMatrix(text);
  const { matrix, width, height } = result;

  // Convert sparse array (1 = dark, undefined = light) to dense 0/1 matrix
  const out = [];
  for (let row = 0; row < height; row++) {
    const rowArr = [];
    for (let col = 0; col < width; col++) {
      rowArr.push(matrix[row]?.[col] ? 1 : 0);
    }
    out.push(rowArr);
  }
  return out;
}

/**
 * Legacy SVG parser — kept for reference but no longer used by default.
 * parseSVGMatrix is still exported in case App.jsx references it.
 */
export function parseSVGMatrix(svgString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');

  const svgEl = doc.querySelector('svg');
  if (!svgEl) throw new Error('No SVG element found in datamatrix output');

  const viewBox = svgEl.getAttribute('viewBox') || '';
  const vbParts = viewBox.trim().split(/\s+|,/);
  let gridW = 0;
  let gridH = 0;
  if (vbParts.length >= 4) {
    gridW = parseInt(vbParts[2], 10);
    gridH = parseInt(vbParts[3], 10);
  }

  if (!gridW || !gridH) {
    gridW = parseInt(svgEl.getAttribute('width') || '0', 10);
    gridH = parseInt(svgEl.getAttribute('height') || '0', 10);
  }
  if (!gridW || !gridH) throw new Error('Could not determine Data Matrix grid dimensions');

  const rects = Array.from(doc.querySelectorAll('rect'));
  const moduleRects = rects.filter((r) => {
    const w = parseFloat(r.getAttribute('width') || '0');
    const h = parseFloat(r.getAttribute('height') || '0');
    return w <= 2 && h <= 2 && w > 0 && h > 0;
  });

  const moduleSizes = moduleRects.map((r) => parseFloat(r.getAttribute('width') || '1'));
  const moduleSize =
    moduleSizes.length > 0 ? Math.round(Math.min(...moduleSizes) * 10) / 10 : 1;

  let minX = Infinity;
  let minY = Infinity;
  moduleRects.forEach((r) => {
    const fill = r.getAttribute('fill') || '';
    const isDark = fill === '#000000' || fill === 'black' || fill === '#000';
    if (isDark) {
      minX = Math.min(minX, parseFloat(r.getAttribute('x') || '0'));
      minY = Math.min(minY, parseFloat(r.getAttribute('y') || '0'));
    }
  });
  if (!isFinite(minX)) minX = 0;
  if (!isFinite(minY)) minY = 0;

  const cols = Math.round((gridW - minX) / moduleSize);
  const rows = Math.round((gridH - minY) / moduleSize);
  const matrix = Array.from({ length: rows }, () => new Array(cols).fill(0));

  moduleRects.forEach((r) => {
    const fill = r.getAttribute('fill') || '';
    const isDark = fill === '#000000' || fill === 'black' || fill === '#000';
    if (!isDark) return;
    const x = parseFloat(r.getAttribute('x') || '0');
    const y = parseFloat(r.getAttribute('y') || '0');
    const col = Math.round((x - minX) / moduleSize);
    const row = Math.round((y - minY) / moduleSize);
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      matrix[row][col] = 1;
    }
  });

  return matrix;
}
