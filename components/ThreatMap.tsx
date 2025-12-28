
import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  ZoomableGroup
} from 'react-simple-maps';
import { Plus, Minus, RotateCcw, Crosshair, Zap, ShieldAlert, Activity, Globe, Info, X } from 'lucide-react';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Sentinel Command Center (San Francisco)
const HQ_COORDS: [number, number] = [-122.4194, 37.7749];

interface VectorPoint {
  name: string;
  coordinates: [number, number];
  color: string;
  count: string;
  level: 'low' | 'moderate' | 'high';
  topType: string;
  blocked: string;
  recentIP: string;
}

const vectors: VectorPoint[] = [
  { name: "United States", coordinates: [-95.7129, 37.0902], color: "#3b82f6", count: "45.2k", level: 'moderate', topType: 'Botnet C2', blocked: '1.2k', recentIP: '192.168.4.12' },
  { name: "China", coordinates: [104.1954, 35.8617], color: "#ef4444", count: "12.4k", level: 'high', topType: 'SQL Injection', blocked: '8.4k', recentIP: '10.22.4.99' },
  { name: "Russia", coordinates: [105.3188, 61.5240], color: "#f59e0b", count: "8.1k", level: 'moderate', topType: 'Brute Force', blocked: '3.1k', recentIP: '91.22.84.1' },
  { name: "Brazil", coordinates: [-51.9253, -14.2350], color: "#10b981", count: "4.2k", level: 'low', topType: 'DDoS (ICMP)', blocked: '402', recentIP: '177.3.2.14' },
  { name: "United Kingdom", coordinates: [-3.4360, 55.3781], color: "#3b82f6", count: "2.1k", level: 'low', topType: 'Phishing', blocked: '89', recentIP: '82.1.2.45' },
  { name: "Germany", coordinates: [10.4515, 51.1657], color: "#3b82f6", count: "1.8k", level: 'low', topType: 'Malware Delivery', blocked: '56', recentIP: '2.12.3.9' },
  { name: "Singapore", coordinates: [103.8198, 1.3521], color: "#ef4444", count: "956", level: 'moderate', topType: 'Port Scan', blocked: '2.4k', recentIP: '111.9.22.3' },
  { name: "Australia", coordinates: [133.7751, -25.2744], color: "#10b981", count: "1.2k", level: 'low', topType: 'XSS Attempt', blocked: '12', recentIP: '1.1.2.3' },
];

const ThreatMap: React.FC = () => {
  const [position, setPosition] = useState({ coordinates: [0, 0] as [number, number], zoom: 1 });
  const [selectedPoint, setSelectedPoint] = useState<VectorPoint | null>(null);
  const [liveFeed, setLiveFeed] = useState<any[]>([]);

  // Simulation of live ingress feed
  useEffect(() => {
    const interval = setInterval(() => {
      const randomVector = vectors[Math.floor(Math.random() * vectors.length)];
      const newEntry = {
        id: Math.random(),
        country: randomVector.name,
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.x.x`,
        type: randomVector.topType,
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        level: randomVector.level
      };
      setLiveFeed(prev => [newEntry, ...prev].slice(0, 10));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
    setSelectedPoint(null);
  };

  return (
    <div className="w-full h-full min-h-[300px] relative bg-[#020617] rounded-xl overflow-hidden group/map border border-slate-800 shadow-2xl">
      <ComposableMap
        projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
        width={800}
        height={400}
        className="w-full h-full outline-none"
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={setPosition}
          maxZoom={10}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#0f172a"
                  stroke="#1e293b"
                  strokeWidth={0.5 / position.zoom}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#161e2f", outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Ingress Arcs */}
          {vectors.map((v, i) => (
            <Line
              key={`line-${i}`}
              from={v.coordinates}
              to={HQ_COORDS}
              stroke={v.level === 'high' ? '#ef4444' : v.level === 'moderate' ? '#f59e0b' : '#3b82f6'}
              strokeWidth={v.level === 'high' ? 0.8 / position.zoom : 0.4 / position.zoom}
              strokeDasharray="4,2"
              opacity={0.3}
            />
          ))}

          {/* Markers */}
          {vectors.map((v) => (
            <Marker 
              key={v.name} 
              coordinates={v.coordinates}
              onClick={() => setSelectedPoint(v)}
            >
              <circle 
                r={v.level === 'high' ? 5 / Math.sqrt(position.zoom) : 3.5 / Math.sqrt(position.zoom)} 
                fill={v.color} 
                className="cursor-pointer transition-transform hover:scale-150" 
              />
              <circle 
                r={12 / Math.sqrt(position.zoom)} 
                fill={v.color} 
                fillOpacity={0.15}
                className="animate-pulse-glow pointer-events-none" 
              />
            </Marker>
          ))}

          {/* HQ Marker */}
          <Marker coordinates={HQ_COORDS}>
            <rect x={-4 / position.zoom} y={-4 / position.zoom} width={8 / position.zoom} height={8 / position.zoom} fill="#3b82f6" rx={1} />
            <circle r={15 / Math.sqrt(position.zoom)} fill="#3b82f6" fillOpacity={0.1} className="animate-pulse" />
          </Marker>
        </ZoomableGroup>
      </ComposableMap>

      {/* TACTICAL OVERLAY: Header */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
          <Globe className="w-4 h-4 text-white" />
        </div>
        <div>
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Global Ingress Vectors</h4>
          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Surveillance Tier: Primary</p>
        </div>
      </div>

      {/* TACTICAL OVERLAY: Live Feed */}
      <div className="absolute top-16 left-4 w-48 hidden xl:block space-y-2 pointer-events-none select-none">
        {liveFeed.map((f, i) => (
          <div key={f.id} className="bg-slate-950/80 border border-slate-800 rounded px-2 py-1 flex justify-between items-center animate-in slide-in-from-left duration-500" style={{ opacity: 1 - (i * 0.1) }}>
            <div className="min-w-0">
               <div className="flex items-center gap-1.5">
                 <div className={`w-1 h-1 rounded-full ${f.level === 'high' ? 'bg-red-500' : 'bg-blue-500'}`} />
                 <span className="text-[9px] font-black text-slate-300 truncate">{f.ip}</span>
               </div>
               <span className="text-[7px] text-slate-600 uppercase font-bold">{f.country}</span>
            </div>
            <span className="text-[7px] text-slate-700 font-mono">{f.timestamp}</span>
          </div>
        ))}
      </div>

      {/* TACTICAL OVERLAY: Point Briefing */}
      {selectedPoint && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[320px] bg-slate-900/95 border border-slate-700 backdrop-blur-xl p-4 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
           <div className="flex justify-between items-start mb-4">
             <div className="flex items-center gap-3">
               <div className={`p-2 rounded-lg ${selectedPoint.level === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                 <ShieldAlert className="w-4 h-4" />
               </div>
               <div>
                 <h4 className="text-sm font-black text-white uppercase">{selectedPoint.name}</h4>
                 <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Regional Intel Cluster</p>
               </div>
             </div>
             <button onClick={() => setSelectedPoint(null)} className="text-slate-500 hover:text-white transition-colors">
               <X className="w-4 h-4" />
             </button>
           </div>
           
           <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[8px] text-slate-500 uppercase font-black block mb-1">Top Vector</span>
                <span className="text-[10px] text-slate-200 font-bold">{selectedPoint.topType}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[8px] text-slate-500 uppercase font-black block mb-1">Total Hits</span>
                <span className="text-[10px] text-slate-200 font-bold font-mono">{selectedPoint.count}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[8px] text-slate-500 uppercase font-black block mb-1">Blocked (24h)</span>
                <span className="text-[10px] text-emerald-400 font-bold font-mono">{selectedPoint.blocked}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[8px] text-slate-500 uppercase font-black block mb-1">Recent Origin</span>
                <span className="text-[10px] text-blue-400 font-bold font-mono">{selectedPoint.recentIP}</span>
              </div>
           </div>

           <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
             <Zap className="w-3 h-3" /> Initiate Regional Scrub
           </button>
        </div>
      )}

      {/* Tactical Zoom Controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover/map:opacity-100 transition-opacity duration-300">
        <button onClick={handleZoomIn} className="p-2 bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white rounded-lg backdrop-blur-md shadow-xl transition-all active:scale-90">
          <Plus className="w-4 h-4" />
        </button>
        <button onClick={handleZoomOut} className="p-2 bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white rounded-lg backdrop-blur-md shadow-xl transition-all active:scale-90">
          <Minus className="w-4 h-4" />
        </button>
        <div className="h-px bg-slate-800 mx-1 my-1" />
        <button onClick={handleReset} className="p-2 bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white rounded-lg backdrop-blur-md shadow-xl transition-all active:scale-90">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Legend Overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 p-2 bg-slate-950/60 backdrop-blur-sm rounded-lg border border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
          <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider">Hostile Incursion</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider">Anomalous Flow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-blue-500/50" />
          <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider">Command Node (HQ)</span>
        </div>
      </div>
    </div>
  );
};

export default ThreatMap;
