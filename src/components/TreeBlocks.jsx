import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { getBlockProps } from '../utils/treeHeightMap';

const BOX_WIDTH = 0.9;

/**
 * TreeBlocks
 * Renders the entire QR/DataMatrix grid as coloured 3-D boxes using
 * one InstancedMesh per unique colour for good GPU performance.
 *
 * Props:
 *   matrix: number[][]   - binary 2-D array (1=dark, 0=light)
 *   style:  string       - tree style key (cherry | pine | oak | bonsai)
 *   theme:  string       - color theme key (cherry | autumn | winter | tropical | golden | neon)
 */
export function TreeBlocks({ matrix, style = 'cherry', theme = 'cherry' }) {
  const groups = useMemo(() => {
    if (!matrix || matrix.length === 0) return new Map();

    const size = matrix.length;
    const cx = (size - 1) / 2;
    const cz = (size - 1) / 2;

    // Collect instances per unique colour
    const buckets = new Map();

    for (let row = 0; row < size; row++) {
      const rowData = matrix[row];
      for (let col = 0; col < (rowData?.length ?? 0); col++) {
        const isDark = rowData[col] === 1;
        const { yBase, height, color } = getBlockProps(row, col, size, isDark, style, theme);

        const x = col - cx;
        const z = row - cz;
        const y = yBase + height / 2;

        if (!buckets.has(color)) buckets.set(color, []);
        buckets.get(color).push({ x, y, z, height });
      }
    }
    return buckets;
  }, [matrix, style, theme]);

  return (
    <>
      {[...groups.entries()].map(([color, instances]) => (
        <ColorGroup key={color} color={color} instances={instances} />
      ))}
    </>
  );
}

/** Renders one InstancedMesh for a single colour group */
function ColorGroup({ color, instances }) {
  const meshRef = useRef();

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    instances.forEach(({ x, y, z, height }, i) => {
      dummy.position.set(x, y, z);
      dummy.scale.set(1, height, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [instances]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, instances.length]}
      castShadow
      receiveShadow
    >
      {/* Width/depth = BOX_WIDTH, height = 1 (scaled per-instance via Y scale) */}
      <boxGeometry args={[BOX_WIDTH, 1, BOX_WIDTH]} />
      <meshStandardMaterial
        color={color}
        roughness={0.55}
        metalness={0.05}
      />
    </instancedMesh>
  );
}
