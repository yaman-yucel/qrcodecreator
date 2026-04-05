import { useEffect, useRef } from 'react';

/**
 * Renders a binary matrix (1=dark, 0=light) as a flat black-and-white
 * image onto a canvas — perfectly scannable, no perspective distortion.
 */
export function FlatCodeView({ matrix }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!matrix || matrix.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = matrix.length;
    const cols = matrix[0]?.length ?? size;
    const CELL = Math.max(4, Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.7 / size));
    const QUIET = CELL * 4; // quiet zone

    canvas.width  = cols * CELL + QUIET * 2;
    canvas.height = size * CELL + QUIET * 2;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < cols; col++) {
        ctx.fillStyle = matrix[row][col] ? '#000000' : '#ffffff';
        ctx.fillRect(
          QUIET + col * CELL,
          QUIET + row * CELL,
          CELL,
          CELL,
        );
      }
    }
  }, [matrix]);

  return (
    <div className="flex items-center justify-center w-full h-full bg-white">
      <canvas
        ref={canvasRef}
        style={{ imageRendering: 'pixelated', maxWidth: '90vmin', maxHeight: '90vmin' }}
      />
    </div>
  );
}
