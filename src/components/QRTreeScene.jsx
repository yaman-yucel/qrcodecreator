import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls } from './CameraControls';
import { TreeBlocks } from './TreeBlocks';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * QRTreeScene
 * The main Three.js canvas.
 *
 * Props:
 *   matrix:  number[][]
 *   preset:  'isometric' | 'front' | 'side'
 */
export function QRTreeScene({ matrix, preset }) {
  return (
    <ErrorBoundary>
      <Canvas
        shadows="basic"
        dpr={[1, 1.5]}
        camera={{ position: [40, 35, 40], fov: 45, near: 0.1, far: 500 }}
        style={{ background: '#0f0f0f' }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0f0f0f', 1);
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[25, 50, 25]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={0.5}
          shadow-camera-far={200}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
        <directionalLight position={[-20, 30, -20]} intensity={0.5} />
        <hemisphereLight skyColor="#ffe0f0" groundColor="#1a1a2e" intensity={0.4} />

        {/* Fog for depth */}
        <fog attach="fog" args={['#0f0f0f', 60, 200]} />

        <Suspense fallback={null}>
          {matrix && matrix.length > 0 && <TreeBlocks matrix={matrix} />}
        </Suspense>

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#1a1a1a" roughness={1} />
        </mesh>

        <CameraControls preset={preset} />
      </Canvas>
    </ErrorBoundary>
  );
}
