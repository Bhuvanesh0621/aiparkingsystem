import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Grid, Sparkles, Float, Points } from '@react-three/drei';
import * as THREE from 'three';

function MovingGrid() {
  const gridRef = useRef<any>(null);

  useFrame((state) => {
    if (gridRef.current) {
      // Move the grid infinitely towards the camera
      const time = state.clock.getElapsedTime();
      gridRef.current.position.z = (time * 2) % 2; 
    }
  });

  return (
    <group>
      <Grid 
        ref={gridRef}
        position={[0, -2, 0]} 
        args={[50, 50]} 
        cellSize={1} 
        cellThickness={1} 
        cellColor="#0284c7" // Tailwind sky-600
        sectionSize={5} 
        sectionThickness={1.5} 
        sectionColor="#38bdf8" // Tailwind sky-400
        fadeDistance={25} 
        fadeStrength={1} 
      />
    </group>
  );
}

function FloatingNodes() {
  const pointsRef = useRef<THREE.Points>(null!);

  const particlesCount = 200;
  const positions = useMemo(() => {
    const p = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      p[i * 3 + 0] = (Math.random() - 0.5) * 40; // x
      p[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
      p[i * 3 + 2] = (Math.random() - 0.5) * 20; // z
    }
    return p;
  }, [particlesCount]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
      pointsRef.current.rotation.x -= delta * 0.02;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <pointsMaterial 
        size={0.15} 
        color="#38bdf8" 
        transparent 
        opacity={0.8} 
        sizeAttenuation={true} 
      />
    </Points>
  );
}

export function CyberBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen" style={{ zIndex: 0 }}>
      <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
        <fog attach="fog" args={['#000', 5, 25]} />
        <ambientLight intensity={0.5} />
        
        <MovingGrid />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <FloatingNodes />
        </Float>
        
        {/* Subtle magical sparkles */}
        <Sparkles count={100} scale={20} size={2} speed={0.4} opacity={0.3} color="#e0f2fe" />
      </Canvas>
    </div>
  );
}
