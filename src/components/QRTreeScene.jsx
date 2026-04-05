import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls } from './CameraControls';
import { TreeBlocks } from './TreeBlocks';
import { ErrorBoundary } from './ErrorBoundary';

export function QRTreeScene({ matrix, preset, style = 'cherry', theme = 'cherry' }) {
  return (
    <ErrorBoundary>
      <Canvas
        shadows="basic"
        dpr={[1, 1.5]}
        camera={{ position: [40, 35, 40], fov: 45, near: 0.1, far: 500 }}
        style={{ background: '#ffffff' }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#ffffff', 1);
        }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight
          position={[25, 50, 25]}
          intensity={1.6}
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
        <directionalLight position={[-20, 30, -20]} intensity={0.6} />
        <hemisphereLight skyColor="#ffffff" groundColor="#e0e0e0" intensity={0.5} />

        <fog attach="fog" args={['#ffffff', 80, 250]} />

        <Suspense fallback={null}>
          {matrix && matrix.length > 0 && <TreeBlocks matrix={matrix} style={style} theme={theme} />}
        </Suspense>

        {/* Ground plane — light gray so it's visible against white bg */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#f0f0f0" roughness={1} />
        </mesh>

        <CameraControls preset={preset} />
      </Canvas>
    </ErrorBoundary>
  );
}
