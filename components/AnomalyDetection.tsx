
import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Zap, Loader2, X, Settings2, Lock, ShieldCheck } from 'lucide-react';
import { AnomalyEvent, UserRole } from '../types';
import { analyzeAnomaly } from '../services/geminiService';

interface AnomalyDetectionProps {
  anomalies: AnomalyEvent[];
  onUpdateStatus: (id: string, status: AnomalyEvent['status']) => void;
  globalSearch: string;
  initialTargetId?: string | null;
  onAnalysisStart?: () => void;
  userRole: UserRole;
}

const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({ 
  anomalies, onUpdateStatus, globalSearch, initialTargetId, onAnalysisStart, userRole 
}) => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyEvent | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTuning, setShowTuning] = useState(false);

  const userLevel = userRole.includes('Tier-3') ? 3 : userRole.includes('Tier-2') ? 2 : 1;

  useEffect(() => {
    if (initialTargetId) {
      const target = anomalies.find(a => a.id === initialTargetId);
      if (target) {
        handleAnalyze(target);
        if (onAnalysisStart) onAnalysisStart();
      }
    }
  }, [initialTargetId]);

  const handleAnalyze = async (anomaly: AnomalyEvent) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setSelectedAnomaly(anomaly);
    const result = await analyzeAnomaly(anomaly.description);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Anomaly Detection</h1>
          <p className="text-slate-400">ML-driven behavioral deviation surveillance.</p>
        </div>
        {userLevel >= 3 ? (
          <button onClick={() => setShowTuning(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white border border-slate-700 font-medium text-sm">
            <Settings2 className="w-4 h-4" /> Tune Models
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-600">
            <Lock className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-widest text-[9px]">T3 Required to Tune</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="divide-y divide-slate-800">
              {anomalies.map((event) => (
                <div key={event.id} onClick={() => handleAnalyze(event)} className={`p-5 hover:bg-slate-800/50 transition-all cursor-pointer ${selectedAnomaly?.id === event.id ? 'bg-blue-600/5 ring-1 ring-inset ring-blue-500/20' : ''}`}>
                  <div className="flex gap-4">
                    <div className={`p-2.5 rounded-xl border shrink-0 ${event.score > 0.9 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <h4 className="text-white font-bold text-sm">{event.source}</h4>
                        <span className="text-[9px] font-black text-white px-2 py-0.5 rounded bg-slate-800 uppercase">{event.status}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{event.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl sticky top-24">
            <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex items-center justify-between">
              <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 text-xs">
                <Zap className="w-4 h-4 text-blue-500" /> AI Triage Insight
              </h3>
            </div>
            <div className="p-6 min-h-[300px]">
              {!selectedAnomaly ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 opacity-50">
                  <Activity className="w-8 h-8 mb-2" />
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Select event for triage</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-300 leading-relaxed">{selectedAnomaly.description}</p>
                  </div>
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 min-h-[160px]">
                    {isAnalyzing ? <div className="flex items-center justify-center h-full text-[10px] text-slate-500 animate-pulse">Running vector triage...</div> : analysis && <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{analysis}</div>}
                  </div>
                  <div className="flex gap-2">
                    {userLevel >= 2 ? (
                      <button onClick={() => onUpdateStatus(selectedAnomaly.id, 'Resolved')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg">Resolve Alert</button>
                    ) : (
                      <div className="flex-1 flex items-center justify-center gap-2 bg-slate-950 border border-slate-900 text-slate-700 py-2 rounded-lg">
                        <Lock className="w-3 h-3" /> <span className="text-[9px] font-black uppercase">Clearance L2+ Required</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showTuning && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between mb-6">
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Heuristic Calibration</h3>
               <button onClick={() => setShowTuning(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <div className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Sensitivity</label>
                 <input type="range" className="w-full accent-blue-600 h-1.5 bg-slate-800 rounded-lg" />
               </div>
               <button onClick={() => setShowTuning(false)} className="w-full bg-blue-600 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-xl">Apply Calibration</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomalyDetection;
