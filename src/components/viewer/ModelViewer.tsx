"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Center, Grid } from "@react-three/drei";
import * as THREE from "three";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  // Compute bounding box to auto-scale
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 2 / maxDim;

  return (
    <Center>
      <primitive object={scene} scale={scale} />
    </Center>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#8b5cf6" wireframe />
    </mesh>
  );
}

interface ModelViewerProps {
  modelUrl: string;
  wireframe?: boolean;
  showGrid?: boolean;
}

export default function ModelViewer({ modelUrl, wireframe = false, showGrid = true }: ModelViewerProps) {
  const controlsRef = useRef(null);

  return (
    <div className="w-full h-full min-h-[400px] bg-gray-950 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [3, 2, 3], fov: 50 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        <Suspense fallback={<LoadingFallback />}>
          {wireframe ? (
            <group>
              <Model url={modelUrl} />
            </group>
          ) : (
            <Model url={modelUrl} />
          )}
          <Environment preset="city" />
        </Suspense>

        {showGrid && (
          <Grid
            infiniteGrid
            cellSize={0.5}
            cellThickness={0.5}
            sectionSize={2}
            sectionThickness={1}
            fadeDistance={15}
            cellColor="#333"
            sectionColor="#555"
          />
        )}

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}
