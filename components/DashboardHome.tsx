
import React, { useState, useEffect, useRef } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Line, LineChart, Area, ComposedChart
} from 'recharts';
import { 
  Shield, 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  Map as MapIcon,
  Cpu,
  Activity,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { DashboardStats, AnomalyEvent } from '../types';
import ThreatMap from './ThreatMap';

// High-density data generator for the NOC telemetry look
const generateHighDensityData = () => {
  const points = 45;
  return Array.from({ length: points }).map((_, i) => ({
    time: `${i}:00`,
    global: 400 + Math.random() * 200 + (i % 15 === 0 ? 200 : 0),
    malicious: 200 + Math.random() * 100,
    actors: 120 + Math.random() * 80,
    exploits: 80 + Math.random() * 60,
    c2: 40 + Math.random() * 40,
    exfil: 10 + Math.random() * 20,
  }));
};

const MINI_TREND = [{v:10}, {v:15}, {v:12}, {v:20}, {v:18}, {v:25}];

interface DashboardHomeProps {
  stats: DashboardStats;
  onNewScan: () => void;
  isScanning: boolean;
  onExportReport: (format: string) => void;
  isExporting: boolean;
  onNavigate: (tab: string) => void;
  anomalies: AnomalyEvent[];
  onAlertClick: (id: string) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ 
  stats, 
  onNavigate,
  anomalies,
  onAlertClick 
}) => {
  const [evolutionData, setEvolutionData] = useState(generateHighDensityData());
  const [liveMetrics, setLiveMetrics] = useState({ ingress: 14.8, drop: 0.02 });
  const [displayStats, setDisplayStats] = useState<DashboardStats>(stats);

  // Synchronize displayStats with incoming props when they change significantly (e.g., after a scan)
  useEffect(() => {
    setDisplayStats(prev => ({
      ...stats,
      // Keep the "noise" we might have added, but ensure we don't fall behind the truth
      totalIoCs: Math.max(prev.totalIoCs, stats.totalIoCs),
      activeThreats: stats.activeThreats,
      activeFeeds: stats.activeFeeds,
      alerts24h: Math.max(prev.alerts24h, stats.alerts24h)
    }));
  }, [stats]);

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Update NOC Telemetry Chart
      setEvolutionData(prev => {
        if (!prev.length) return generateHighDensityData();
        const newData = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        newData.push({
          time: 'Now',
          global: Math.max(300, last.global + (Math.random() * 60 - 30)),
          malicious: Math.max(150, last.malicious + (Math.random() * 30 - 15)),
          actors: Math.max(100, last.actors + (Math.random() * 20 - 10)),
          exploits: Math.max(60, last.exploits + (Math.random() * 15 - 7)),
          c2: Math.max(30, last.c2 + (Math.random() * 10 - 5)),
          exfil: Math.max(5, last.exfil + (Math.random() * 8 - 4)),
        });
        return newData;
      });

      // 2. Update Ingress/Drop Metrics
      setLiveMetrics({
        ingress: +(14.5 + Math.random() * 0.8).toFixed(1),
        drop: +(0.01 + Math.random() * 0.02).toFixed(3)
      });

      // 3. Fluctuated Primary Stats for "Live" effect
      setDisplayStats(prev => ({
        ...prev,
        totalIoCs: prev.totalIoCs + (Math.random() > 0.4 ? Math.floor(Math.random() * 3) : 0),
        activeThreats: prev.activeThreats + (Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0),
        alerts24h: prev.alerts24h + (Math.random() > 0.92 ? 1 : 0)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard 
          title="Total Indicators" 
          value={displayStats.totalIoCs.toLocaleString()} 
          change="+12%" 
          icon={<Shield className="w-5 h-5 text-blue-400" />} 
        />
        <StatCard 
          title="Active Adversaries" 
          value={displayStats.activeThreats.toLocaleString()} 
          change="-4%" 
          negative 
          icon={<AlertTriangle className="w-5 h-5 text-red-400" />} 
        />
        <StatCard 
          title="Intelligence Feeds" 
          value={displayStats.activeFeeds.toString()} 
          change="Optimal" 
          icon={<Zap className="w-5 h-5 text-yellow-400" />} 
        />
        <StatCard 
          title="Daily Alerts" 
          value={displayStats.alerts24h.toString()} 
          change="+18%" 
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main NOC Telemetry Canvas */}
        <div className="lg:col-span-3 bg-[#020617] border border-slate-800 rounded-2xl p-6 flex flex-col min-h-[600px] shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
          
          {/* Header Hardware Monitor */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_8px_#8b5cf6]" />
                <h3 className="font-black text-white text-xs uppercase tracking-[0.2em]">Strategic Intelligence Evolution</h3>
              </div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Multi-Vector NOC Telemetry Feed</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg shadow-inner">
                <span className="text-[9px] text-slate-500 font-black uppercase block mb-1">Ingress Rate</span>
                <span className="text-sm font-mono font-black text-emerald-400">{liveMetrics.ingress} <span className="text-[9px] opacity-40">GB/s</span></span>
              </div>
              <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg shadow-inner">
                <span className="text-[9px] text-slate-500 font-black uppercase block mb-1">Packet Drop</span>
                <span className="text-sm font-mono font-black text-red-400">{liveMetrics.drop}%</span>
              </div>
            </div>
          </div>
          
          {/* Chart and Side Legend Wrapper */}
          <div className="flex-1 flex flex-col md:flex-row gap-6 relative z-10">
            {/* The Main Chart Area - Ensuring stable container for ResponsiveContainer */}
            <div className="flex-1 h-[400px] w-full block">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.1} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={[0, 1000]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                  />
                  <Line type="monotone" dataKey="global" stroke="#8b5cf6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="malicious" stroke="#ef4444" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="actors" stroke="#10b981" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="exploits" stroke="#ec4899" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="c2" stroke="#3b82f6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="exfil" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Right-Side Signal Density Legend */}
            <div className="w-full md:w-64 space-y-2 shrink-0">
              <div className="pb-2 mb-2 border-b border-slate-800">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 className="w-3 h-3" />
                  Signal Density
                </span>
              </div>
              <SideLegendItem color="bg-purple-500" label="Global Volume" value="842.1k" />
              <SideLegendItem color="bg-red-500" label="Malicious" value="124.5k" />
              <SideLegendItem color="bg-emerald-500" label="Known Actors" value="42.8k" />
              <SideLegendItem color="bg-pink-500" label="Exploits" value="18.2k" />
              <SideLegendItem color="bg-blue-500" label="C2 Beacons" value="4.1k" />
              <SideLegendItem color="bg-orange-500" label="Exfiltration" value="0.4k" />
            </div>
          </div>
        </div>

        {/* Tactical Overview Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex-1">
            <h3 className="font-bold text-white uppercase tracking-wider text-[10px] mb-6 flex items-center gap-2">
              <Cpu className="w-3 h-3 text-blue-500" />
              Node Health Matrix
            </h3>
            <div className="space-y-4">
              <StatusWidget label="Mesh-Alpha" value="99.9%" color="emerald" />
              <StatusWidget label="Mesh-Beta" value="94.2%" color="blue" />
              <StatusWidget label="Mesh-Gamma" value="88.0%" color="orange" />
              <StatusWidget label="AI-Synthesizer" value="Active" color="emerald" />
            </div>
            <button 
              onClick={() => onNavigate('anomalies')}
              className="mt-8 w-full py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase rounded-xl border border-blue-500/20 transition-all tracking-[0.2em]"
            >
              System Console
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
             <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-orange-500/10 rounded-lg">
                 <AlertTriangle className="w-4 h-4 text-orange-500" />
               </div>
               <h4 className="text-[11px] font-bold text-white uppercase">Critical Alert</h4>
             </div>
             <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
               Detected <span className="text-white font-bold">correlated exfiltration surge</span> matching FIN7 infrastructure patterns.
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white flex items-center gap-2 uppercase tracking-wider text-xs">
              <MapIcon className="w-4 h-4 text-blue-500" />
              Ingress Vector Map
            </h3>
            <span className="text-[9px] text-emerald-400 font-black uppercase animate-pulse">Live Tracking</span>
          </div>
          <div className="h-[300px] bg-slate-950/40 rounded-xl border border-slate-800/50 overflow-hidden relative">
            <ThreatMap />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col shadow-xl h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white flex items-center gap-2 uppercase tracking-wider text-xs">
              <Zap className="w-4 h-4 text-orange-500" />
              Incident Signal Stream
            </h3>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{anomalies.length} Signals</span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
            {anomalies.map((alert) => (
              <div 
                key={alert.id} 
                onClick={() => onAlertClick(alert.id)}
                className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-blue-500/30 transition-all flex items-center gap-4 group cursor-pointer"
              >
                <div className={`w-1 h-10 rounded-full ${alert.score > 0.9 ? 'bg-red-500' : 'bg-blue-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-bold text-white truncate uppercase">{alert.source}</h4>
                    <span className="text-[9px] text-slate-500 font-mono">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{alert.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-blue-500 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Subcomponents ---

const SideLegendItem: React.FC<{ color: string; label: string; value: string }> = ({ color, label, value }) => (
  <div className="flex items-center justify-between p-2 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-700 transition-all group">
    <div className="flex items-center gap-2 min-w-0">
      <div className={`w-1.5 h-6 rounded-full ${color} opacity-80 group-hover:opacity-100 transition-opacity`} />
      <div className="flex flex-col min-w-0">
        <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1 truncate">{label}</span>
        <span className="text-xs font-black text-white font-mono leading-none">{value}</span>
      </div>
    </div>
    <div className="w-12 h-6 opacity-40 shrink-0">
       <ResponsiveContainer width="100%" height="100%">
         <LineChart data={MINI_TREND}>
           <Line 
             type="monotone" 
             dataKey="v" 
             stroke="#3b82f6" 
             strokeWidth={1} 
             dot={false} 
             isAnimationActive={false}
           />
         </LineChart>
       </ResponsiveContainer>
    </div>
  </div>
);

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  change: string; 
  icon: React.ReactNode; 
  negative?: boolean; 
}> = ({ title, value, change, icon, negative }) => {
  const [ping, setPing] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      setPing(true);
      const timer = setTimeout(() => setPing(false), 800);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div className={`bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm transition-all duration-300 group ${ping ? 'border-blue-500/40 bg-slate-800/50' : 'hover:border-slate-700'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 bg-slate-800 rounded-xl border border-slate-700 group-hover:bg-slate-700 transition-colors ${ping ? 'border-blue-400' : ''}`}>
          {icon}
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-[10px] font-black uppercase tracking-tighter ${negative ? 'text-red-400' : 'text-emerald-400'}`}>{change}</span>
          {ping && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping mt-1" />}
        </div>
      </div>
      <div>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{title}</p>
        <h4 className={`text-2xl font-black font-mono transition-all duration-500 ${ping ? 'text-blue-400 scale-[1.02]' : 'text-white'}`}>
          {value}
        </h4>
      </div>
    </div>
  );
};

const StatusWidget: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono font-bold text-white">{value}</span>
      <div className={`w-1.5 h-1.5 rounded-full ${
        color === 'emerald' ? 'bg-emerald-500' : color === 'blue' ? 'bg-blue-500' : 'bg-orange-500'
      } animate-pulse`} />
    </div>
  </div>
);

export default DashboardHome;
