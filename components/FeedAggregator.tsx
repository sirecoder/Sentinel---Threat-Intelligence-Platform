
import React, { useState } from 'react';
import { Rss, Plus, X, Loader2, Globe, Sparkles, Search, Tag as TagIcon, ExternalLink, Link2, Settings2, Lock } from 'lucide-react';
import { ThreatFeed, UserRole } from '../types';
import { suggestFeeds } from '../services/geminiService';

interface FeedAggregatorProps {
  feeds: ThreatFeed[];
  onAdd: (feed: ThreatFeed) => void;
  onSync: (id: string) => void;
  userRole: UserRole;
}

const FeedAggregator: React.FC<FeedAggregatorProps> = ({ feeds, onAdd, onSync, userRole }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [landscapeContext, setLandscapeContext] = useState('Current ransomware trends.');
  
  const userLevel = userRole.includes('Tier-3') ? 3 : userRole.includes('Tier-2') ? 2 : 1;

  const handleSuggestFeeds = async () => {
    setIsSuggesting(true);
    const results = await suggestFeeds(landscapeContext);
    setSuggestions(results);
    setIsSuggesting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Rss className="w-7 h-7 text-blue-500" /> Intelligence Feeds
          </h1>
          <p className="text-slate-400">Schema normalization across {feeds.length} sources.</p>
        </div>
        {userLevel >= 3 ? (
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-bold text-xs shadow-lg">
            <Plus className="w-4 h-4" /> Provision Bridge
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-600">
            <Lock className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-widest text-[9px]">T3 Admin Required</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {feeds.map(f => (
            <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all group flex flex-col">
               <div className="flex justify-between mb-4">
                 <div className="p-2 bg-slate-800 rounded-xl"><Globe className="w-5 h-5 text-slate-400" /></div>
                 <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${f.status === 'Healthy' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/5 text-blue-400 border-blue-500/20'}`}>
                   {f.status}
                 </span>
               </div>
               <h3 className="font-bold text-white text-sm mb-1">{f.name}</h3>
               <p className="text-[10px] text-slate-500 font-mono truncate mb-4">{f.url}</p>
               <div className="flex gap-2 mt-auto">
                 {userLevel >= 2 ? (
                   <button onClick={() => onSync(f.id)} disabled={f.status === 'Syncing'} className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[9px] font-black uppercase border border-slate-700">
                     {f.status === 'Syncing' ? "Syncing..." : "Sync Now"}
                   </button>
                 ) : (
                    <div className="flex-1 py-1.5 bg-slate-950 text-slate-700 rounded text-[9px] font-black uppercase border border-slate-900 flex items-center justify-center gap-2">
                      <Lock className="w-3 h-3" /> Sync Locked
                    </div>
                 )}
               </div>
            </div>
          ))}
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
           <h3 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4">
             <Sparkles className="w-4 h-4 text-blue-400" /> AI Discovery
           </h3>
           <textarea 
             value={landscapeContext} onChange={(e) => setLandscapeContext(e.target.value)}
             className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 outline-none mb-4"
           />
           <button 
             onClick={handleSuggestFeeds} disabled={isSuggesting}
             className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
           >
             {isSuggesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />} Discover Sources
           </button>
           
           <div className="mt-6 space-y-3">
             {suggestions.map((s, i) => (
                <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                   <h4 className="font-bold text-white text-xs">{s.name}</h4>
                   <p className="text-[9px] text-slate-500 mt-1 line-clamp-2">{s.reason}</p>
                   {userLevel >= 3 ? (
                      <button onClick={() => onAdd({...s, id: Math.random().toString(), status: 'Healthy', lastUpdate: 'New'})} className="w-full mt-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-[9px] font-black uppercase rounded text-slate-400 hover:text-white transition-all">Integrate</button>
                   ) : (
                      <div className="w-full mt-3 py-1.5 bg-slate-900 text-slate-800 rounded text-[9px] font-black uppercase text-center flex items-center justify-center gap-2">
                        <Lock className="w-3 h-3" /> Admin Only
                      </div>
                   )}
                </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default FeedAggregator;
