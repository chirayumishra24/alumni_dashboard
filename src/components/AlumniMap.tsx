/* eslint-disable */
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import type L from "leaflet";

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

interface AlumniMapProps {
  alumniData: Array<{
    user: { name: string };
    city: string;
    country: string;
    latitude?: number | null;
    longitude?: number | null;
    school: string;
  }>;
}

export default function AlumniMap({ alumniData }: AlumniMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.FeatureGroup | null>(null);
  const [markers, setMarkers] = useState<GlobeMarker[]>([]);
  const [hoveredMarker, setHoveredMarker] = useState<GlobeMarker | null>(null);

  // Group and count coordinates
  useEffect(() => {
    const cityGroups: Record<string, { city: string; country: string; lat: number; lng: number; count: number; names: string[] }> = {};

    alumniData.forEach((alum) => {
      let city = (alum.city || "Jaipur").trim();
      let country = (alum.country || "India").trim();

      const cityKey = city.toLowerCase();
      let coords = CITY_COORDS[cityKey];

      if (!coords) {
        if (alum.latitude && alum.longitude) {
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
            city,
            country,
            lat: coords.lat,
            lng: coords.lng,
            count: 0,
            names: [],
          };
        }
        cityGroups[groupKey].count++;
        cityGroups[groupKey].names.push(alum.user.name);
      }
    });

    const parsedMarkers: GlobeMarker[] = Object.values(cityGroups).map((g) => ({
      city: g.city,
      country: g.country,
      lat: g.lat,
      lng: g.lng,
      count: g.count,
      alumniNames: Array.from(new Set(g.names)),
    }));

    setMarkers(parsedMarkers);
  }, [alumniData]);

  // Initialize Map client-side
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let active = true;
    let L: any;

    const initMap = async () => {
      // Dynamic import to prevent SSR crashes
      L = await import("leaflet");
      
      // Load leaflet CSS dynamically in DOM if not present
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (!active || !mapContainerRef.current) return;

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Initialize map instance
      const map = L.map(mapContainerRef.current, {
        center: [20, 30], // Centered globally
        zoom: 2,
        zoomControl: false,
        attributionControl: false,
      });

      // CartoDB Positron: Sleek light-grey minimalist map style matching Next theme
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Add custom zoom control at bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.featureGroup().addTo(map);

      // Render pins once markers state is available and loaded
      updatePins(L);
    };

    initMap();

    return () => {
      active = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Pins when markers list changes
  useEffect(() => {
    if (mapInstanceRef.current && markers.length > 0) {
      import("leaflet").then((L) => {
        updatePins(L);
      });
    }
  }, [markers]);

  const updatePins = (L: any) => {
    const markersLayer = markersLayerRef.current;
    const mapInstance = mapInstanceRef.current;
    if (!markersLayer || !mapInstance) return;

    // Clear old pins
    markersLayer.clearLayers();

    markers.forEach((marker) => {
      // Create glowing HTML dot marker
      const isIndia = marker.country === "India";
      
      const customIcon = L.divIcon({
        className: "custom-leaflet-pin",
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-5 w-5 rounded-full ${isIndia ? 'bg-amber-400' : 'bg-maroon-400'} opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 ${isIndia ? 'bg-amber-500' : 'bg-maroon-600'} border border-white shadow-md"></span>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const pin = L.marker([marker.lat, marker.lng], { icon: customIcon });

      // Build popup description
      const alumniListHtml = marker.alumniNames
        .slice(0, 4)
        .map((name) => `<span class="inline-block px-1.5 py-0.5 m-0.5 text-[9px] bg-slate-100 text-slate-700 font-semibold rounded">${name}</span>`)
        .join("");

      const moreCount = marker.alumniNames.length > 4 ? ` <span class="text-[9px] text-slate-400 font-bold">+${marker.alumniNames.length - 4} more</span>` : "";

      const popupContent = `
        <div class="p-2 space-y-1.5 max-w-[200px] text-slate-800">
          <div class="flex items-center justify-between gap-3 border-b border-slate-100 pb-1">
            <h5 class="text-xs font-bold text-slate-900">${marker.city}, ${marker.country}</h5>
            <span class="bg-maroon-50 text-[#6b1d2f] text-[9px] font-extrabold px-1.5 py-0.5 rounded">${marker.count}</span>
          </div>
          <div class="text-[10px]">
            <span class="block font-black text-slate-450 uppercase text-[8px] mb-1">Spotlights:</span>
            <div class="flex flex-wrap">${alumniListHtml}${moreCount}</div>
          </div>
        </div>
      `;

      pin.bindPopup(popupContent, {
        closeButton: false,
        offset: [0, -5],
        className: "leaflet-premium-popup",
      });

      // Bind hover events
      pin.on("mouseover", function (e: any) {
        e.target.openPopup();
        setHoveredMarker(marker);
      });
      pin.on("mouseout", function () {
        setHoveredMarker(null);
      });

      markersLayer.addLayer(pin);
    });

    // Fit map view to pins with padding (except if only Jaipur exists)
    if (markers.length > 1) {
      mapInstance.fitBounds(markersLayer.getBounds(), {
        padding: [30, 30],
        maxZoom: 5,
      });
    }
  };

  return (
    <div className="relative w-full h-[380px] md:h-[480px] rounded-[3rem] overflow-hidden glass-panel border border-white/20 shadow-2xl select-none">
      {/* Leaflet container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Premium HUD Guide Overlay */}
      <div className="absolute top-6 left-8 space-y-1 pointer-events-none z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/10 border border-slate-900/10 text-[9px] font-bold text-maroon-700 uppercase tracking-widest backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Real-time Alumni Map
        </span>
        <h4 className="text-slate-900 font-serif text-lg font-bold">Interactive Connections Map</h4>
        <p className="text-slate-500 text-[10px]">Zoom and pan. Hover pins to explore regional placements.</p>
      </div>

      {/* Stats Counter HUD Overlay */}
      <div className="absolute bottom-6 left-8 pointer-events-none z-10 bg-white/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/40 shadow-xs flex items-center gap-3">
        <div className="text-left">
          <span className="block text-xl font-serif italic text-[#6b1d2f] font-black leading-none">{markers.length}</span>
          <span className="block text-[8px] font-black uppercase text-slate-500 tracking-widest mt-1">Cities Mapped</span>
        </div>
      </div>
    </div>
  );
}
