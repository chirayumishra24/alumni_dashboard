"use client";

import React, { useEffect, useRef, useState } from "react";
import { CITY_COORDS, type GlobeMarker } from "./AlumniGlobe";

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
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [markers, setMarkers] = useState<GlobeMarker[]>([]);
  const [hoveredMarker, setHoveredMarker] = useState<GlobeMarker | null>(null);

  // Group and count coordinates
  useEffect(() => {
    const cityGroups: Record<string, { marker: Omit<GlobeMarker, "alumniNames">; names: string[] }> = {};

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
    if (!markersLayerRef.current || !mapInstanceRef.current) return;

    // Clear old pins
    markersLayerRef.current.clearLayers();

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

      markersLayerRef.current.addLayer(pin);
    });

    // Fit map view to pins with padding (except if only Jaipur exists)
    if (markers.length > 1) {
      mapInstanceRef.current.fitBounds(markersLayerRef.current.getBounds(), {
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
