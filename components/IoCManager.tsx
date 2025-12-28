
import React, { useState, useRef, useMemo } from 'react';
import { 
  Plus, Search, ShieldAlert, ExternalLink, Loader2, Trash2, Zap, X, Camera, Sparkles, ShieldCheck, Globe, Tag as TagIcon, RotateCcw, Settings2, AlertCircle, ZoomIn, ZoomOut, Binary, Lock, Info, CheckCircle2, Link as LinkIcon
} from 'lucide-react';
import { IoCRecord, IoCType, UserRole } from '../types';
import { enrichIoC, analyzeVisualForensics } from '../services/geminiService';

interface IoCManagerProps {
  iocs: IoCRecord[];
  onDelete: (id: string) => void;
  onAdd: (ioc: IoCRecord) => void;
  onBulkCleanup: (ids: string[]) => void;
  globalSearch: string;
  userRole: UserRole;
}

const IoCManager: React.FC<IoCManagerProps> = ({ iocs, onDelete, onAdd, onBulkCleanup, globalSearch, userRole }) => {
  const [localSearch, setLocalSearch] = useState('');
  const [selectedIoC, setSelectedIoC] = useState<IoCRecord | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState<string | null>(null);
  const [enrichmentSources, setEnrichmentSources] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExpirySettings, setShowExpirySettings] = useState(false);
  const [expiryThreshold, setExpiryThreshold] = useState(90);
  
  const [newIoC, setNewIoC] = useState({ 
    value: '', 
    type: 'IP' as IoCType, 
    threatLevel: 'Medium' as IoCRecord['threatLevel'], 
    tags: '', 
    confidence: 80 
  });

  const userLevel = userRole.includes('Tier-3') ? 3 : userRole.includes('Tier-2') ? 2 : 1;

  const processedIocs = useMemo(() => {
    const now = new Date();
    return iocs.map(ioc => {
      const lastSeenDate = new Date(ioc.lastSeen);
      const diffTime = now.getTime() - lastSeenDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const shouldExpire = ioc.status !== 'Whitelisted' && diffDays >= expiryThreshold;
      return { 
        ...ioc, 
        calculatedStatus: (shouldExpire ? 'Expired' : ioc.status) as IoCRecord['status'], 
        daysOld: Math.max(0, diffDays) 
      };
    });
  }, [iocs, expiryThreshold]);

  const filteredIocs = processedIocs.filter(ioc => 
    ioc.value.toLowerCase().includes((globalSearch || localSearch).toLowerCase()) ||
    ioc.tags.some(tag => tag.toLowerCase().includes((globalSearch || localSearch).toLowerCase()))
  );

  const handleEnrich = async (ioc: IoCRecord) => {
    setIsEnriching(true);
    setEnrichmentData(null);
    setEnrichmentSources([]);
    setSelectedIoC(ioc);
    const result = await enrichIoC(ioc.value, ioc.type);
    setEnrichmentData(result.text);
    setEnrichmentSources(result.sources || []);
    setIsEnriching(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userLevel < 2) return;
    
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      value: newIoC.value,
      type: newIoC.type,
      threatLevel: newIoC.threatLevel,
      confidence: newIoC.confidence,
      lastSeen: new Date().toISOString(),
      tags: newIoC.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: 'Active',
      description: 'Manually added indicator.'
    });
    setNewIoC({ value: '', type: 'IP', threatLevel: 'Medium', tags: '', confidence: 80 });
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)] animate-in fade-in duration-500">
      <div className={`flex flex-col flex-1 min-w-0 ${selectedIoC ? 'lg:max-w-[60%]' : 'w-full'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-blue-500" />
              IoC Management
            </h1>
            <p className="text-xs md:text-sm text-slate-400 font-medium">Enterprise database of validated Indicators of Compromise.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {userLevel >= 3 && (
              <button 
                onClick={() => setShowExpirySettings(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors text-sm font-medium border border-slate-700"
              >
                <Settings2 className="w-4 h-4" /> Expiry Policy
              </button>
            )}

            {userLevel >= 2 ? (
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-xs font-black uppercase tracking-wider shadow-lg"
              >
                <Plus className="w-4 h-4" /> Add IoC
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-600 cursor-not-allowed">
                <Lock className="w-4 h-4" /> 
                <span className="text-[10px] font-black uppercase tracking-widest">T2+ Required</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex-1 flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-800/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                value={localSearch} 
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Filter indicators by value or tags..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="overflow-x-auto flex-1 scrollbar-thin scrollbar-thumb-slate-800">
            <table className="w-full text-left">
              <thead className="bg-slate-900 sticky top-0 z-10">
                <tr className="border-b border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Indicator</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Level</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredIocs.map((ioc) => (
                  <tr 
                    key={ioc.id} 
                    onClick={() => setSelectedIoC(ioc)} 
                    className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${selectedIoC?.id === ioc.id ? 'bg-blue-600/5' : ''}`}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-white break-all max-w-[200px]">{ioc.value}</td>
                    <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{ioc.type}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                        ioc.calculatedStatus === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 
                        ioc.calculatedStatus === 'Whitelisted' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {ioc.calculatedStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-[10px] font-black uppercase ${
                         ioc.threatLevel === 'Critical' ? 'text-red-500' : 
                         ioc.threatLevel === 'High' ? 'text-orange-500' : 'text-blue-500'
                       }`}>{ioc.threatLevel}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {userLevel >= 3 ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(ioc.id); }} 
                          className="text-slate-600 hover:text-red-500 p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-800 inline" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedIoC && (
        <div className="lg:w-[40%] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-right-4 duration-300">
          <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-start">
             <div className="min-w-0">
               <h2 className="text-xl font-bold text-white font-mono break-all leading-tight">{selectedIoC.value}</h2>
               <div className="flex gap-2 mt-2">
                 {selectedIoC.tags.map(tag => (
                   <span key={tag} className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 font-bold">#{tag}</span>
                 ))}
               </div>
             </div>
             <button 
               onClick={() => setSelectedIoC(null)}
               className="p-1 hover:bg-slate-800 rounded-lg text-slate-500"
             >
               <X className="w-5 h-5" />
             </button>
          </div>
          <div className="p-6 flex-1 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleEnrich(selectedIoC)} 
                disabled={isEnriching}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {isEnriching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Enrich Intel
              </button>
              {userLevel >= 2 ? (
                <button 
                  className="bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20"
                >
                  Block Target
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 border border-slate-800 rounded-xl text-slate-700 bg-slate-950">
                  <Lock className="w-3.5 h-3.5" /> 
                  <span className="text-[10px] font-black uppercase">T2 Required</span>
                </div>
              )}
            </div>
            
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <Info className="w-3.5 h-3.5" /> Tactical Meta
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[8px] text-slate-600 uppercase font-black">Confidence</p>
                  <p className="text-sm font-bold text-white font-mono">{selectedIoC.confidence}%</p>
                </div>
                <div>
                  <p className="text-[8px] text-slate-600 uppercase font-black">Days Active</p>
                  <p className="text-sm font-bold text-white font-mono">{(selectedIoC as any).daysOld}d</p>
                </div>
              </div>
            </div>

            {enrichmentData ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="bg-slate-950 p-5 rounded-xl border border-blue-500/20">
                  <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> AI Intelligence Synthesis
                  </h4>
                  <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {enrichmentData}
                  </div>
                </div>

                {enrichmentSources.length > 0 && (
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <LinkIcon className="w-3 h-3" /> Verified Sources
                    </h4>
                    <div className="space-y-2">
                      {enrichmentSources.map((source, idx) => (
                        source.web && (
                          <a 
                            key={idx} 
                            href={source.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-blue-500/40 transition-colors group"
                          >
                            <span className="text-[10px] text-slate-400 group-hover:text-blue-400 truncate pr-4">{source.web.title || source.web.uri}</span>
                            <ExternalLink className="w-3 h-3 text-slate-700 group-hover:text-blue-400 shrink-0" />
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : isEnriching && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Cross-referencing global telemetry...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALS */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-800/20 flex justify-between items-center">
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Add New Indicator</h3>
               <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase">Indicator Value / Signature</label>
                 <textarea 
                   required
                   value={newIoC.value}
                   onChange={(e) => setNewIoC({...newIoC, value: e.target.value})}
                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 outline-none h-24 font-mono"
                   placeholder="192.168.x.x, domain.com, or full YARA rule..."
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase">Type</label>
                   <select 
                     value={newIoC.type}
                     onChange={(e) => setNewIoC({...newIoC, type: e.target.value as IoCType})}
                     className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 outline-none"
                   >
                     <option value="IP">IP Address</option>
                     <option value="Domain">Domain</option>
                     <option value="URL">URL</option>
                     <option value="Hash">File Hash</option>
                     <option value="YARA">YARA Rule</option>
                     <option value="Snort">Snort Sig</option>
                     <option value="RegistryKey">Registry Key</option>
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase">Severity</label>
                   <select 
                     value={newIoC.threatLevel}
                     onChange={(e) => setNewIoC({...newIoC, threatLevel: e.target.value as any})}
                     className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 outline-none"
                   >
                     <option value="Low">Low</option>
                     <option value="Medium">Medium</option>
                     <option value="High">High</option>
                     <option value="Critical">Critical</option>
                   </select>
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase">Tags (comma separated)</label>
                 <input 
                   type="text" 
                   value={newIoC.tags}
                   onChange={(e) => setNewIoC({...newIoC, tags: e.target.value})}
                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 outline-none"
                   placeholder="APT29, Ransomware, Phish"
                 />
               </div>
               <button 
                 type="submit"
                 className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-xl shadow-blue-500/20 transition-all active:scale-95"
               >
                 Register Indicator
               </button>
            </form>
          </div>
        </div>
      )}

      {showExpirySettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-800/20 flex justify-between items-center">
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Global Expiry Policy</h3>
               <button onClick={() => setShowExpirySettings(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
               <div className="space-y-4">
                 <div className="flex justify-between items-center">
                   <label className="text-[10px] font-black text-slate-300 uppercase">Retention Threshold</label>
                   <span className="text-blue-500 font-mono font-black">{expiryThreshold} Days</span>
                 </div>
                 <input 
                   type="range" 
                   min="7" 
                   max="365" 
                   value={expiryThreshold}
                   onChange={(e) => setExpiryThreshold(parseInt(e.target.value))}
                   className="w-full accent-blue-600 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                 />
                 <p className="text-[10px] text-slate-500 leading-relaxed italic">
                   Indicators not observed for {expiryThreshold} days will be automatically flagged for pruning unless whitelisted.
                 </p>
               </div>
               <div className="pt-4 border-t border-slate-800">
                  <button 
                    onClick={() => {
                      const expiredIds = processedIocs.filter(i => i.calculatedStatus === 'Expired').map(i => i.id);
                      if (expiredIds.length > 0) {
                        onBulkCleanup(expiredIds);
                        setShowExpirySettings(false);
                      }
                    }}
                    disabled={processedIocs.filter(i => i.calculatedStatus === 'Expired').length === 0}
                    className="w-full py-3 bg-red-600/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-30"
                  >
                    Clean Expired Indicators ({processedIocs.filter(i => i.calculatedStatus === 'Expired').length})
                  </button>
               </div>
               <button 
                 onClick={() => setShowExpirySettings(false)}
                 className="w-full py-3 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest"
               >
                 Dismiss
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IoCManager;
