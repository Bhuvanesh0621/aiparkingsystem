import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, RoundedBox, Html, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/lib/store';

function CarModel({ position, color }: { position: [number, number, number], color: string }) {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05;
    }
  });

  return (
    <group ref={group} position={position}>
      <RoundedBox args={[1.6, 0.6, 3.8]} radius={0.1} smoothness={4} position={[0, 0.4, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      <RoundedBox args={[1.4, 0.5, 2]} radius={0.1} smoothness={4} position={[0, 0.9, -0.2]} castShadow>
        <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} />
      </RoundedBox>
      {[-0.8, 0.8].map((x, i) => 
        [-1.2, 1.2].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 0.3, z]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        ))
      )}
    </group>
  );
}

function ParkingSlot3D({ slot, position }: { slot: any, position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);
  const isOccupied = slot.status === 'occupied' || slot.status === 'reserved';
  const isIncident = slot.status === 'maintenance'; 
  
  const baseColor = isIncident ? '#ef4444' : isOccupied ? '#3b82f6' : '#22c55e';

  return (
    <group position={position} 
           onPointerOver={() => setHovered(true)} 
           onPointerOut={() => setHovered(false)}>
      
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.5, 5]} />
        <meshStandardMaterial color={hovered ? '#333' : '#1a1a24'} transparent opacity={0.8} />
      </mesh>
      
      <mesh position={[-1.25, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.05, 5]} />
        <meshBasicMaterial color={baseColor} opacity={0.6} transparent />
      </mesh>
      <mesh position={[1.25, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.05, 5]} />
        <meshBasicMaterial color={baseColor} opacity={0.6} transparent />
      </mesh>

      <Text 
        position={[0, 0.02, 2.2]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        fontSize={0.4} 
        color={baseColor}
        anchorX="center"
        anchorY="middle"
      >
        {slot.slotNumber}
      </Text>

      {isOccupied && <CarModel position={[0, 0, 0]} color={slot.isEV ? '#10b981' : '#f8fafc'} />}

      {isIncident && (
        <pointLight position={[0, 2, 0]} color="#ef4444" intensity={5} distance={10} />
      )}

      {hovered && (
        <Html position={[0, 2, 0]} center>
          <div className="bg-black/80 backdrop-blur-md border border-white/20 text-white p-3 rounded-xl shadow-2xl w-48 pointer-events-none transform -translate-y-full">
            <div className="font-bold text-lg mb-1">{slot.slotNumber}</div>
            <div className="text-xs text-white/70 mb-2">{slot.location} • {slot.type.toUpperCase()}</div>
            <div className={`text-xs font-semibold px-2 py-1 rounded inline-block ${isOccupied ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"}`}>
              {slot.status.toUpperCase()}
            </div>
            {slot.isEV && <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1">⚡ EV Charger Available</div>}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function DigitalTwinDashboard() {
  const { slots } = useStore();

  const slotNodes = useMemo(() => {
    return slots.map((slot, index) => {
      const col = index % 10;
      const row = Math.floor(index / 10);
      
      const x = (col - 4.5) * 2.8; 
      const z = (row - (slots.length / 20)) * 6.5 + (row % 2 === 0 ? -1 : 1);
      
      const rotY = row % 2 === 0 ? 0 : Math.PI;

      return (
        <group key={slot.id} rotation={[0, rotY, 0]}>
          <ParkingSlot3D slot={slot} position={[x, 0, z]} />
        </group>
      );
    });
  }, [slots]);

  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-white/10 relative bg-[#05050a] shadow-2xl">
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-display font-bold text-white mb-2">Live 3D Digital Twin</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-xs text-white/70 font-medium">Available</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-xs text-white/70 font-medium">Occupied</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-xs text-white/70 font-medium">Incident</span></div>
        </div>
      </div>
      
      <div className="absolute bottom-6 right-6 z-10 pointer-events-none text-right">
        <div className="text-xs text-white/50 mb-1">CAMERA CONTROLS</div>
        <div className="text-sm font-medium text-white/80">Scroll to Zoom • Drag to Rotate</div>
      </div>

      <Canvas shadows camera={{ position: [0, 15, 25], fov: 45 }}>
        <color attach="background" args={['#05050a']} />
        <fog attach="fog" args={['#05050a', 20, 60]} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 5]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#111118" roughness={0.8} />
        </mesh>
        
        {slotNodes}

        <Environment preset="city" />
        
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          maxPolarAngle={Math.PI / 2 - 0.1}
          minDistance={10}
          maxDistance={50}
        />
      </Canvas>
    </div>
  );
}
