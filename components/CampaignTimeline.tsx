
import React, { useState } from 'react';
import { 
  History, 
  ChevronRight, 
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
  Dna
} from 'lucide-react';
import { ThreatCampaign, CampaignEvent } from '../types';
import { analyzeKillChain } from '../services/geminiService';

interface CampaignTimelineProps {
  campaigns: ThreatCampaign[];
}

const CampaignTimeline: React.FC<CampaignTimelineProps> = ({ campaigns }) => {
  const [selectedCampaign, setSelectedCampaign] = useState<ThreatCampaign>(campaigns[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const copyToClipboard = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          {campaigns.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCampaign(c);
                setAnalysisResult(null);
              }}
              className={`min-w-[200px] lg:min-w-0 text-left p-4 rounded-xl border transition-all shrink-0 ${
                selectedCampaign.id === c.id 
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
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
              <p className="text-[10px] md:text-sm text-slate-400 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-red-500" />
                Actor: <span className="text-slate-200 font-bold">{selectedCampaign.actor}</span>
              </p>
              <p className="text-[10px] md:text-sm text-slate-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Type: </span><span className="text-slate-200 font-bold">{selectedCampaign.actorType}</span>
              </p>
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
          {/* Vertical Timeline Line - Hidden on very small screens to save space */}
          <div className="hidden sm:block absolute left-10 md:left-10 top-10 bottom-10 w-0.5 bg-gradient-to-b from-blue-500 via-slate-800 to-slate-800" />

          <div className="space-y-8 md:space-y-12">
            {selectedCampaign.events.map((event, index) => (
              <div key={event.id} className="relative sm:pl-14 group">
                {/* Timeline Node */}
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

      {/* Analysis modal follows same responsive pattern as others */}
      {showAnalysisModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Kill Chain Analysis</h3>
              <button onClick={() => setShowAnalysisModal(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950/30">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12 md:py-20 space-y-4">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  <p className="text-xs md:text-sm text-slate-400">Synthesizing Kill Chain Evidence...</p>
                </div>
              ) : (
                <div className="prose prose-invert prose-xs md:prose-sm max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {analysisResult}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignTimeline;
