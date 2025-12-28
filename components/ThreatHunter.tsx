
import React, { useState } from 'react';
import { 
  Search, 
  Terminal, 
  Play, 
  Save, 
  Copy, 
  Zap, 
  ChevronRight, 
  Info,
  History,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  X,
  FileText,
  ShieldAlert,
  ArrowLeft,
  Filter,
  Download
} from 'lucide-react';
import { suggestHuntQueries } from '../services/geminiService';

interface HuntLog {
  id: string;
  timestamp: string;
  host: string;
  user: string;
  action: string;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  details: string;
}

const ThreatHunter: React.FC = () => {
  const [huntingTarget, setHuntingTarget] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [queries, setQueries] = useState<any[]>([]);
  const [executingIdx, setExecutingIdx] = useState<number | null>(null);
  const [huntResults, setHuntResults] = useState<HuntLog[] | null>(null);
  const [activeQuery, setActiveQuery] = useState<any | null>(null);

  const handleGenerate = async () => {
    if (!huntingTarget) return;
    setIsGenerating(true);
    const results = await suggestHuntQueries(huntingTarget);
    setQueries(results);
    setIsGenerating(false);
  };

  const generateMockLogs = (query: any): HuntLog[] => {
    const hosts = ['SRV-SQL-01', 'WORKSTATION-12', 'DC-PROD-01', 'GATEWAY-APP', 'HR-LAPTOP-04'];
    const users = ['admin', 'j.doe', 'system', 'service_account', 'b.smith'];
    const actions = ['Process Create', 'Network Connect', 'Registry Modify', 'File Write', 'Login Success'];
    
    return Array.from({ length: 8 }).map((_, i) => ({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(Date.now() - Math.random() * 10000000).toISOString(),
      host: hosts[Math.floor(Math.random() * hosts.length)],
      user: users[Math.floor(Math.random() * users.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      risk: i === 0 ? 'High' : (Math.random() > 0.7 ? 'Medium' : 'Low'),
      details: `Detected behavior matching ${query.language} logic: ${query.description.substring(0, 50).replace(/,/g, '')}...`
    }));
  };

  const handleExecute = (idx: number) => {
    setExecutingIdx(idx);
    setActiveQuery(queries[idx]);
    
    // Simulate query execution time
    setTimeout(() => {
      setExecutingIdx(null);
      setHuntResults(generateMockLogs(queries[idx]));
    }, 2500);
  };

  const handleDownloadCSV = () => {
    if (!huntResults) return;

    const headers = ['ID', 'Timestamp', 'Host', 'User', 'Action', 'Risk', 'Details'];
    const rows = huntResults.map(log => [
      log.id,
      log.timestamp,
      log.host,
      log.user,
      log.action,
      log.risk,
      `"${log.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sentinel_hunt_${huntingTarget.replace(/\s+/g, '_').toLowerCase()}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetHunt = () => {
    setHuntResults(null);
    setActiveQuery(null);
  };

  if (huntResults && activeQuery) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={resetHunt}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                Hunt Results
              </h1>
              <p className="text-slate-400 text-sm">Target: <span className="text-blue-400 font-medium">{huntingTarget}</span> • {activeQuery.language} Execution</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors text-sm font-medium border border-slate-700"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium shadow-lg shadow-blue-500/20">
              <Save className="w-4 h-4" />
              Save Evidence
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Query Summary</h3>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[10px] text-blue-300 overflow-x-auto">
                <code>{activeQuery.query}</code>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-400">Total Matches</span>
                <span className="text-lg font-bold text-white font-mono">{huntResults.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Execution Time</span>
                <span className="text-xs font-medium text-emerald-400 font-mono">2.48s</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Risk Distribution</h3>
              <div className="space-y-3">
                {['High', 'Medium', 'Low'].map(level => {
                  const count = huntResults.filter(r => r.risk === level).length;
                  const percentage = (count / huntResults.length) * 100;
                  return (
                    <div key={level} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className={level === 'High' ? 'text-red-400' : level === 'Medium' ? 'text-orange-400' : 'text-blue-400'}>{level}</span>
                        <span className="text-slate-500">{count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${level === 'High' ? 'bg-red-500' : level === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'}`} 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col min-h-[500px]">
            <div className="p-4 border-b border-slate-800 bg-slate-800/20 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Matching Log Entries</span>
              </div>
              <button className="text-slate-500 hover:text-white">
                <Filter className="w-4 h-4" />
              </button>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Host / User</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Action</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                  {huntResults.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors group cursor-pointer">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}.{log.id.substring(0, 3)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-slate-200 font-bold">{log.host}</span>
                          <span className="text-slate-500 text-[10px]">{log.user}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-blue-400 group-hover:text-blue-300">
                        {log.action}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.risk === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                          log.risk === 'Medium' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 
                          'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        }`}>
                          {log.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <div className="flex items-center gap-3 text-xs text-slate-500 italic">
                <Info className="w-4 h-4 shrink-0" />
                Showing top matches from the last 24 hours based on the applied KQL/SQL logic.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Search className="w-7 h-7 text-blue-500" />
            AI Threat Hunting
          </h1>
          <p className="text-slate-400">Proactively identify malicious activity using advanced query generation.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors text-sm font-medium border border-slate-700">
            <History className="w-4 h-4" />
            Hunt History
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors text-sm font-medium border border-slate-700">
            <Save className="w-4 h-4" />
            Saved Queries
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-3xl -z-10 rounded-full translate-x-32 -translate-y-32" />
        
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-white">What are you hunting for?</h2>
            <p className="text-slate-400 text-sm">Describe the threat behavior, malware family, or attack vector you want to detect.</p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 group-focus-within:opacity-40 transition-opacity" />
            <div className="relative flex gap-2">
              <input 
                type="text"
                placeholder="e.g., 'Lateral movement using RDP' or 'Cobalt Strike beaconing behavior'"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all text-lg shadow-inner"
                value={huntingTarget}
                onChange={(e) => setHuntingTarget(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !huntingTarget}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-8 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-3"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Generate Hunt
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {['Process injection', 'Persistence via Scheduled Tasks', 'Data Exfiltration', 'Suspicious PowerShell'].map(tag => (
              <button 
                key={tag}
                onClick={() => setHuntingTarget(tag)}
                className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full text-xs font-medium border border-slate-700/50 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {queries.length > 0 && (
        <div className="grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-6 duration-500">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-500" />
              Generated Queries
            </h3>
            <button 
              onClick={() => setQueries([])}
              className="text-xs text-slate-500 hover:text-white flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {queries.map((q, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col hover:border-blue-500/50 transition-all group shadow-lg">
                <div className="p-4 border-b border-slate-800 bg-slate-800/40 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-[10px] font-bold rounded uppercase tracking-wider">{q.language}</span>
                    <h4 className="text-sm font-semibold text-white">Scenario {idx + 1}</h4>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex-1">
                  <div className="mb-4 text-xs text-slate-400 leading-relaxed italic">
                    {q.description}
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-blue-300 overflow-x-auto h-[120px]">
                    <code>{q.query}</code>
                  </div>
                </div>
                <div className="p-3 bg-slate-800/30 border-t border-slate-800">
                  <button 
                    onClick={() => handleExecute(idx)}
                    disabled={executingIdx !== null}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-emerald-500/10"
                  >
                    {executingIdx === idx ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        Execute Hunt
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {queries.length === 0 && !isGenerating && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-600">
            <Zap className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-white">Ready to hunt?</h3>
            <p className="text-slate-400 text-sm">Enter a target above to leverage Gemini AI for generating specialized detection queries based on real-world threat intelligence.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatHunter;
