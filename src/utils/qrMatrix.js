import QRCode from 'qrcode';

/**
 * Generates a 2-D binary matrix from a QR code.
 * 1 = dark module, 0 = light module.
 *
 * @param {string} text
 * @returns {Promise<number[][]>}
 */
export async function generateQRMatrix(text) {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const size = qr.modules.size;
  const data = qr.modules.data;
  const matrix = [];
  for (let row = 0; row < size; row++) {
    matrix.push([]);
    for (let col = 0; col < size; col++) {
      matrix[row].push(data[row * size + col] ? 1 : 0);
    }
  }
  return matrix;
}
