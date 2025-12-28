
import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';
import { Plus, Minus, RotateCcw, Crosshair } from 'lucide-react';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const markers = [
  { name: "United States", coordinates: [-95.7129, 37.0902], color: "#3b82f6", count: "45.2k", level: 'moderate' },
  { name: "China", coordinates: [104.1954, 35.8617], color: "#ef4444", count: "12.4k", level: 'high' },
  { name: "Russia", coordinates: [105.3188, 61.5240], color: "#f59e0b", count: "8.1k", level: 'moderate' },
  { name: "Brazil", coordinates: [-51.9253, -14.2350], color: "#10b981", count: "4.2k", level: 'low' },
  { name: "United Kingdom", coordinates: [-3.4360, 55.3781], color: "#3b82f6", count: "2.1k", level: 'low' },
  { name: "Germany", coordinates: [10.4515, 51.1657], color: "#3b82f6", count: "1.8k", level: 'low' },
  { name: "Singapore", coordinates: [103.8198, 1.3521], color: "#ef4444", count: "956", level: 'moderate' },
  { name: "Australia", coordinates: [133.7751, -25.2744], color: "#10b981", count: "1.2k", level: 'low' },
];

const ThreatMap: React.FC = () => {
  const [position, setPosition] = useState({ coordinates: [0, 0] as [number, number], zoom: 1 });

  const handleZoomIn = () => {
    if (position.zoom >= 8) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleReset = () => {
    setPosition({ coordinates: [0, 0], zoom: 1 });
  };

  const handleMoveEnd = (newPosition: { coordinates: [number, number]; zoom: number }) => {
    setPosition(newPosition);
  };

  return (
    <div className="w-full h-full min-h-[300px] relative bg-slate-950/20 rounded-xl overflow-hidden group/map">
      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147
        }}
        width={800}
        height={400}
        className="w-full h-full outline-none"
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          maxZoom={10}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#111827"
                  stroke="#1f2937"
                  strokeWidth={0.5 / position.zoom}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#1e293b", outline: "none", transition: 'fill 0.2s' },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
          {markers.map(({ name, coordinates, color, count, level }) => (
            <Marker key={name} coordinates={coordinates as [number, number]}>
              <circle 
                r={4 / Math.sqrt(position.zoom)} 
                fill={color} 
                className="animate-pulse shadow-lg" 
              />
              <circle 
                r={10 / Math.sqrt(position.zoom)} 
                fill={color} 
                className="animate-pulse-glow" 
                fillOpacity={0.2} 
              />
              
              {position.zoom > 1.5 && (
                <g className="pointer-events-none">
                  <rect
                    x={6 / position.zoom}
                    y={-14 / position.zoom}
                    width={50 / Math.sqrt(position.zoom)}
                    height={12 / Math.sqrt(position.zoom)}
                    fill="#0f172a"
                    fillOpacity={0.8}
                    rx={2 / position.zoom}
                    className="backdrop-blur-sm"
                  />
                  <text
                    textAnchor="start"
                    x={10 / position.zoom}
                    y={-5 / position.zoom}
                    style={{
                      fontFamily: "JetBrains Mono",
                      fontSize: `${7 / Math.sqrt(position.zoom)}px`,
                      fontWeight: "bold",
                      fill: color,
                    }}
                  >
                    {name}
                  </text>
                </g>
              )}
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Crosshair className="w-3 h-3 text-blue-500" />
          Ingress Vectors
        </h4>
      </div>

      {/* Tactical Zoom Controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover/map:opacity-100 transition-opacity duration-300">
        <button 
          onClick={handleZoomIn}
          className="p-2 bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg backdrop-blur-md shadow-xl transition-all active:scale-90"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button 
          onClick={handleZoomOut}
          className="p-2 bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg backdrop-blur-md shadow-xl transition-all active:scale-90"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="h-px bg-slate-800 mx-1 my-1" />
        <button 
          onClick={handleReset}
          className="p-2 bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg backdrop-blur-md shadow-xl transition-all active:scale-90"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1 p-2 bg-slate-950/40 backdrop-blur-sm rounded-lg border border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
          <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider">Hostile Incursion</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider">Anomalous Flow</span>
        </div>
      </div>

      {/* Navigation Helper */}
      {position.zoom > 1 && (
        <div className="absolute bottom-4 right-4 bg-blue-600/10 border border-blue-500/20 px-2 py-1 rounded text-[8px] text-blue-400 font-bold uppercase tracking-widest animate-pulse">
          Drag to Pan
        </div>
      )}
    </div>
  );
};

export default ThreatMap;
