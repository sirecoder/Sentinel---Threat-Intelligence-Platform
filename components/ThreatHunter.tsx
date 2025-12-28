
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Play, Save, Zap, Loader2, Sparkles, ArrowLeft, Lock, Bookmark, History, X, 
  BarChart3, Activity, Terminal, Shield, Filter, ChevronRight, Share2, Info, Camera,
  Upload, Image as ImageIcon, Binary, Cpu, RotateCcw, Copy, ExternalLink, Code,
  User, Trash2, Clock
} from 'lucide-react';
import { suggestHuntQueries, analyzeVisualForensics } from '../services/geminiService';
import { UserRole, SavedHunt } from '../types';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ThreatHunterProps {
  initialTarget?: string | null;
  onHuntStart?: () => void;
  userRole: UserRole;
  savedHunts: SavedHunt[];
  onSaveHunt: (hunt: SavedHunt) => void;
  onDeleteSavedHunt: (id: string) => void;
}

const ThreatHunter: React.FC<ThreatHunterProps> = ({ 
  initialTarget, onHuntStart, userRole, savedHunts, onSaveHunt, onDeleteSavedHunt 
}) => {
  const [huntingTarget, setHuntingTarget] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [queries, setQueries] = useState<any[]>([]);
  const [executingIdx, setExecutingIdx] = useState<number | null>(null);
  const [huntResults, setHuntResults] = useState<any[] | null>(null);
  const [showSavedMenu, setShowSavedMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const userLevel = userRole.includes('Tier-3') ? 3 : userRole.includes('Tier-2') ? 2 : 1;

  useEffect(() => {
    if (initialTarget) {
      setHuntingTarget(initialTarget);
      handleGenerate(initialTarget);
      if (onHuntStart) onHuntStart();
    }
  }, [initialTarget]);

  const handleGenerate = async (targetOverride?: string) => {
    const target = targetOverride || huntingTarget;
    if (!target) return;
    setIsGenerating(true);
    setHuntResults(null);
    const results = await suggestHuntQueries(target);
    setQueries(results);
    setIsGenerating(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const analysis = await analyzeVisualForensics(base64, file.type);
      setHuntingTarget(analysis);
      setIsAnalyzingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleExecute = (idx: number) => {
    if (userLevel < 2) return;
    setExecutingIdx(idx);
    setTimeout(() => {
      setExecutingIdx(null);
      setHuntResults(Array.from({length: 8}).map((_, i) => ({ 
        id: i, 
        host: `NODE-0${Math.floor(Math.random() * 999)}`, 
        user: ["svc_admin", "k.mitnick", "root", "j.doe"][Math.floor(Math.random() * 4)],
        details: "Unusual process injection matching current TTP observed. Signal drift exceeds threshold.",
        severity: Math.random() > 0.7 ? "Critical" : "High",
        timestamp: new Date().toISOString(),
        score: (0.7 + Math.random() * 0.3).toFixed(2),
        sparkData: Array.from({length: 12}).map(() => ({ v: Math.random() * 10 }))
      })));
    }, 2500);
  };

  const handleSaveToLibrary = (q: any) => {
    onSaveHunt({
      id: Math.random().toString(36).substr(2, 9),
      name: huntingTarget || 'Custom Hunt',
      query: q.query,
      language: q.language,
      timestamp: new Date().toISOString()
    });
  };

  const loadSavedHunt = (hunt: SavedHunt) => {
    setHuntingTarget(hunt.name);
    setQueries([{
      language: hunt.language,
      query: hunt.query,
      description: `Loaded from saved hunt: ${hunt.name}`
    }]);
    setShowSavedMenu(false);
  };

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-140px)] animate-in fade-in duration-500">
      
      {/* Search & Ingest Hub */}
      {!huntResults && (
        <div className="space-y-6">
          <div className="bg-[#020617] border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
            
            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
              <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">Tactical Hunt Engine</h1>
                <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">AI-Grounding Hub: Online</p>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Enter TTP, CVE, or Actor handle..."
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-5 pl-14 pr-6 text-white text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-xl"
                    value={huntingTarget}
                    onChange={(e) => setHuntingTarget(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowSavedMenu(!showSavedMenu)}
                    className={`p-5 bg-slate-900 border border-slate-800 rounded-2xl transition-all ${showSavedMenu ? 'text-blue-500 border-blue-500/50' : 'text-slate-400 hover:text-white'}`}
                    title="Saved Hunts"
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzingImage}
                    className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-blue-500/50 transition-all group"
                    title="Visual Ingest"
                  >
                    {isAnalyzingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                  </button>
                  
                  <button 
                    onClick={() => handleGenerate()} 
                    disabled={isGenerating || !huntingTarget}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Orchestrate</>}
                  </button>
                </div>
              </div>

              {/* Saved Hunts Dropdown */}
              {showSavedMenu && (
                <div className="absolute top-full right-0 mt-4 w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-800 bg-slate-800/20 flex justify-between items-center">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Saved Hunt Library</span>
                    <button onClick={() => setShowSavedMenu(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800 scrollbar-thin scrollbar-thumb-slate-800">
                    {savedHunts.length === 0 ? (
                      <div className="p-12 text-center text-slate-600">
                        <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-[10px] font-black uppercase">No saved signatures found.</p>
                      </div>
                    ) : (
                      savedHunts.map(hunt => (
                        <div key={hunt.id} className="p-4 hover:bg-slate-800/50 group flex items-center justify-between transition-colors">
                           <button onClick={() => loadSavedHunt(hunt)} className="flex-1 text-left min-w-0">
                             <h4 className="text-xs font-bold text-white truncate">{hunt.name}</h4>
                             <div className="flex items-center gap-2 mt-1">
                               <span className="text-[8px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded uppercase font-black">{hunt.language}</span>
                               <span className="text-[8px] text-slate-500 font-mono">{new Date(hunt.timestamp).toLocaleDateString()}</span>
                             </div>
                           </button>
                           <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteSavedHunt(hunt.id); }}
                            className="p-2 text-slate-700 hover:text-red-500 transition-colors"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Query Results IDE View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {queries.map((q, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-3xl flex flex-col group overflow-hidden shadow-xl animate-in slide-in-from-bottom-6 duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600/10 rounded-lg"><Terminal className="w-3.5 h-3.5 text-blue-400" /></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{q.language} Signal</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleSaveToLibrary(q)} className="p-1.5 text-slate-600 hover:text-emerald-400" title="Save to Library"><Bookmark className="w-3 h-3" /></button>
                    <button className="p-1.5 text-slate-600 hover:text-white"><Copy className="w-3 h-3" /></button>
                    <button className="p-1.5 text-slate-600 hover:text-blue-400"><RotateCcw className="w-3 h-3" /></button>
                  </div>
                </div>
                
                <div className="p-6 flex-1 space-y-4">
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                    <Info className="w-3 h-3 inline mr-2 text-blue-500" />
                    {q.description}
                  </p>
                  
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner group-hover:border-blue-500/30 transition-colors">
                    <div className="flex border-b border-slate-800 bg-slate-900/50 px-3 py-1">
                       <div className="flex gap-1">
                         <div className="w-2 h-2 rounded-full bg-red-500/30" />
                         <div className="w-2 h-2 rounded-full bg-yellow-500/30" />
                         <div className="w-2 h-2 rounded-full bg-green-500/30" />
                       </div>
                    </div>
                    <div className="p-4 h-40 overflow-auto font-mono text-[10px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 flex">
                      <div className="pr-4 border-r border-slate-800 text-slate-700 select-none text-right">
                        {q.query.split('\n').map((_, i) => <div key={i}>{i+1}</div>)}
                      </div>
                      <code className="pl-4 text-blue-300 whitespace-pre break-all">{q.query}</code>
                    </div>
                  </div>
                </div>

                <div className="p-5 border-t border-slate-800 bg-slate-800/20">
                  {userLevel >= 2 ? (
                    <button 
                      onClick={() => handleExecute(idx)} 
                      disabled={executingIdx !== null}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {executingIdx === idx ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Play className="w-4 h-4 fill-current" /> Initialize Search</>}
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-slate-700 bg-slate-900 py-3 rounded-xl border border-slate-800">
                      <Lock className="w-4 h-4" /> <span className="text-[9px] font-black uppercase">Tier-2 Analyst Required</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post-Hunt Tactical Results */}
      {huntResults && (
        <div className="space-y-6 animate-in zoom-in-95 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Detection Manifest</h2>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Target: {huntingTarget}</p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
               <button 
                onClick={() => setHuntResults(null)}
                className="flex-1 md:flex-none px-6 py-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
               >
                 <ArrowLeft className="w-4 h-4 inline mr-2" /> New Hunt
               </button>
               <button className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                 Export STIX 2.1
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {huntResults.map((r) => (
              <div key={r.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-blue-500/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none">
                  <Binary className="w-16 h-16" />
                </div>
                
                <div className="flex justify-between items-start mb-4">
                   <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                     r.severity === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                   }`}>
                     {r.severity} LEVEL
                   </div>
                   <div className="text-[10px] font-mono font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                     SCORE: {r.score}
                   </div>
                </div>

                <div className="space-y-1 mb-4">
                  <h3 className="text-lg font-black text-white font-mono">{r.host}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    <User className="w-3 h-3 text-blue-500" />
                    UID: {r.user}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-6 line-clamp-3">
                  {r.details}
                </p>
                
                <div className="h-12 w-full mb-6 opacity-30">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={r.sparkData}>
                      <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                   <button className="py-2 bg-slate-950 border border-slate-800 rounded-xl text-[9px] font-black uppercase text-slate-500 hover:text-white transition-all flex items-center justify-center gap-2">
                     <History className="w-3 h-3" /> Timeline
                   </button>
                   <button className="py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[9px] font-black uppercase text-blue-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
                     <Zap className="w-3 h-3" /> Pivot
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatHunter;
