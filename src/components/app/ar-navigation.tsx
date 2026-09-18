import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { X, Navigation2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 3D Animated Arrow pointing forward
function NavArrow({ position }: { position: [number, number, number] }) {
  const arrowRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (arrowRef.current) {
      // Bob up and down slightly
      arrowRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
  });

  return (
    <group ref={arrowRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      {/* The main arrow body */}
      <mesh castShadow>
        <cylinderGeometry args={[0, 0.5, 2, 4]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          emissive="#3b82f6" 
          emissiveIntensity={0.5} 
          transparent 
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

// 3D Destination Marker
function DestinationMarker({ slotNumber, position }: { slotNumber: string, position: [number, number, number] }) {
  const markerRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (markerRef.current) {
      // Spin slowly
      markerRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      markerRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group ref={markerRef} position={position}>
      <mesh position={[0, 1.5, 0]} castShadow rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.5, 1, 4]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>
      
      <Float speed={2} rotationIntensity={0} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.8}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {slotNumber}
        </Text>
      </Float>
    </group>
  );
}

interface ARNavigationProps {
  slotNumber: string;
  onClose: () => void;
}

export function ARNavigation({ slotNumber, onClose }: ARNavigationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [distance, setDistance] = useState(45);
  const [direction, setDirection] = useState("Straight ahead");

  useEffect(() => {
    // Request camera feed for Simulated AR
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setHasCamera(true);
        }
      })
      .catch((err) => {
        console.error("Camera access denied or unavailable", err);
      });

    // Simulate distance decreasing
    const interval = setInterval(() => {
      setDistance((prev) => {
        if (prev <= 2) {
          setDirection("You have arrived at your slot");
          return 0;
        }
        if (prev < 15) setDirection("Turn left at the next aisle");
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      // Cleanup camera stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 bg-black overflow-hidden flex flex-col w-full h-full">
      {/* Background Camera Feed */}
      <video 
        ref={videoRef} 
        className="absolute inset-0 w-full h-full object-cover z-0"
        playsInline 
        muted 
      />

      {/* If no camera, show a dark placeholder */}
      {!hasCamera && (
        <div className="absolute inset-0 w-full h-full z-0 bg-[#0a0a16] flex items-center justify-center text-white/50 px-8 text-center">
          Camera feed unavailable. Falling back to simulated 3D space.
        </div>
      )}

      {/* 3D AR Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={1} />
          
          {distance > 0 ? (
            <>
              {/* Path of arrows */}
              <NavArrow position={[0, -1, -2]} />
              <NavArrow position={[0, -1, -5]} />
              <NavArrow position={[0, -1, -8]} />
              
              {/* Destination marker far away */}
              <DestinationMarker slotNumber={slotNumber} position={[0, 0, -12]} />
            </>
          ) : (
            // Arrived
            <DestinationMarker slotNumber={slotNumber} position={[0, -0.5, -3]} />
          )}
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-20 flex flex-col h-full pointer-events-none p-6">
        {/* Header */}
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="font-semibold text-sm tracking-wider">LIVE AR</span>
          </div>
          <Button variant="ghost" size="icon" className="bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-white/20 border border-white/10" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* HUD Elements */}
        <div className="flex-1" />

        {/* Navigation Instructions */}
        <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl pointer-events-auto transform transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${distance === 0 ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
              {distance === 0 ? <MapPin className="h-6 w-6" /> : <Navigation2 className="h-6 w-6" />}
            </div>
            <div>
              <div className="text-white/60 text-sm mb-1 uppercase tracking-wider font-semibold">Navigating to Bay {slotNumber}</div>
              <div className="text-white font-bold text-xl">{direction}</div>
            </div>
          </div>
          
          <div className="flex justify-between items-end border-t border-white/10 pt-4">
            <div>
              <div className="text-3xl font-display font-bold text-white mb-1">
                {distance} <span className="text-lg text-white/50">meters</span>
              </div>
              <div className="text-sm text-white/50">Est. 1 min walk</div>
            </div>
            {distance === 0 && (
              <Button onClick={onClose} className="bg-green-500 hover:bg-green-600 text-white font-bold px-6">
                Finish Navigation
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
