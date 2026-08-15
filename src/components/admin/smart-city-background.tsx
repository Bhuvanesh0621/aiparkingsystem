import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Grid, Float } from '@react-three/drei';
import * as THREE from 'three';

function Particles() {
  const ref = useRef<THREE.Points>(null!);
  const [sphere] = useState(() => {
    const positions = new Float32Array(3000);
    for (let i = 0; i < 3000; i += 3) {
      const radius = 25;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * radius;
      
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }
    return positions;
  });

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 15;
      ref.current.rotation.y -= delta / 20;
    }
  });

  return (
    <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00f0ff"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function HolographicRings() {
  const ringsRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (ringsRef.current) {
      const t = state.clock.getElapsedTime();
      ringsRef.current.rotation.x = Math.sin(t / 4) / 4;
      ringsRef.current.rotation.y = t / 3;
      ringsRef.current.position.y = Math.sin(t / 2) * 2;
    }
  });

  return (
    <group ref={ringsRef} position={[0, -5, -15]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[10, 0.05, 16, 100]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.2} wireframe blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={0.8}>
          <torusGeometry args={[10, 0.02, 16, 100]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.3} wireframe blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} scale={1.2}>
          <torusGeometry args={[10, 0.01, 16, 100]} />
          <meshBasicMaterial color="#00ff9d" transparent opacity={0.15} wireframe blending={THREE.AdditiveBlending} />
        </mesh>
      </Float>
    </group>
  );
}

function CameraRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  
  useFrame((state) => {
    if (group.current) {
      const targetX = (state.pointer.x * 2);
      const targetY = (state.pointer.y * 1);
      
      group.current.position.x += (targetX - group.current.position.x) * 0.05;
      group.current.position.y += (targetY - group.current.position.y) * 0.05;
    }
  });

  return <group ref={group}>{children}</group>;
}

export default function SmartCityBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none opacity-40 bg-[#050510]">
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={['#02020a']} />
        <fog attach="fog" args={['#02020a', 5, 40]} />
        <ambientLight intensity={0.5} />
        
        <CameraRig>
          <Particles />
          <HolographicRings />
          
          <Grid
            position={[0, -10, 0]}
            args={[100, 100]}
            cellSize={1}
            cellThickness={1}
            cellColor="#00f0ff"
            sectionSize={5}
            sectionThickness={1.5}
            sectionColor="#a855f7"
            fadeDistance={50}
            fadeStrength={1}
          />
        </CameraRig>
      </Canvas>
      
      {/* Soft overlay gradients for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#02020a] via-transparent to-[#02020a] opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#02020a] via-transparent to-[#02020a] opacity-50" />
    </div>
  );
}
