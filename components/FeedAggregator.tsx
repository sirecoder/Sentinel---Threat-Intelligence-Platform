
import React, { useState, useMemo } from 'react';
import { 
  Rss, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCcw, 
  Settings, 
  Plus, 
  X, 
  Activity, 
  Loader2, 
  Globe, 
  ShieldCheck, 
  Zap, 
  History, 
  ArrowUpRight, 
  Wifi, 
  WifiOff, 
  Database,
  Search,
  Sparkles,
  Info,
  MoreVertical,
  Trash2,
  Terminal,
  Shield,
  Clock,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { ThreatFeed } from '../types';
import { suggestFeeds } from '../services/geminiService';

const MINI_TREND = [{v:10}, {v:15}, {v:12}, {v:20}, {v:18}, {v:25}];

interface FeedAggregatorProps {
  feeds: ThreatFeed[];
  onAdd: (feed: ThreatFeed) => void;
  onSync: (id: string) => void;
}

interface FeedLog {
  timestamp: string;
  status: 'Success' | 'Failed' | 'Warning';
  message: string;
  count: number;
}

const FeedAggregator: React.FC<FeedAggregatorProps> = ({ feeds, onAdd, onSync }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState<ThreatFeed | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [newFeed, setNewFeed] = useState({
    name: '',
    url: '',
    type: 'API' as ThreatFeed['type']
  });

  const globalHealth = useMemo(() => {
    const healthyCount = feeds.filter(f => f.status === 'Healthy').length;
    return {
      uptime: ((healthyCount / feeds.length) * 100).toFixed(1),
      avgTrust: (feeds.reduce((acc, f) => acc + f.trustScore, 0) / (feeds.length || 1)).toFixed(0),
      totalIoCsToday: '124.8k',
      activeSyncs: feeds.filter(f => f.status === 'Syncing').length
    };
  }, [feeds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setTimeout(() => {
      onAdd({
        id: Math.random().toString(36).substr(2, 9),
        name: newFeed.name,
        url: newFeed.url,
        type: newFeed.type,
        status: 'Healthy',
        lastUpdate: 'Just now',
        trustScore: 75 + Math.floor(Math.random() * 25)
      });
      setNewFeed({ name: '', url: '', type: 'API' });
      setIsValidating(false);
      setShowAddModal(false);
    }, 1500);
  };

  const handleSuggestFeeds = async () => {
    setIsSuggesting(true);
    const results = await suggestFeeds("APT29 activity, ransomware trends, and data exfiltration TTPs");
    setSuggestions(results);
    setIsSuggesting(false);
  };

  const handleSyncAll = () => {
    setIsSyncingAll(true);
    feeds.forEach(f => onSync(f.id));
    setTimeout(() => setIsSyncingAll(false), 3000);
  };

  const generateMockLogs = (feed: ThreatFeed): FeedLog[] => {
    return [
      { timestamp: '2023-11-20 14:30:05', status: 'Success', message: 'Handshake successful. 1,240 indicators parsed.', count: 1240 },
      { timestamp: '2023-11-20 12:30:10', status: 'Warning', message: 'Rate limit threshold (90%) reached. Backoff initiated.', count: 850 },
      { timestamp: '2023-11-20 10:30:12', status: 'Success', message: 'Full sync complete. All schemas validated.', count: 3100 },
      { timestamp: '2023-11-20 08:30:01', status: 'Failed', message: 'Network timeout during STIX bundle extraction.', count: 0 },
      { timestamp: '2023-11-19 18:30:15', status: 'Success', message: 'Daily refresh cycle completed.', count: 4200 },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Rss className="w-7 h-7 text-blue-500" />
            Intelligence Feed Management
          </h1>
          <p className="text-slate-400">Monitoring connectivity, trust-scoring, and schema normalization across {feeds.length} sources.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors text-sm font-medium border border-slate-700 disabled:opacity-50"
          >
            {isSyncingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            Force Global Sync
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-bold shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            Connect Source
          </button>
        </div>
      </div>

      {/* Global Health Monitor */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthCard title="Uptime (24h)" value={`${globalHealth.uptime}%`} sub="Global Reliability" icon={<Wifi className="w-5 h-5 text-emerald-400" />} />
        <HealthCard title="Active Connections" value={feeds.length.toString()} sub={`${globalHealth.activeSyncs} Syncing Now`} icon={<Activity className="w-5 h-5 text-blue-400" />} />
        <HealthCard title="Mean Trust Score" value={`${globalHealth.avgTrust}%`} sub="Cross-Feed Confidence" icon={<Shield className="w-5 h-5 text-yellow-400" />} />
        <HealthCard title="Indicators Processed" value={globalHealth.totalIoCsToday} sub="Last 24 Hours" icon={<Database className="w-5 h-5 text-purple-400" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed List Container */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feeds.map((feed) => (
              <FeedCard 
                key={feed.id} 
                feed={feed} 
                onSync={onSync} 
                onViewLogs={(f) => setShowLogsModal(f)} 
              />
            ))}
            
            <button 
              onClick={() => setShowAddModal(true)}
              className="border-2 border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-blue-600/5 transition-all group min-h-[180px]"
            >
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Plus className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Establish New Bridge</p>
            </button>
          </div>
        </div>

        {/* AI Side Panel: Feed Recommendations */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                AI Intelligence Advisor
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                Sentinel's advisor analyzes your current active threats and suggests high-fidelity OSINT sources to bridge intelligence gaps.
              </p>
              
              <button 
                onClick={handleSuggestFeeds}
                disabled={isSuggesting}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSuggesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Scan for Relevant Feeds
              </button>

              {suggestions.length > 0 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  {suggestions.map((rec, i) => (
                    <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500/30 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter bg-blue-500/10 px-2 py-0.5 rounded-full">{rec.type}</span>
                        <Plus className="w-3.5 h-3.5 text-slate-600 group-hover:text-white cursor-pointer" />
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1">{rec.name}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-3">{rec.reason}</p>
                      <div className="flex items-center gap-1 text-[9px] text-slate-600 truncate font-mono">
                        <Globe className="w-3 h-3" />
                        {rec.url}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-white">Trust Policy Active</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Feed filtering is enabled. Indicators with a trust score below <span className="text-emerald-400 font-black">65%</span> are marked for manual review before entering the primary blocklist.
            </p>
          </div>
        </div>
      </div>

      {/* Connectivity Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                  <Terminal className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Connectivity Ledger</h3>
                  <p className="text-xs text-slate-500">Telemetry History for <span className="text-blue-400">{showLogsModal.name}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setShowLogsModal(null)}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[50vh]">
              {generateMockLogs(showLogsModal).map((log, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full mt-1 ${
                      log.status === 'Success' ? 'bg-emerald-500' : 
                      log.status === 'Warning' ? 'bg-orange-500' : 'bg-red-500'
                    }`} />
                    <div className="w-0.5 flex-1 bg-slate-800 my-1 group-last:hidden" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-mono text-slate-500">{log.timestamp}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' : 
                        log.status === 'Warning' ? 'bg-orange-500/10 text-orange-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{log.message}</p>
                    {log.count > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
                        <Database className="w-3 h-3" />
                        {log.count.toLocaleString()} indicators ingested
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
               <div className="flex items-center gap-4">
                 <div className="text-center">
                   <p className="text-[9px] text-slate-600 uppercase font-black">Sync Rate</p>
                   <p className="text-sm font-bold text-white">94%</p>
                 </div>
                 <div className="text-center">
                   <p className="text-[9px] text-slate-600 uppercase font-black">Avg Latency</p>
                   <p className="text-sm font-bold text-white">42ms</p>
                 </div>
               </div>
               <button 
                onClick={() => setShowLogsModal(null)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Feed Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <Shield className="w-5 h-5 text-blue-400" />
                 <h3 className="text-lg font-bold text-white">Provision Source</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Feed Identifier</label>
                <input required type="text" value={newFeed.name} onChange={e => setNewFeed(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="e.g. VirusTotal Enterprise" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transport URL</label>
                <input required type="text" value={newFeed.url} onChange={e => setNewFeed(prev => ({ ...prev, url: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono" placeholder="https://api.intel.com/v1/taxii" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Communication Protocol</label>
                <select value={newFeed.type} onChange={e => setNewFeed(prev => ({ ...prev, type: e.target.value as any }))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  <option value="API">RESTful API (JSON)</option>
                  <option value="TAXII">TAXII 2.1 (STIX)</option>
                  <option value="RSS">RSS / OSINT Feed</option>
                  <option value="Manual">Static JSON Object</option>
                </select>
              </div>
              <button type="submit" disabled={isValidating} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-2xl mt-4 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                {isValidating ? <><Loader2 className="w-4 h-4 animate-spin" /> Handshaking...</> : 'Connect Intelligence Source'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FeedCard: React.FC<{ feed: ThreatFeed; onSync: (id: string) => void; onViewLogs: (f: ThreatFeed) => void }> = ({ feed, onSync, onViewLogs }) => {
  const isSyncing = feed.status === 'Syncing';
  const isError = feed.status === 'Error';

  const getSyncStateLabel = () => {
    if (!feed.syncProgress) return 'INITIALIZING';
    if (feed.syncProgress < 30) return 'HANDSHAKING';
    if (feed.syncProgress < 70) return 'PARSING';
    return 'FINALIZING';
  };

  return (
    <div className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all group flex flex-col shadow-lg ${
      isError ? 'border-red-500/50 shadow-red-500/5' : 'border-slate-800 hover:border-slate-700'
    }`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2.5 rounded-xl border transition-all ${
            isSyncing ? 'bg-blue-500/10 border-blue-500/30' : 
            isError ? 'bg-red-500/10 border-red-500/30' : 
            'bg-slate-800 border-slate-700/50'
          }`}>
            {feed.type === 'RSS' ? <Globe className={`w-5 h-5 ${isSyncing ? 'text-blue-400 animate-pulse' : isError ? 'text-red-400' : 'text-slate-400'}`} /> : 
             feed.type === 'TAXII' ? <ShieldCheck className={`w-5 h-5 ${isSyncing ? 'text-blue-400 animate-pulse' : isError ? 'text-red-400' : 'text-slate-400'}`} /> :
             <Rss className={`w-5 h-5 ${isSyncing ? 'text-blue-400 animate-pulse' : isError ? 'text-red-400' : 'text-slate-400'}`} />}
          </div>
          <div className="flex flex-col items-end">
            <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border transition-all ${
              feed.status === 'Healthy' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 
              isSyncing ? 'bg-blue-500/5 text-blue-400 border-blue-500/20' : 
              'bg-red-500/5 text-red-400 border-red-500/20'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                feed.status === 'Healthy' ? 'bg-emerald-500' : 
                isSyncing ? 'bg-blue-500 animate-pulse' : 'bg-red-500'
              }`} />
              {isSyncing ? getSyncStateLabel() : feed.status}
            </div>
            <span className="text-[9px] text-slate-600 mt-1 uppercase font-black tracking-widest">{feed.type} TRANSPORT</span>
          </div>
        </div>

        <h3 className="text-sm font-bold text-white mb-0.5 group-hover:text-blue-400 transition-colors truncate">{feed.name}</h3>
        <p className="text-[10px] text-slate-500 truncate mb-4 font-mono">{feed.url}</p>

        {isSyncing ? (
          <div className="space-y-3 mb-4 animate-in fade-in duration-300">
             <div className="flex justify-between items-center mb-1">
               <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">Sync Progress</span>
               <span className="text-[10px] font-mono text-blue-400">{feed.syncProgress}%</span>
             </div>
             <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                  style={{ width: `${feed.syncProgress}%` }} 
                />
             </div>
             <div className="flex justify-between items-center text-[8px] font-mono text-slate-600 uppercase">
                <span>Ingest: {((feed.syncProgress || 0) * 12.4).toFixed(1)}MB</span>
                <span className="animate-pulse">Active Stream...</span>
             </div>
          </div>
        ) : isError ? (
          <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl mb-4 space-y-2 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-red-400">
               <AlertTriangle className="w-3 h-3" />
               <span className="text-[9px] font-black uppercase">Technical Diagnostics</span>
            </div>
            <p className="text-[10px] text-red-300 leading-relaxed font-medium italic">
              {feed.lastError || 'Unexpected server response: 502 Bad Gateway.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
              <span className="block text-[8px] text-slate-600 uppercase font-black mb-1 flex items-center gap-1">
                <BarChart3 className="w-2.5 h-2.5" />
                Reliability
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white font-mono">{feed.trustScore}%</span>
                <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className={`h-full ${feed.trustScore > 80 ? 'bg-emerald-500' : 'bg-yellow-500'}`} style={{ width: `${feed.trustScore}%` }} />
                </div>
              </div>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="block text-[8px] text-slate-600 uppercase font-black mb-1">Heartbeat</span>
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                 <Clock className="w-3 h-3 text-slate-600" />
                 {feed.lastUpdate}
              </span>
            </div>
          </div>
        )}

        {/* Mini NOC-style sparkline (Matching user image request) */}
        {!isSyncing && !isError && (
          <div className="h-10 w-full mb-2 opacity-40 group-hover:opacity-80 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MINI_TREND}>
                <Line 
                  type="monotone" 
                  dataKey="v" 
                  stroke={feed.status === 'Healthy' ? '#10b981' : '#3b82f6'} 
                  strokeWidth={1.5} 
                  dot={false} 
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className={`mt-auto border-t p-3 flex gap-2 ${isError ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-800/20 border-slate-800'}`}>
        <button 
          disabled={isSyncing}
          onClick={() => onSync(feed.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${
            isError ? 'bg-red-600 hover:bg-red-500 text-white border-red-500' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          } disabled:opacity-50`}
        >
          {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : isError ? <Zap className="w-3 h-3" /> : <RefreshCcw className="w-3 h-3" />}
          {isError ? 'RETRY' : 'SYNC'}
        </button>
        <button 
          onClick={() => onViewLogs(feed)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all active:scale-95"
        >
          <History className="w-3 h-3" />
          Logs
        </button>
        <button className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700">
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const HealthCard: React.FC<{ title: string; value: string; sub: string; icon: React.ReactNode }> = ({ title, value, sub, icon }) => (
  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 group-hover:bg-slate-700 transition-colors">{icon}</div>
      <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-slate-400 transition-all" />
    </div>
    <div>
      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-2xl font-black text-white font-mono">{value}</h4>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{sub}</span>
      </div>
    </div>
  </div>
);

export default FeedAggregator;
