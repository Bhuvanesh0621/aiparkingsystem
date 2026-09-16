import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, RoundedBox, Html, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/lib/store';

// Enhanced Vehicle Model supporting Car, SUV, and Bike
function VehicleModel({ type, isEV, position }: { type: string, isEV: boolean, position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null);
  const color = isEV ? '#10b981' : '#cbd5e1'; // Green for EV, Silver for normal
  
  // Slight hover/breathe animation for the vehicle
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.02;
    }
  });

  const isBike = type === 'bike';
  const isSUV = type === 'suv';

  // Base dimensions based on type
  const width = isBike ? 0.6 : isSUV ? 1.9 : 1.6;
  const length = isBike ? 2.2 : isSUV ? 4.5 : 3.8;
  const height = isBike ? 1.0 : isSUV ? 1.2 : 0.6;
  const yOffset = isBike ? 0.5 : 0.4;

  return (
    <group ref={group} position={position}>
      {/* Main Body */}
      <RoundedBox args={[width, height, length]} radius={0.1} smoothness={4} position={[0, yOffset, 0]} castShadow>
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </RoundedBox>
      
      {/* Roof / Top (if not a bike) */}
      {!isBike && (
        <RoundedBox args={[width - 0.2, height * 0.8, length * 0.5]} radius={0.1} smoothness={4} position={[0, yOffset + height * 0.7, -0.2]} castShadow>
          <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} />
        </RoundedBox>
      )}

      {/* Headlights */}
      {!isBike && (
        <>
          <mesh position={[-width/2 + 0.3, yOffset, length/2 + 0.01]}>
            <planeGeometry args={[0.3, 0.15]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[width/2 - 0.3, yOffset, length/2 + 0.01]}>
            <planeGeometry args={[0.3, 0.15]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Subtle light glow from headlights */}
          <pointLight position={[0, yOffset, length/2 + 0.5]} color="#ffffff" intensity={0.5} distance={3} />
        </>
      )}

      {/* Wheels */}
      {isBike ? (
        // Bike wheels (2 in line)
        [-length/2 + 0.4, length/2 - 0.4].map((z, i) => (
          <mesh key={`bike-wheel-${i}`} position={[0, 0.3, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.15, 16]} />
            <meshStandardMaterial color="#111" roughness={0.9} />
          </mesh>
        ))
      ) : (
        // Car/SUV wheels (4 corners)
        [-width/2 + 0.1, width/2 - 0.1].map((x, i) => 
          [-length/2 + 0.6, length/2 - 0.6].map((z, j) => (
            <mesh key={`wheel-${i}-${j}`} position={[x, 0.3, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.25, 16]} />
              <meshStandardMaterial color="#111" roughness={0.9} />
            </mesh>
          ))
        )
      )}
    </group>
  );
}

function EVCharger({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pedestal */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.4, 1, 0.3]} />
        <meshStandardMaterial color="#333" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Screen/Glow */}
      <mesh position={[0, 0.8, 0.16]}>
        <planeGeometry args={[0.2, 0.3]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      <pointLight position={[0, 0.8, 0.3]} color="#10b981" intensity={0.5} distance={2} />
    </group>
  );
}

function ParkingSlot3D({ slot, position }: { slot: any, position: [number, number, number] }) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const { bookings, users } = useStore();
  
  const isOccupied = slot.status === 'occupied' || slot.status === 'reserved';
  const isIncident = slot.status === 'maintenance'; 
  
  const baseColor = isIncident ? '#ef4444' : isOccupied ? '#3b82f6' : '#22c55e';

  // Find active booking for this slot
  const activeBooking = isOccupied ? bookings.find(b => b.slotNumber === slot.slotNumber && b.status === 'active') : null;
  const driver = activeBooking ? users.find(u => u.id === activeBooking.userId) : null;
  
  // Calculate time remaining if booking exists
  let timeRemaining = "";
  if (activeBooking) {
    const end = new Date(activeBooking.endTime).getTime();
    const now = new Date().getTime();
    const diff = Math.max(0, end - now);
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    timeRemaining = `${hrs}h ${mins}m left`;
  }

  return (
    <group position={position} 
           onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }} 
           onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
           onClick={(e) => { e.stopPropagation(); setClicked(!clicked); }}>
      
      {/* Slot Floor Markings */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.8, 5.5]} />
        <meshStandardMaterial color={hovered ? '#2a2a35' : '#1a1a24'} transparent opacity={0.8} />
      </mesh>
      
      {/* Slot Border Lines */}
      <mesh position={[-1.4, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.08, 5.5]} />
        <meshBasicMaterial color={baseColor} opacity={0.8} transparent />
      </mesh>
      <mesh position={[1.4, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.08, 5.5]} />
        <meshBasicMaterial color={baseColor} opacity={0.8} transparent />
      </mesh>
      <mesh position={[0, 0.02, -2.75]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.88, 0.08]} />
        <meshBasicMaterial color={baseColor} opacity={0.8} transparent />
      </mesh>

      {/* EV Charger Prop (placed at the back of the slot) */}
      {slot.isEV && <EVCharger position={[0, 0, -2.5]} />}

      {/* Slot Label */}
      <Text 
        position={[0, 0.02, 2.2]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        fontSize={0.5} 
        color={baseColor}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {slot.slotNumber}
      </Text>

      {/* The Vehicle (if occupied) */}
      {isOccupied && <VehicleModel type={slot.type || 'car'} isEV={slot.isEV} position={[0, 0, 0]} />}

      {/* Incident Alert Light */}
      {isIncident && (
        <pointLight position={[0, 2, 0]} color="#ef4444" intensity={8} distance={15} />
      )}

      {/* Tooltip on Hover or Click */}
      {(hovered || clicked) && (
        <Html position={[0, 2.5, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 text-white p-4 rounded-xl shadow-2xl w-64 pointer-events-none transform -translate-y-full transition-all duration-200 scale-100 origin-bottom">
            <div className="flex justify-between items-start mb-2">
              <div className="font-bold text-xl text-white">{slot.slotNumber}</div>
              <div className={`text-[10px] font-bold px-2 py-1 rounded ${isOccupied ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                {slot.status.toUpperCase()}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Floor</span>
                <span className="font-medium">{slot.floor}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Type</span>
                <span className="font-medium capitalize">{slot.type}</span>
              </div>
              {clicked && activeBooking && (
                <>
                  <div className="flex justify-between text-xs mt-2 pt-2 border-t border-white/10">
                    <span className="text-white/50">Driver</span>
                    <span className="font-medium">{driver?.name || "Guest"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Plate</span>
                    <span className="font-mono text-primary font-bold">{activeBooking.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Time</span>
                    <span className="font-medium text-amber-400">{timeRemaining}</span>
                  </div>
                </>
              )}
            </div>

            {slot.isEV && (
              <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-emerald-400 flex items-center justify-center gap-1 font-medium bg-emerald-500/10 rounded-md py-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                EV FAST CHARGER ACTIVE
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

function GateBarrier3D({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
  const { gateStatus } = useStore();
  const barrierRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (barrierRef.current) {
      // Rotate up 90 degrees (Math.PI / 2) when open
      const targetRotationZ = gateStatus === 'open' ? Math.PI / 2 : 0;
      barrierRef.current.rotation.z = THREE.MathUtils.lerp(barrierRef.current.rotation.z, targetRotationZ, 0.1);
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Base/Motor Box */}
      <mesh position={[-2, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial color="#eab308" metalness={0.4} roughness={0.6} />
      </mesh>
      
      {/* The moving barrier arm */}
      <group position={[-1.8, 0.8, 0]} ref={barrierRef}>
        <mesh position={[1.8, 0, 0]} castShadow>
          <boxGeometry args={[3.6, 0.15, 0.1]} />
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.8} />
        </mesh>
        {/* Red stripes */}
        {[0, 0.6, 1.2, 1.8, 2.4, 3.0].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.06]}>
            <planeGeometry args={[0.3, 0.16]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        ))}
      </group>
      
      {/* Status Light */}
      <mesh position={[-2, 1.05, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshBasicMaterial color={gateStatus === 'open' ? '#22c55e' : '#ef4444'} />
      </mesh>
      <pointLight position={[-2, 1.2, 0]} color={gateStatus === 'open' ? '#22c55e' : '#ef4444'} intensity={2} distance={5} />
    </group>
  );
}

export default function DigitalTwinDashboard() {
  const { slots } = useStore();
  const [activeFloor, setActiveFloor] = useState<number>(1);

  // Get unique floors
  const floors = useMemo(() => Array.from(new Set(slots.map(s => s.floor))).sort(), [slots]);
  
  // Filter slots by active floor
  const visibleSlots = useMemo(() => slots.filter(s => s.floor === activeFloor), [slots, activeFloor]);

  const slotNodes = useMemo(() => {
    return visibleSlots.map((slot, index) => {
      // Create a nice 2-row layout with an aisle in the middle
      const cols = Math.ceil(visibleSlots.length / 2);
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const x = (col - (cols / 2) + 0.5) * 3.5; // Spread out horizontally
      const z = row === 0 ? -4 : 4; // Top row and bottom row
      
      const rotY = row === 0 ? 0 : Math.PI; // Bottom row faces the aisle

      return (
        <group key={slot.id} rotation={[0, rotY, 0]}>
          <ParkingSlot3D slot={slot} position={[x, 0, z]} />
        </group>
      );
    });
  }, [visibleSlots]);

  return (
    <div className="w-full h-[650px] rounded-3xl overflow-hidden border border-white/10 relative bg-gradient-to-b from-[#05050a] to-[#0a0a16] shadow-2xl">
      {/* HUD UI overlay */}
      <div className="absolute top-6 left-6 z-10 pointer-events-auto">
        <h2 className="text-2xl font-display font-bold text-white mb-4 drop-shadow-lg">Live Digital Twin</h2>
        
        {/* Floor Selection */}
        <div className="flex gap-2 mb-6">
          {floors.map(f => (
            <button 
              key={f}
              onClick={() => setActiveFloor(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeFloor === f ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              Floor {f}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div><span className="text-xs text-white/80 font-medium tracking-wide">AVAILABLE</span></div>
          <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div><span className="text-xs text-white/80 font-medium tracking-wide">OCCUPIED</span></div>
          <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse"></div><span className="text-xs text-white/80 font-medium tracking-wide">INCIDENT ALERT</span></div>
        </div>
      </div>
      
      <div className="absolute bottom-6 right-6 z-10 pointer-events-none text-right">
        <div className="text-xs text-white/50 mb-1 tracking-widest font-mono">CAMERA CONTROLS</div>
        <div className="text-sm font-medium text-white/80 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-md">Scroll to Zoom • Drag to Orbit • Click Cars</div>
      </div>

      <Canvas shadows camera={{ position: [0, 18, 30], fov: 40 }}>
        <color attach="background" args={['#0a0a16']} />
        <fog attach="fog" args={['#0a0a16', 30, 80]} />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[15, 30, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} />
        <pointLight position={[-15, 10, -15]} intensity={0.5} color="#3b82f6" />
        <pointLight position={[15, 10, 15]} intensity={0.3} color="#10b981" />
        
        {/* Stylized dark glossy floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#0c0c14" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Dynamic Soft Shadows */}
        <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={50} blur={2} far={10} />
        
        {slotNodes}

        {/* Entry Gate Barrier */}
        <GateBarrier3D position={[0, 0, 12]} rotation={[0, 0, 0]} />

        <Environment preset="night" />
        
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          maxPolarAngle={Math.PI / 2 - 0.05} // Keep camera above ground
          minDistance={10}
          maxDistance={60}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
