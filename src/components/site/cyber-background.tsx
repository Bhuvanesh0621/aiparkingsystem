import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Grid, Sparkles, Float, Points } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '@/components/theme-provider';

function useIsDark() {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (theme === 'system') {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener('change', listener);
      return () => mql.removeEventListener('change', listener);
    } else {
      setIsDark(theme === 'dark');
    }
  }, [theme]);

  return isDark;
}

function MovingGrid({ isDark }: { isDark: boolean }) {
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
        cellColor={isDark ? '#0284c7' : '#bae6fd'} 
        sectionSize={5} 
        sectionThickness={1.5} 
        sectionColor={isDark ? '#38bdf8' : '#38bdf8'} 
        fadeDistance={25} 
        fadeStrength={1} 
      />
    </group>
  );
}

function FloatingNodes({ isDark }: { isDark: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const particlesCount = 200;
  const positions = useMemo(() => {
    const p = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      p[i * 3 + 0] = (Math.random() - 0.5) * 40; 
      p[i * 3 + 1] = (Math.random() - 0.5) * 20; 
      p[i * 3 + 2] = (Math.random() - 0.5) * 20; 
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
        color={isDark ? '#38bdf8' : '#0284c7'} 
        transparent 
        opacity={isDark ? 0.8 : 0.4} 
        sizeAttenuation={true} 
      />
    </Points>
  );
}

export function CyberBackground() {
  const isDark = useIsDark();
  
  return (
    <div className='absolute inset-0 pointer-events-none opacity-40 mix-blend-normal' style={{ zIndex: 0 }}>
      <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
        <fog attach='fog' args={[isDark ? '#000' : '#fff', 5, 25]} />
        <ambientLight intensity={0.5} />
        
        <MovingGrid isDark={isDark} />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <FloatingNodes isDark={isDark} />
        </Float>
        
        {/* Subtle magical sparkles */}
        <Sparkles count={100} scale={20} size={2} speed={0.4} opacity={isDark ? 0.3 : 0.6} color={isDark ? '#e0f2fe' : '#0284c7'} />
      </Canvas>
    </div>
  );
}