"use client";
import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

interface GlobeMarker {
  lat: number;
  lng: number;
  label: string;
  color?: string;
  size?: number;
}

function latLngToVector3(lat: number, lng: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

function WireframeGlobe({ radius = 2 }: { radius?: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshBasicMaterial
        color="#00FFFF"
        wireframe
        transparent
        opacity={0.15}
      />
      {/* Solid inner sphere */}
      <mesh>
        <sphereGeometry args={[radius * 0.98, 32, 32]} />
        <meshBasicMaterial
          color="#06070A"
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.05, 32, 32]} />
        <meshBasicMaterial
          color="#00FFFF"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </mesh>
    </mesh>
  );
}

function GlobeMarkerComponent({
  marker,
  radius,
  onClick,
}: {
  marker: GlobeMarker;
  radius: number;
  onClick?: (marker: GlobeMarker) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const pos = useMemo(() => latLngToVector3(marker.lat, marker.lng, radius * 1.02), [marker, radius]);
  const color = marker.color || "#FF3333";

  return (
    <group position={pos}>
      <mesh
        onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerLeave={() => { setHovered(false); document.body.style.cursor = "auto"; }}
        onClick={(e) => { e.stopPropagation(); onClick?.(marker); }}
      >
        <sphereGeometry args={[marker.size || 0.06, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Pulse ring */}
      <mesh>
        <ringGeometry args={[marker.size ? marker.size * 1.5 : 0.09, marker.size ? marker.size * 2 : 0.12, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.6 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      {hovered && (
        <Html distanceFactor={6} style={{ pointerEvents: "none" }}>
          <div className="px-2 py-1 rounded bg-gray-900/95 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 whitespace-nowrap shadow-xl backdrop-blur-md">
            {marker.label}
          </div>
        </Html>
      )}
    </group>
  );
}

function GlobeScene({
  markers,
  radius,
  onMarkerClick,
}: {
  markers: GlobeMarker[];
  radius: number;
  onMarkerClick?: (marker: GlobeMarker) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <WireframeGlobe radius={radius} />
      {markers.map((marker, i) => (
        <GlobeMarkerComponent
          key={i}
          marker={marker}
          radius={radius}
          onClick={onMarkerClick}
        />
      ))}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(3 * Math.PI) / 4}
      />
    </>
  );
}

export const Globe3D = ({
  markers = [],
  radius = 2,
  className,
  onMarkerClick,
}: {
  markers?: GlobeMarker[];
  radius?: number;
  className?: string;
  onMarkerClick?: (marker: GlobeMarker) => void;
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className={`relative ${className ?? ""}`}>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <GlobeScene markers={markers} radius={radius} onMarkerClick={onMarkerClick} />
      </Canvas>
    </div>
  );
};
