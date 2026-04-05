import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Preset camera positions
export const CAMERA_PRESETS = {
  isometric: {
    position: new THREE.Vector3(30, 30, 30),
    target: new THREE.Vector3(0, 0, 0),
  },
  front: {
    // Top-down view (looking straight down = QR code visible)
    position: new THREE.Vector3(0, 60, 0.001),
    target: new THREE.Vector3(0, 0, 0),
  },
  side: {
    // Side view – see the tree silhouette
    position: new THREE.Vector3(60, 15, 0),
    target: new THREE.Vector3(0, 0, 0),
  },
};

/**
 * CameraControls
 * Wraps OrbitControls and provides smooth camera transitions to preset views.
 *
 * Props:
 *   preset: 'isometric' | 'front' | 'side'
 */
export function CameraControls({ preset = 'isometric' }) {
  const controlsRef = useRef();
  const { camera } = useThree();

  // Animation state
  const animRef = useRef({
    active: false,
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    t: 0,
    duration: 1.2,
  });

  // When preset changes, kick off a smooth transition
  useEffect(() => {
    const target = CAMERA_PRESETS[preset];
    if (!target || !controlsRef.current) return;

    const anim = animRef.current;
    anim.startPos.copy(camera.position);
    anim.startTarget.copy(controlsRef.current.target);
    anim.endPos.copy(target.position);
    anim.endTarget.copy(target.target);
    anim.t = 0;
    anim.active = true;
  }, [preset]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    const anim = animRef.current;
    if (!anim.active || !controlsRef.current) return;

    anim.t = Math.min(anim.t + delta / anim.duration, 1);
    // Ease-in-out cubic
    const ease = anim.t < 0.5
      ? 4 * anim.t * anim.t * anim.t
      : 1 - Math.pow(-2 * anim.t + 2, 3) / 2;

    camera.position.lerpVectors(anim.startPos, anim.endPos, ease);
    controlsRef.current.target.lerpVectors(anim.startTarget, anim.endTarget, ease);
    controlsRef.current.update();

    if (anim.t >= 1) anim.active = false;
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={5}
      maxDistance={120}
    />
  );
}
