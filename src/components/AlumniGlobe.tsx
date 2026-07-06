/* eslint-disable */
"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

// ── City Coordinate Database ──────────────────────────────────────────────────

export interface GlobeMarker {
  city: string;
  country: string;
  lat: number;
  lng: number;
  count: number;
  alumniNames: string[];
}

export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "london": { lat: 51.5074, lng: -0.1278 },
  "new york": { lat: 40.7128, lng: -74.0060 },
  "seattle": { lat: 47.6062, lng: -122.3321 },
  "dubai": { lat: 25.2048, lng: 55.2708 },
  "stockholm": { lat: 59.3293, lng: 18.0686 },
  "sweden": { lat: 59.3293, lng: 18.0686 },
  "singapore": { lat: 1.3521, lng: 103.8198 },
  "los angeles": { lat: 34.0522, lng: -118.2437 },
  "ucla": { lat: 34.0522, lng: -118.2437 },
  "glasgow": { lat: 55.8642, lng: -4.2518 },
  "minnesota": { lat: 46.7296, lng: -94.6859 },
  // India Cities
  "jaipur": { lat: 26.9124, lng: 75.7873 },
  "mumbai": { lat: 19.0760, lng: 72.8777 },
  "new delhi": { lat: 28.6139, lng: 77.2090 },
  "delhi": { lat: 28.6139, lng: 77.2090 },
  "bangalore": { lat: 12.9716, lng: 77.5946 },
  "bengaluru": { lat: 12.9716, lng: 77.5946 },
  "hyderabad": { lat: 17.3850, lng: 78.4867 },
  "pune": { lat: 18.5204, lng: 73.8567 },
  "jodhpur": { lat: 26.2389, lng: 73.0243 },
  "kanpur": { lat: 26.4499, lng: 80.3319 },
  "kharagpur": { lat: 22.3460, lng: 87.2320 },
  "roorkee": { lat: 29.8543, lng: 77.8880 },
  "mandi": { lat: 31.7087, lng: 76.9320 },
};

// Convert lat/lng to 3D Cartesian coordinates on a sphere of radius R
function convertLatLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.sin(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.cos(theta);

  return new THREE.Vector3(x, y, z);
}

// ── Sub-Components ───────────────────────────────────────────────────────────

interface GlobeSphereProps {
  onHoverMarker: (marker: GlobeMarker | null, event?: React.MouseEvent) => void;
  markers: GlobeMarker[];
}

function GlobeSphere({ onHoverMarker, markers }: GlobeSphereProps) {
  const sphereRef = useRef<THREE.Group>(null);
  const radius = 2.5;

  // Auto-rotate the globe slowly
  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.0015;
    }
  });

  return (
    <group ref={sphereRef}>
      {/* Ocean Sphere */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshPhongMaterial
          color="#001830"
          emissive="#000818"
          specular="#ffffff"
          shininess={15}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Grid Wireframe (Gives a futuristic, high-tech vibe) */}
      <mesh>
        <sphereGeometry args={[radius + 0.01, 32, 32]} />
        <meshBasicMaterial
          color="#6b1d2f"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Glow Atmosphere Rim */}
      <mesh>
        <sphereGeometry args={[radius + 0.05, 32, 32]} />
        <meshBasicMaterial
          color="#d4af37"
          wireframe
          transparent
          opacity={0.03}
        />
      </mesh>

      {/* Markers */}
      {markers.map((marker, idx) => {
        const position = convertLatLngToVector3(marker.lat, marker.lng, radius);
        return (
          <group key={idx} position={position}>
            {/* Pulsing ring indicator */}
            <mesh>
              <ringGeometry args={[0.03, 0.07, 16]} />
              <meshBasicMaterial
                color={marker.country === "India" ? "#d4af37" : "#ff455f"}
                side={THREE.DoubleSide}
                transparent
                opacity={0.8}
              />
            </mesh>

            {/* Glowing Center Pin */}
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
                onHoverMarker(marker);
              }}
              onPointerOut={(e) => {
                document.body.style.cursor = "default";
                onHoverMarker(null);
              }}
            >
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshBasicMaterial
                color={marker.country === "India" ? "#ffffff" : "#ff8093"}
              />
            </mesh>

            {/* Light beam shooting upwards from marker */}
            <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.005, 0.02, 0.5, 8]} />
              <meshBasicMaterial
                color={marker.country === "India" ? "#d4af37" : "#ff455f"}
                transparent
                opacity={0.4}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ── Main AlumniGlobe Component ───────────────────────────────────────────────

interface AlumniGlobeProps {
  alumniData: Array<{
    user: { name: string };
    city: string;
    country: string;
    latitude?: number | null;
    longitude?: number | null;
    school: string;
  }>;
}

export default function AlumniGlobe({ alumniData }: AlumniGlobeProps) {
  const [hoveredMarker, setHoveredMarker] = useState<GlobeMarker | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [markers, setMarkers] = useState<GlobeMarker[]>([]);

  // Parse and aggregate alumni by city/country
  useEffect(() => {
    const cityGroups: Record<string, { marker: Omit<GlobeMarker, "alumniNames">; names: string[] }> = {};

    alumniData.forEach((alum) => {
      let city = (alum.city || "Jaipur").trim();
      let country = (alum.country || "India").trim();

      const cityKey = city.toLowerCase();
      let coords = CITY_COORDS[cityKey];

      // Safe coordinate fallback
      if (!coords) {
        if (alum.latitude && alum.longitude) {
          coords = { lat: alum.latitude, latLngCheck: true } as any; // temporary placeholder
          coords = { lat: alum.latitude, lng: alum.longitude };
        } else {
          // Default fallback to Jaipur
          coords = CITY_COORDS["jaipur"];
          city = "Jaipur";
          country = "India";
        }
      }

      if (coords) {
        const groupKey = `${cityKey}__${country.toLowerCase()}`;
        if (!cityGroups[groupKey]) {
          cityGroups[groupKey] = {
            marker: {
              city,
              country,
              lat: coords.lat,
              lng: coords.lng,
              count: 0,
            } as any,
            names: [],
          };
        }
        cityGroups[groupKey].marker.count++;
        cityGroups[groupKey].names.push(alum.user.name);
      }
    });

    const parsedMarkers: GlobeMarker[] = Object.values(cityGroups).map((g) => ({
      ...g.marker,
      alumniNames: Array.from(new Set(g.names)),
    }));

    setMarkers(parsedMarkers);
  }, [alumniData]);

  // Track mouse coordinates for tooltip positioning
  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPos({
      x: e.clientX + 15,
      y: e.clientY + 15,
    });
  };

  return (
    <div 
      className="relative w-full h-[380px] md:h-[480px] rounded-[3rem] overflow-hidden glass-panel border border-white/20 select-none cursor-grab active:cursor-grabbing shadow-2xl"
      onMouseMove={handleMouseMove}
    >
      {/* Background stars */}
      <div className="absolute inset-0 bg-[#000818]" />

      {/* Floating Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        
        <GlobeSphere 
          markers={markers}
          onHoverMarker={(marker) => setHoveredMarker(marker)} 
        />
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          minDistance={3.5}
          maxDistance={8}
          rotateSpeed={0.8}
        />
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0.5} fade speed={1} />
      </Canvas>

      {/* High-tech overlay guides */}
      <div className="absolute top-6 left-8 space-y-1 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-amber-300 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Real-time Alumni Map
        </span>
        <h4 className="text-white font-serif text-lg font-bold">Interactive 3D Connections</h4>
        <p className="text-slate-400 text-[10px]">Drag to rotate the globe. Hover markers to view regional spotlights.</p>
      </div>

      {/* Glowing Info HUD (Bottom Right) */}
      <div className="absolute bottom-6 right-8 text-right pointer-events-none">
        <span className="block text-2xl font-serif italic text-white font-black">{markers.length}</span>
        <span className="block text-[8px] font-black uppercase text-slate-400 tracking-widest">Global Cities Mapped</span>
      </div>

      {/* Tooltip Hover Box */}
      {hoveredMarker && (
        <div 
          className="fixed z-50 pointer-events-none rounded-2xl glass-panel p-4 shadow-xl border border-white/30 backdrop-blur-md max-w-xs space-y-2 animate-fade-in"
          style={{ 
            left: tooltipPos.x, 
            top: tooltipPos.y,
            backgroundColor: "rgba(10, 25, 47, 0.85)"
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-serif font-black text-amber-300">
              {hoveredMarker.city}, {hoveredMarker.country}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-extrabold text-white uppercase tracking-wider">
              {hoveredMarker.count} {hoveredMarker.count === 1 ? 'Alumnus' : 'Alumni'}
            </span>
          </div>

          <div className="border-t border-white/10 pt-2 space-y-1">
            <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">Spotlights:</span>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
              {hoveredMarker.alumniNames.slice(0, 6).map((name, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] text-white font-medium">
                  {name}
                </span>
              ))}
              {hoveredMarker.alumniNames.length > 6 && (
                <span className="text-[9px] text-slate-400 font-bold ml-1">
                  +{hoveredMarker.alumniNames.length - 6} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
