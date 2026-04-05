import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { getBlockProps } from '../utils/treeHeightMap';

const BOX_WIDTH = 0.9;

// Color groups used to build separate InstancedMeshes
const COLOR_GROUPS = [
  { key: 'white',     color: '#f5f0e8' },
  { key: 'green',     color: '#3a7d44' },
  { key: 'brown',     color: '#8B4513' },
  { key: 'pink',      color: '#FF69B4' },
  { key: 'lightpink', color: '#FFB6C1' },
  { key: 'fringe',    color: '#FFD1E8' },
];

/** Round a colour hex string to the nearest colour-group key */
function colorToKey(color) {
  const map = {
    '#f5f0e8': 'white',
    '#3a7d44': 'green',
    '#8B4513': 'brown',
    '#FF69B4': 'pink',
    '#FFB6C1': 'lightpink',
    '#FFD1E8': 'fringe',
  };
  return map[color] ?? 'green';
}

/**
 * TreeBlocks
 * Renders the entire QR/DataMatrix grid as coloured 3-D boxes using
 * one InstancedMesh per colour group for good GPU performance.
 *
 * Props:
 *   matrix: number[][]   - binary 2-D array (1=dark, 0=light)
 */
export function TreeBlocks({ matrix }) {
  // Build per-group instance data
  const groups = useMemo(() => {
    if (!matrix || matrix.length === 0) return {};

    const size = matrix.length; // assume square
    const cx = (size - 1) / 2;
    const cz = (size - 1) / 2;

    // Collect instances per colour group
    const buckets = {};
    COLOR_GROUPS.forEach(({ key }) => { buckets[key] = []; });

    for (let row = 0; row < size; row++) {
      const rowData = matrix[row];
      for (let col = 0; col < (rowData?.length ?? 0); col++) {
        const isDark = rowData[col] === 1;
        const { yBase, height, color } = getBlockProps(row, col, size, isDark);
        const key = colorToKey(color);

        const x = col - cx;
        const z = row - cz;
        // y is the centre of the box: base + half height
        const y = yBase + height / 2;

        buckets[key].push({ x, y, z, height, color });
      }
    }
    return buckets;
  }, [matrix]);

  return (
    <>
      {COLOR_GROUPS.map(({ key, color }) => {
        const instances = groups[key] ?? [];
        if (instances.length === 0) return null;
        return (
          <ColorGroup
            key={key}
            color={color}
            instances={instances}
          />
        );
      })}
    </>
  );
}

/** Renders one InstancedMesh for a single colour group */
function ColorGroup({ color, instances }) {
  const meshRef = useRef();

  // Build geometries for each unique height
  // For simplicity, use one geometry per group with height = 1 and scale Y per instance
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
