
import React, { useState, useEffect, useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Area, AreaChart
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
  Search,
  Download,
  Loader2,
  ChevronDown,
  FileText,
  FileJson,
  Terminal,
  Lock,
  Globe,
  Radio,
  ZapOff
} from 'lucide-react';
import { DashboardStats, AnomalyEvent, UserRole } from '../types';
import ThreatMap from './ThreatMap';

interface DashboardHomeProps {
  stats: DashboardStats;
  onNewScan: () => void;
  isScanning: boolean;
  onExportReport: (format: string) => void;
  isExporting: boolean;
  onNavigate: (tab: string) => void;
  anomalies: AnomalyEvent[];
  onAlertClick: (id: string) => void;
  userRole: UserRole;
}

const IntelligenceTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700/50 backdrop-blur-xl p-4 rounded-xl shadow-2xl min-w-[240px] animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Temporal Point: {label}</p>
        <div className="space-y-1.5 font-mono">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-4">
              <span className="text-[10px] font-bold uppercase" style={{ color: entry.stroke }}>
                {entry.name} :
              </span>
              <span className="text-[10px] text-white/90 truncate">
                {entry.value.toString().padEnd(15, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const DashboardHome: React.FC<DashboardHomeProps> = ({ 
  stats, 
  onNewScan,
  isScanning,
  onExportReport,
  isExporting,
  onNavigate,
  anomalies,
  onAlertClick,
  userRole
}) => {
  const [liveMetrics, setLiveMetrics] = useState({ 
    history: Array.from({length: 25}).map((_, i) => ({
      time: i,
      global: 80 + Math.random() * 20,
      malicious: 40 + Math.random() * 15,
      actors: 20 + Math.random() * 10,
      exploits: 25 + Math.random() * 8,
      c2: 5 + Math.random() * 5,
      drift: 2 + Math.random() * 3
    })),
    current: {
      global: 82.2809671790943,
      malicious: 45.0609822038853,
      actors: 23.8709082297295,
      exploits: 28.0754567928340,
      c2: 8.0748183222357,
      drift: 3.1209384758291
    }
  });
  
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const userLevel = userRole.includes('Tier-3') ? 3 : userRole.includes('Tier-2') ? 2 : 1;

  useEffect(() => {
    if (isScanning) {
      setScanProgress(0);
      const interval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + 2, 98));
      }, 80);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => {
        const next = {
          time: prev.history[prev.history.length - 1].time + 1,
          global: 80 + Math.random() * 20,
          malicious: 40 + Math.random() * 15,
          actors: 20 + Math.random() * 10,
          exploits: 25 + Math.random() * 8,
          c2: 5 + Math.random() * 5,
          drift: 2 + Math.random() * 3
        };
        return {
          history: [...prev.history.slice(1), next],
          current: next
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
             <Activity className="w-7 h-7 text-blue-500" />
             Global Threat Operations
          </h1>
          <p className="text-slate-400 text-sm">Surveillance & heuristic analysis engine.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {userLevel >= 2 && (
            <div className="relative flex-1 sm:flex-none">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors text-sm font-medium border border-slate-700"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export
                <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>
              {showExportMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <button onClick={() => { onExportReport('PDF'); setShowExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                    <FileText className="w-4 h-4 text-rose-500" /> Executive PDF Brief
                  </button>
                  <button onClick={() => { onExportReport('JSON'); setShowExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                    <FileJson className="w-4 h-4 text-blue-500" /> Raw STIX/JSON
                  </button>
                </div>
              )}
            </div>
          )}

          {userLevel >= 2 ? (
            <button 
              onClick={onNewScan}
              disabled={isScanning}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-black uppercase tracking-wider text-xs transition-all shadow-xl active:scale-95 ${
                isScanning 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
              }`}
            >
              {isScanning ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Scanning...</>
              ) : (
                <><Search className="w-4 h-4" />Initiate Scan</>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-500 cursor-not-allowed">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">T2+ Required</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Indicators" value={stats.totalIoCs.toLocaleString()} change="+12%" icon={<Shield className="w-5 h-5 text-blue-400" />} />
        <StatCard title="Adversaries" value={stats.activeThreats.toLocaleString()} change="-4%" negative icon={<AlertTriangle className="w-5 h-5 text-red-400" />} />
        <StatCard title="Active Feeds" value={stats.activeFeeds.toString()} change="Optimal" icon={<Zap className="w-5 h-5 text-yellow-400" />} />
        <StatCard title="Daily Alerts" value={stats.alerts24h.toString()} change="+18%" icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-[#020617] border border-slate-800 rounded-2xl p-6 flex flex-col min-h-[520px] shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
          
          {isScanning && (
            <div className="absolute inset-0 z-40 bg-blue-950/20 backdrop-blur-[2px] flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
               <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
                  <h3 className="text-lg font-black text-white uppercase tracking-widest">Heuristic Scan Active</h3>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                  </div>
               </div>
            </div>
          )}

          <div className="flex flex-col xl:flex-row justify-between items-start mb-8 gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_12px_#3b82f6]" />
                <h3 className="font-black text-white text-[12px] uppercase tracking-[0.25em]">STRATEGIC INTELLIGENCE EVOLUTION</h3>
              </div>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">MULTI-VECTOR NOC TELEMETRY</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 w-full xl:w-auto">
              <TelemetryMonitor label="Global" value={liveMetrics.current.global.toFixed(1)} data={liveMetrics.history.map(h => ({ v: h.global }))} color="#3b82f6" />
              <TelemetryMonitor label="Malicious" value={liveMetrics.current.malicious.toFixed(1)} data={liveMetrics.history.map(h => ({ v: h.malicious }))} color="#f43f5e" />
              <TelemetryMonitor label="Actors" value={liveMetrics.current.actors.toFixed(1)} data={liveMetrics.history.map(h => ({ v: h.actors }))} color="#10b981" />
              <TelemetryMonitor label="Exploits" value={liveMetrics.current.exploits.toFixed(1)} data={liveMetrics.history.map(h => ({ v: h.exploits }))} color="#ec4899" />
              <TelemetryMonitor label="C2" value={liveMetrics.current.c2.toFixed(1)} data={liveMetrics.history.map(h => ({ v: h.c2 }))} color="#06b6d4" />
              <TelemetryMonitor label="Drift" value={liveMetrics.current.drift.toFixed(2)} data={liveMetrics.history.map(h => ({ v: h.drift }))} color="#8b5cf6" />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col md:flex-row gap-8 relative z-10">
            <div className="flex-1 min-h-[320px]">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={liveMetrics.history}>
                   <defs>
                     <linearGradient id="colorGlobal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorMalicious" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorActors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorExploits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorC2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <Tooltip content={<IntelligenceTooltip />} />
                   <Area stackId="1" name="global" type="monotone" dataKey="global" stroke="#3b82f6" fill="url(#colorGlobal)" strokeWidth={2} isAnimationActive={false} />
                   <Area stackId="1" name="malicious" type="monotone" dataKey="malicious" stroke="#f43f5e" fill="url(#colorMalicious)" strokeWidth={2} isAnimationActive={false} />
                   <Area stackId="1" name="actors" type="monotone" dataKey="actors" stroke="#10b981" fill="url(#colorActors)" strokeWidth={2} isAnimationActive={false} />
                   <Area stackId="1" name="exploits" type="monotone" dataKey="exploits" stroke="#ec4899" fill="url(#colorExploits)" strokeWidth={2} isAnimationActive={false} />
                   <Area stackId="1" name="c2" type="monotone" dataKey="c2" stroke="#06b6d4" fill="url(#colorC2)" strokeWidth={2} isAnimationActive={false} />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="w-full md:w-64 space-y-2 shrink-0 flex flex-col justify-center">
              <SideLegendItem color="#3b82f6" label="global" value={liveMetrics.current.global.toString()} />
              <SideLegendItem color="#f43f5e" label="malicious" value={liveMetrics.current.malicious.toString()} />
              <SideLegendItem color="#10b981" label="actors" value={liveMetrics.current.actors.toString()} />
              <SideLegendItem color="#ec4899" label="exploits" value={liveMetrics.current.exploits.toString()} />
              <SideLegendItem color="#06b6d4" label="c2" value={liveMetrics.current.c2.toString()} />
              <SideLegendItem color="#8b5cf6" label="drift" value={liveMetrics.current.drift.toString()} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex-1">
            <h3 className="font-black text-white uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
              <Cpu className="w-3 h-3 text-blue-500" />
              NODE HEALTH MATRIX
            </h3>
            <div className="space-y-3">
              <StatusWidget label="Mesh-Alpha" value="99.9%" color="emerald" />
              <StatusWidget label="Mesh-Beta" value="94.2%" color="blue" />
              <StatusWidget label="AI-Core" value="ACTIVE" color="emerald" />
              <StatusWidget label="S-Bridges" value="OPTIMIZED" color="emerald" />
              <StatusWidget label="H-Tunnels" value="ENCRYPTED" color="blue" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-[380px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white flex items-center gap-2 uppercase tracking-wider text-xs">
              <MapIcon className="w-4 h-4 text-blue-500" />
              VECTOR INGRESS MAP
            </h3>
            <span className="text-[9px] text-emerald-400 font-black uppercase animate-pulse">LIVE TRACKING</span>
          </div>
          <div className="h-[280px] bg-slate-950/40 rounded-xl border border-slate-800/50 overflow-hidden relative">
            <ThreatMap />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col shadow-xl h-[380px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white flex items-center gap-2 uppercase tracking-wider text-xs">
              <Zap className="w-4 h-4 text-orange-500" />
              REAL-TIME SIGNAL STREAM
            </h3>
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{anomalies.length} ALERTS</span>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
            {anomalies.map((alert) => (
              <div 
                key={alert.id} 
                onClick={() => userLevel >= 2 && onAlertClick(alert.id)}
                className={`p-3 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-blue-500/30 transition-all flex items-center gap-4 group ${userLevel >= 2 ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className={`w-1 h-8 rounded-full ${alert.score > 0.9 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-blue-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-[11px] font-bold text-white truncate uppercase">{alert.source}</h4>
                    <span className="text-[8px] text-slate-500 font-mono">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{alert.description}</p>
                </div>
                {userLevel >= 2 ? (
                  <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-blue-500 transition-colors" />
                ) : (
                  <Lock className="w-3 h-3 text-slate-800" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TelemetryMonitor: React.FC<{ label: string; value: string; data: any[]; color: string; warning?: boolean }> = ({ label, value, data, color, warning }) => (
  <div className={`px-3 py-1.5 bg-slate-900 border ${warning ? 'border-red-500/50 bg-red-500/5 animate-pulse' : 'border-slate-800'} rounded-lg flex items-center gap-3 min-w-[125px]`}>
    <div className="flex-1 min-w-0">
      <span className="text-[8px] text-slate-500 font-black uppercase block tracking-widest">{label}</span>
      <span className={`text-[11px] font-mono font-black truncate block ${warning ? 'text-red-400' : 'text-white'}`}>{value}</span>
    </div>
    <div className="w-12 h-8 opacity-40 hidden sm:block">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area type="monotone" dataKey="v" stroke={color} fill={color} fillOpacity={0.1} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const SideLegendItem: React.FC<{ color: string; label: string; value: string }> = ({ color, label, value }) => (
  <div className="flex items-center justify-between p-2.5 bg-slate-950/50 border border-slate-800/50 rounded-xl group hover:border-slate-700 transition-colors">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-1.5 h-7 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: color }} />
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] font-black uppercase tracking-[0.1em] leading-none mb-1.5" style={{ color: color }}>{label} :</span>
        <span className="text-[10px] font-black text-white font-mono leading-none truncate">{value}</span>
      </div>
    </div>
  </div>
);

const StatCard: React.FC<{ title: string; value: string; change: string; icon: React.ReactNode; negative?: boolean; }> = ({ title, value, change, icon, negative }) => (
  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm transition-all hover:border-slate-700 hover:shadow-xl group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 group-hover:bg-slate-700 transition-colors group-hover:scale-110 duration-300">
        {icon}
      </div>
      <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${negative ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{change}</span>
    </div>
    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{title}</p>
    <h4 className="text-2xl font-black font-mono text-white tracking-tighter">{value}</h4>
  </div>
);

const StatusWidget: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-all">
    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{label}</span>
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] font-mono font-bold text-white uppercase">{value}</span>
      <div className={`w-2 h-2 rounded-full ${color === 'emerald' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-blue-500 shadow-[0_0_8px_#3b82f6]'} animate-pulse`} />
    </div>
  </div>
);

export default DashboardHome;
