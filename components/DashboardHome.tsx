
import React, { useState, useRef, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, ReferenceLine, ReferenceArea, ReferenceDot
} from 'recharts';
import { 
  Shield, 
  AlertTriangle, 
  ShieldAlert,
  Zap, 
  ArrowUpRight, 
  TrendingUp, 
  Map as MapIcon,
  Server,
  RefreshCw,
  Clock,
  History as HistoryIcon,
  TrendingDown,
  LineChart as LineIcon,
  Crosshair,
  Target,
  Search,
  Activity,
  Gauge,
  Cpu
} from 'lucide-react';
import { CHART_COLORS } from '../constants';
import { DashboardStats, AnomalyEvent } from '../types';
import ThreatMap from './ThreatMap';

// Enhanced dataset demonstrating benchmarking, anomalies, and forecasting
const THREAT_EVOLUTION_DATA = [
  { date: 'Nov 14', threats: 120, baseline: 100, event: null },
  { date: 'Nov 15', threats: 150, baseline: 110, event: null },
  { date: 'Nov 16', threats: 410, baseline: 105, event: 'Operation Silver Fox Spike', type: 'anomaly' }, 
  { date: 'Nov 17', threats: 210, baseline: 115, event: null },
  { date: 'Nov 18', threats: 180, baseline: 120, event: 'DarkGate Activity' },
  { date: 'Nov 19', threats: 250, baseline: 125, event: null },
  { date: 'Nov 20', threats: 310, baseline: 130, event: 'Live Observation' },
  { date: 'Nov 21', threats: 380, baseline: 135, event: 'Predicted Surge', isForecast: true }, // Future Projection
];

const MINI_CHART_DATA = [
  { v: 10 }, { v: 15 }, { v: 8 }, { v: 22 }, { v: 18 }, { v: 25 }, { v: 20 }
];

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
  const [evolutionData, setEvolutionData] = useState(THREAT_EVOLUTION_DATA);
  const [targetingId, setTargetingId] = useState<string | null>(null);
  const [liveVelocity, setLiveVelocity] = useState(12.4);

  // Calculate deviation metrics
  const liveData = evolutionData.filter(d => !d.isForecast);
  const currentThreats = liveData[liveData.length - 1].threats;
  const currentBaseline = liveData[liveData.length - 1].baseline;
  const deviation = ((currentThreats - currentBaseline) / currentBaseline * 100).toFixed(1);
  const isDeviationCritical = parseFloat(deviation) > 20;

  useEffect(() => {
    const interval = setInterval(() => {
      setEvolutionData(prev => {
        const newData = [...prev];
        const lastLiveIdx = newData.findIndex(d => d.isForecast) - 1;
        if (lastLiveIdx >= 0) {
          const wiggle = Math.floor(Math.random() * 20) - 10;
          newData[lastLiveIdx] = {
            ...newData[lastLiveIdx],
            threats: Math.max(100, newData[lastLiveIdx].threats + wiggle)
          };
        }
        return newData;
      });
      setLiveVelocity(prev => +(prev + (Math.random() * 2 - 1)).toFixed(1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAlertClick = (id: string) => {
    setTargetingId(id);
    // Visual feedback delay
    setTimeout(() => {
      onAlertClick(id);
    }, 800);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-2xl backdrop-blur-xl z-[100] ring-1 ring-white/10">
          <p className="text-slate-500 text-[10px] font-black uppercase mb-2 tracking-widest">{label} {data.isForecast ? '(Forecast)' : '(Historical)'}</p>
          <div className="space-y-2">
            <div className="flex justify-between gap-12 items-center">
              <span className="text-xs text-white font-medium flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${data.isForecast ? 'bg-blue-400 border border-dashed border-white' : 'bg-blue-500 animate-pulse'}`} /> 
                {data.isForecast ? 'Projected Volume:' : 'Recorded Signal Count:'}
              </span>
              <span className="text-sm font-mono font-bold text-white">{data.threats}</span>
            </div>
            <div className="flex justify-between gap-12 items-center">
              <span className="text-xs text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-700 rounded-full" /> Operational Baseline:
              </span>
              <span className="text-sm font-mono text-slate-500">{data.baseline}</span>
            </div>
            {data.event && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <div className={`text-[11px] font-bold p-2 rounded-lg border flex items-center gap-2 ${data.type === 'anomaly' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
                   <ShieldAlert className="w-3.5 h-3.5" /> {data.event}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 relative">
      {/* Targeting HUD Overlay */}
      {targetingId && (
        <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center bg-blue-900/10 backdrop-blur-[2px]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="relative animate-in zoom-in-150 duration-500">
            <div className="w-48 h-48 md:w-64 md:h-64 border-2 border-blue-500/40 rounded-full flex items-center justify-center">
              <div className="w-36 h-36 md:w-48 md:h-48 border border-blue-400/20 rounded-full flex items-center justify-center animate-[spin_4s_linear_infinite]">
                 <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full" style={{ marginLeft: '100%' }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Crosshair className="w-12 h-12 md:w-16 md:h-16 text-blue-500 animate-pulse" />
              </div>
            </div>
            <div className="absolute top-full mt-8 left-1/2 -translate-x-1/2 text-center w-64">
              <p className="text-blue-400 font-black text-lg md:text-xl tracking-[0.3em] uppercase animate-pulse">Locking Target</p>
              <p className="text-blue-500/60 text-[10px] md:text-xs font-mono mt-2 truncate">SIG_ID: {targetingId.toUpperCase()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Indicators" value={stats.totalIoCs.toLocaleString()} change="+12%" trendData={MINI_CHART_DATA} icon={<Shield className="w-5 h-5 text-blue-400" />} />
        <StatCard title="Active Adversaries" value={stats.activeThreats.toLocaleString()} change="-4%" negative trendData={[...MINI_CHART_DATA].reverse()} icon={<AlertTriangle className="w-5 h-5 text-red-400" />} />
        <StatCard title="Intelligence Feeds" value={stats.activeFeeds.toString()} change="Optimal" trendData={MINI_CHART_DATA.map(d => ({v: 18}))} icon={<Zap className="w-5 h-5 text-yellow-400" />} />
        <StatCard title="Daily Alerts" value={stats.alerts24h.toString()} change="+18%" trendData={MINI_CHART_DATA} icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Intelligence Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6 flex flex-col min-h-[500px] shadow-2xl overflow-hidden">
          {/* Enhanced Header with Live Metrics */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
            <div className="space-y-1">
              <h3 className="font-bold text-white flex items-center gap-2">
                <HistoryIcon className="w-4 h-4 text-blue-500" />
                Strategic Threat Intelligence Evolution
              </h3>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mt-1">
                Visualizing Live Telemetry & Projections
              </p>
            </div>
            
            {/* Live Data Ticker Header - Fills space effectively */}
            <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <div className="px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-xl flex flex-col items-center min-w-[100px]">
                <span className="text-[9px] text-slate-500 font-black uppercase">Live Count</span>
                <span className="text-sm font-black font-mono text-white flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  {currentThreats}
                </span>
              </div>
              <div className="px-4 py-2 bg-slate-950/50 border border-slate-800 rounded-xl flex flex-col items-center min-w-[100px]">
                <span className="text-[9px] text-slate-500 font-black uppercase">Velocity</span>
                <span className="text-sm font-black font-mono text-emerald-400">{liveVelocity} <span className="text-[10px] text-slate-500">s/sec</span></span>
              </div>
              <div className={`px-4 py-2 rounded-xl border flex flex-col items-center min-w-[100px] transition-colors ${
                isDeviationCritical ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
              }`}>
                <span className="text-[9px] text-slate-500 font-black uppercase">Deviation</span>
                <span className={`text-sm font-black font-mono ${isDeviationCritical ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isDeviationCritical ? '+' : ''}{deviation}%
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[300px] relative mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e293b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Signal Volume', angle: -90, position: 'insideLeft', offset: 10, fill: '#475569', fontSize: 9, fontWeight: 'bold' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1 }} />
                
                <ReferenceArea x1="Nov 15" x2="Nov 17" fill="#ef4444" fillOpacity={0.03} label={{ position: 'top', value: 'CLUSTER DETECTED', fill: '#ef4444', fontSize: 9, fontWeight: 'bold' }} />
                <ReferenceLine y={300} label={{ position: 'right', value: 'CRITICAL', fill: '#ef4444', fontSize: 8, fontWeight: 'bold' }} stroke="#ef4444" strokeDasharray="3 3" opacity={0.4} />
                <ReferenceLine y={130} stroke="#475569" strokeWidth={1} strokeDasharray="10 10" label={{ position: 'right', value: 'BASELINE', fill: '#475569', fontSize: 8 }} />

                <Area type="monotone" dataKey="threats" stroke={CHART_COLORS.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorThreats)" activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} />

                {evolutionData.map((entry, index) => entry.event && !entry.isForecast && (
                  <ReferenceDot key={index} x={entry.date} y={entry.threats} r={4} fill={entry.type === 'anomaly' ? '#ef4444' : '#f59e0b'} stroke="#0f172a" strokeWidth={2} />
                ))}

                <Area type="monotone" dataKey="threats" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorForecast)" data={evolutionData.slice(-2)} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
             <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm" />
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-tight">Active Indicators</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-0.5 bg-slate-600 border-t-2 border-dashed border-slate-500" />
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-tight">30d Baseline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-0.5 bg-blue-400 border-t-2 border-dotted border-blue-400" />
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-tight">AI Forecaster</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                   <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg flex flex-col">
                      <span className="text-[8px] text-slate-600 font-black uppercase">Max Peak</span>
                      <span className="text-xs font-bold text-white">410</span>
                   </div>
                   <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg flex flex-col">
                      <span className="text-[8px] text-slate-600 font-black uppercase">Mean Avg</span>
                      <span className="text-xs font-bold text-white">242</span>
                   </div>
                   <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg flex flex-col">
                      <span className="text-[8px] text-slate-600 font-black uppercase">Rel %</span>
                      <span className="text-xs font-bold text-emerald-400">98.2%</span>
                   </div>
                </div>
             </div>
             
             <div className="bg-blue-600/5 border border-blue-500/10 rounded-xl p-4 flex items-start gap-4">
               <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                 <Gauge className="w-4 h-4 text-blue-400" />
               </div>
               <div className="space-y-1">
                 <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Autonomous Intelligence</h4>
                 <p className="text-[10px] text-slate-500 leading-normal">
                   Volumetric signals correlate with <span className="text-orange-400 font-bold">DarkGate Activity</span>. AI projects a <span className="text-blue-400 font-bold">surge event</span> in the next 12h based on current ingress velocity of <span className="text-white">{liveVelocity} s/sec</span>.
                 </p>
               </div>
             </div>
          </div>
        </div>

        {/* Operational Side Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-500" />
              Node Infrastructure
            </h3>
            <span className="text-[9px] text-emerald-400 font-black">STABLE</span>
          </div>
          <div className="space-y-4 flex-1">
            <StatusWidget label="Core Utilization" status="Nominal" value="14.2%" sub="Compute Load" color="emerald" icon={<Server className="w-4 h-4" />} />
            <StatusWidget label="Handshake Mesh" status="18/18 Sync" value="Optimal" sub="Feed Peer Grid" color="blue" icon={<RefreshCw className="w-4 h-4" />} />
            <StatusWidget label="Intelligence TTL" status="Policy Active" value="42" sub="Stale Indicators" color="orange" icon={<Shield className="w-4 h-4" />} />
          </div>
          <button 
            onClick={() => onNavigate('anomalies')}
            className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 hover:text-white text-[10px] font-black uppercase text-slate-300 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all tracking-[0.2em] shadow-sm active:scale-[0.98]"
          >
            Tactical Analysis Console
          </button>
        </div>
      </div>

      {/* Global Ingress & Alert Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white flex items-center gap-2 uppercase tracking-wider text-xs">
              <MapIcon className="w-4 h-4 text-blue-500" />
              Ingress Vector Map
            </h3>
            <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[9px] text-emerald-400 font-black uppercase">Live Track</span>
            </div>
          </div>
          <div className="h-[300px] bg-slate-950/40 rounded-xl border border-slate-800/50 overflow-hidden relative shadow-inner">
            <ThreatMap />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white flex items-center gap-2 uppercase tracking-wider text-xs">
              <Zap className="w-4 h-4 text-orange-500" />
              Incident Signal Stream
            </h3>
            <div className="flex items-center gap-2">
               <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{anomalies.length} ACTIVE SIGNALS</span>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 max-h-[300px] scrollbar-thin scrollbar-thumb-slate-800">
            {anomalies.map((alert) => (
              <div 
                key={alert.id} 
                onClick={() => handleAlertClick(alert.id)}
                className={`p-4 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-blue-500/30 transition-all flex items-center gap-4 group cursor-pointer active:scale-[0.99] relative overflow-hidden ${
                  targetingId === alert.id ? 'ring-2 ring-blue-500/50 bg-blue-500/5' : ''
                }`}
              >
                {/* Visual indicator of severity */}
                <div className={`w-1.5 h-12 rounded-full shrink-0 ${
                  alert.score > 0.9 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 
                  alert.score > 0.7 ? 'bg-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 
                  'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                }`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors uppercase tracking-tight">{alert.source}</h4>
                      {alert.score > 0.8 && (
                        <span className="text-[8px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20 font-black animate-pulse">CRITICAL</span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 leading-relaxed">
                    <span className="line-clamp-1">{alert.description}</span>
                  </p>

                  <div className="mt-2 flex items-center gap-3">
                     <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className={`h-full ${alert.score > 0.9 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${alert.score * 100}%` }} />
                        </div>
                        <span className="text-[8px] text-slate-500 font-black uppercase">Confidence {(alert.score * 100).toFixed(0)}%</span>
                     </div>
                     <span className="w-1 h-1 bg-slate-700 rounded-full" />
                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Activity className="w-3 h-3 text-blue-400" />
                        <span className="text-[8px] text-blue-400 font-black uppercase tracking-widest">Forensics</span>
                     </div>
                  </div>
                </div>

                <div className="p-2 bg-slate-800 rounded-lg border border-slate-700 group-hover:bg-blue-600 transition-all group-hover:shadow-lg group-hover:shadow-blue-500/20 group-hover:border-blue-400 group-hover:-translate-y-1">
                  <Target className={`w-4 h-4 text-slate-400 group-hover:text-white ${targetingId === alert.id ? 'animate-spin' : ''}`} />
                </div>

                {/* Ambient scanline for active targeting */}
                {targetingId === alert.id && (
                   <div className="absolute inset-0 bg-blue-500/5 pointer-events-none animate-[pulse_1s_infinite]">
                     <div className="absolute top-0 left-0 w-full h-px bg-blue-400/30 animate-[scan_2s_linear_infinite]" />
                   </div>
                )}
              </div>
            ))}
          </div>
          <button 
            onClick={() => onNavigate('anomalies')}
            className="mt-4 w-full text-center text-[10px] font-black uppercase text-blue-400 hover:text-blue-300 tracking-[0.2em] py-3 border border-blue-500/10 rounded-xl hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2 group"
          >
            <Search className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            Launch Forensics Console
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trendData: { v: number }[];
  negative?: boolean;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trendData, negative, icon }) => (
  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-colors shadow-sm relative overflow-hidden group">
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className="p-2 bg-slate-800 rounded-lg border border-slate-700/50">{icon}</div>
      <div className="flex flex-col items-end">
        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${negative ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
          {change}
        </span>
      </div>
    </div>
    <div className="space-y-1 relative z-10">
      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{title}</p>
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-black text-white font-mono tracking-tight">{value}</p>
        <div className="h-8 w-20">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <Line type="monotone" dataKey="v" stroke={negative ? '#ef4444' : '#10b981'} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
);

interface StatusWidgetProps {
  label: string;
  status: string;
  value: string;
  sub: string;
  color: 'emerald' | 'blue' | 'orange';
  icon: React.ReactNode;
}

const StatusWidget: React.FC<StatusWidgetProps> = ({ label, status, value, sub, color, icon }) => {
  const colors = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
  };
  
  return (
    <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 group hover:border-slate-700 transition-all">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{label}</span>
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${colors[color]}`}>
          {status}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-baseline">
             <span className="text-sm font-bold text-white">{value}</span>
             <span className="text-[9px] text-slate-500 font-bold uppercase">{sub}</span>
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full mt-1.5 overflow-hidden">
             <div className={`h-full ${color === 'emerald' ? 'bg-emerald-500' : color === 'blue' ? 'bg-blue-500' : color === 'orange' ? 'bg-orange-500' : ''}`} style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
