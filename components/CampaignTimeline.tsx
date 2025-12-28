
import React, { useState, useEffect } from 'react';
import { 
  History, 
  ShieldAlert, 
  Calendar, 
  User, 
  Target, 
  Zap,
  ArrowRight,
  Info,
  ExternalLink,
  Loader2,
  X,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  Globe,
  Dna,
  ChevronRight,
  // Added missing Download icon
  Download
} from 'lucide-react';
import { ThreatCampaign, CampaignEvent } from '../types';
import { analyzeKillChain } from '../services/geminiService';

interface CampaignTimelineProps {
  campaigns: ThreatCampaign[];
}

const CampaignTimeline: React.FC<CampaignTimelineProps> = ({ campaigns }) => {
  const [localCampaigns, setLocalCampaigns] = useState<ThreatCampaign[]>(campaigns);
  const [selectedId, setSelectedId] = useState<string>(campaigns[0].id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Keep local state in sync if props change
  useEffect(() => {
    setLocalCampaigns(campaigns);
  }, [campaigns]);

  const selectedCampaign = localCampaigns.find(c => c.id === selectedId) || localCampaigns[0];

  const handleUpdateField = (field: keyof ThreatCampaign, value: string) => {
    setLocalCampaigns(prev => prev.map(c => c.id === selectedId ? { ...c, [field]: value } : c));
  };

  const getStageColor = (stage: CampaignEvent['stage']) => {
    switch (stage) {
      case 'Reconnaissance': return 'bg-slate-700 text-slate-300';
      case 'Weaponization': return 'bg-blue-900/40 text-blue-400';
      case 'Delivery': return 'bg-cyan-900/40 text-cyan-400';
      case 'Exploitation': return 'bg-orange-900/40 text-orange-400';
      case 'Installation': return 'bg-red-900/40 text-red-400';
      case 'C2': return 'bg-purple-900/40 text-purple-400';
      case 'Actions on Objectives': return 'bg-rose-600 text-white';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  const handleAnalyzeKillChain = async () => {
    setIsAnalyzing(true);
    setShowAnalysisModal(true);
    const result = await analyzeKillChain(
      selectedCampaign.name,
      selectedCampaign.actor,
      selectedCampaign.events
    );
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)]">
      {/* Sidebar - Campaign List */}
      <div className="flex flex-col gap-4 lg:w-80 shrink-0">
        <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-blue-500" />
          Active Campaigns
        </h2>
        <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto pb-4 lg:pb-0 scrollbar-thin scrollbar-thumb-slate-800">
          {localCampaigns.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedId(c.id);
                setAnalysisResult(null);
              }}
              className={`min-w-[200px] lg:min-w-0 text-left p-4 rounded-xl border transition-all shrink-0 ${
                selectedId === c.id 
                ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/5' 
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                  c.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {c.severity}
                </span>
              </div>
              <h3 className="text-xs md:text-sm font-bold text-white mb-1 truncate">{c.name}</h3>
              <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                <User className="w-3 h-3" />
                {c.actor}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Timeline View */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden min-w-0">
        <div className="p-4 md:p-6 border-b border-slate-800 bg-slate-800/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-white truncate">{selectedCampaign.name}</h2>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-red-500" />
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Attacker Entity</span>
                  <span className="text-xs text-slate-200 font-bold">{selectedCampaign.actor}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Threat Actor Type</span>
                  <input 
                    type="text" 
                    value={selectedCampaign.actorType}
                    onChange={(e) => handleUpdateField('actorType', e.target.value)}
                    className="bg-transparent border-none text-xs text-slate-200 font-bold p-0 focus:ring-0 focus:text-blue-400 placeholder-slate-600 transition-colors w-32"
                    placeholder="e.g. Nation-State"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Dna className="w-4 h-4 text-purple-400" />
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Motivation Profile</span>
                  <input 
                    type="text" 
                    value={selectedCampaign.motivation}
                    onChange={(e) => handleUpdateField('motivation', e.target.value)}
                    className="bg-transparent border-none text-xs text-slate-200 font-bold p-0 focus:ring-0 focus:text-purple-400 placeholder-slate-600 transition-colors w-40"
                    placeholder="e.g. Financial Gain"
                  />
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={handleAnalyzeKillChain}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs md:text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            <Zap className="w-4 h-4" />
            Analyze Chain
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 relative scrollbar-thin scrollbar-thumb-slate-800">
          <div className="hidden sm:block absolute left-10 md:left-10 top-10 bottom-10 w-0.5 bg-gradient-to-b from-blue-500 via-slate-800 to-slate-800" />

          <div className="space-y-8 md:space-y-12">
            {selectedCampaign.events.map((event, index) => (
              <div key={event.id} className="relative sm:pl-14 group">
                <div className={`hidden sm:block absolute left-[-10px] top-1 w-5 h-5 rounded-full border-4 border-slate-900 z-10 transition-transform group-hover:scale-125 ${
                  index === 0 ? 'bg-blue-500' : 'bg-slate-700'
                }`} />

                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  <div className="sm:w-32 shrink-0">
                    <p className="text-[10px] font-mono text-slate-500">{new Date(event.timestamp).toLocaleDateString()}</p>
                    <p className="text-base md:text-lg font-black text-slate-200">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>

                  <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-2xl p-4 md:p-6 hover:border-blue-500/30 transition-all">
                    <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
                      <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${getStageColor(event.stage)}`}>
                        {event.stage}
                      </span>
                      {event.iocRelated && (
                        <div className="flex items-center gap-2 text-[8px] bg-slate-900 border border-slate-800 px-2 py-1 rounded text-blue-400 font-mono truncate max-w-[150px]">
                          IOC: {event.iocRelated}
                        </div>
                      )}
                    </div>
                    <h4 className="text-base md:text-lg font-bold text-white mb-2">{event.title}</h4>
                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAnalysisModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
              <div>
                <h3 className="text-lg font-bold text-white">AI Strategy Insight</h3>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">TTP Analysis: {selectedCampaign.actor}</p>
              </div>
              <button onClick={() => setShowAnalysisModal(false)} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950/30">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12 md:py-20 space-y-4">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <ShieldCheck className="w-4 h-4 text-blue-400 absolute inset-0 m-auto" />
                  </div>
                  <p className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-widest">Synthesizing kill chain intelligence...</p>
                </div>
              ) : (
                <div className="prose prose-invert prose-xs md:prose-sm max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                  {analysisResult}
                </div>
              )}
            </div>
            {!isAnalyzing && analysisResult && (
              <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
                 <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 hover:text-white transition-all">
                   <Download className="w-3.5 h-3.5" />
                   Download Report
                 </button>
                 <button 
                   onClick={() => {
                     navigator.clipboard.writeText(analysisResult || '');
                   }}
                   className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all"
                 >
                   <Copy className="w-3.5 h-3.5" />
                   Copy Briefing
                 </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignTimeline;
