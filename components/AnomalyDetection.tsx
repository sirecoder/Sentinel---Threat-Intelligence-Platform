
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  ChevronRight, 
  Zap, 
  Clock,
  ExternalLink,
  Loader2,
  X,
  Terminal,
  Download,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { AnomalyEvent } from '../types';
import { analyzeAnomaly } from '../services/geminiService';

interface AnomalyDetectionProps {
  anomalies: AnomalyEvent[];
  onUpdateStatus: (id: string, status: AnomalyEvent['status']) => void;
  globalSearch: string;
  initialTargetId?: string | null;
  onAnalysisStart?: () => void;
}

interface TechnicalLog {
  id: string;
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
}

const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({ 
  anomalies, 
  onUpdateStatus, 
  globalSearch, 
  initialTargetId,
  onAnalysisStart 
}) => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyEvent | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [mockLogs, setMockLogs] = useState<TechnicalLog[]>([]);

  // Auto-selection and analysis logic when jumping from Dashboard
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

  const generateMockLogs = (anomaly: AnomalyEvent) => {
    const logs: TechnicalLog[] = [];
    const timestamp = new Date(anomaly.timestamp).getTime();
    
    logs.push({ id: 'l1', time: new Date(timestamp - 300000).toISOString(), level: 'INFO', message: `Initializing behavioral baseline for ${anomaly.source}...` });
    logs.push({ id: 'l2', time: new Date(timestamp - 150000).toISOString(), level: 'INFO', message: 'Traffic flow patterns within expected variance.' });
    
    if (anomaly.description.toLowerCase().includes('traffic') || anomaly.description.toLowerCase().includes('spike')) {
      logs.push({ id: 'l3', time: new Date(timestamp - 5000).toISOString(), level: 'WARN', message: 'Egress buffer threshold exceeded (85%).' });
      logs.push({ id: 'l4', time: anomaly.timestamp, level: 'ERROR', message: `DETECTED: Unusual volume directed to external peer. DESC: ${anomaly.description}` });
      logs.push({ id: 'l5', time: new Date(timestamp + 2000).toISOString(), level: 'INFO', message: 'Routing table inspection: No static route changes identified.' });
    } else {
      logs.push({ id: 'l3', time: new Date(timestamp - 5000).toISOString(), level: 'WARN', message: 'Process tree deviation observed.' });
      logs.push({ id: 'l4', time: anomaly.timestamp, level: 'ERROR', message: `SIGNAL_CAUGHT: SIG_ANOMALY. DESC: ${anomaly.description}` });
    }

    setMockLogs(logs);
    setShowLogs(true);
  };

  const filteredAnomalies = anomalies.filter(a => 
    a.description.toLowerCase().includes(globalSearch.toLowerCase()) ||
    a.source.toLowerCase().includes(globalSearch.toLowerCase()) ||
    a.status.toLowerCase().includes(globalSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Anomaly Detection</h1>
          <p className="text-slate-400">ML-driven identification of behavioral deviations.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors text-sm font-medium border border-slate-700">
            Tune Models
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-800/20 flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Live Events</h3>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Real-time Processing
                </span>
              </div>
            </div>
            <div className="divide-y divide-slate-800">
              {filteredAnomalies.length === 0 ? (
                <div className="p-12 text-center text-slate-500 italic">No anomalies found matching your search.</div>
              ) : (
                filteredAnomalies.map((event) => (
                  <div 
                    key={event.id}
                    onClick={() => handleAnalyze(event)}
                    className={`p-6 hover:bg-slate-800/50 transition-all cursor-pointer group ${selectedAnomaly?.id === event.id ? 'bg-blue-600/5 ring-1 ring-inset ring-blue-500/20' : ''}`}
                  >
                    <div className="flex gap-4">
                      <div className={`p-3 rounded-xl border shrink-0 ${
                        event.score > 0.9 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
                        event.score > 0.7 ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 
                        'bg-blue-500/10 border-blue-500/20 text-blue-500'
                      }`}>
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-white font-bold">{event.source}</h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(event.timestamp).toLocaleTimeString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                Anomaly Score: <span className="text-white font-mono font-bold">{(event.score * 100).toFixed(0)}%</span>
                              </span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            event.status === 'New' ? 'bg-blue-600 text-white' : 
                            event.status === 'Investigating' ? 'bg-orange-600 text-white' : 
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors line-clamp-2">{event.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-blue-500 transition-colors shrink-0 self-center" />
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl sticky top-24">
            <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex items-center justify-between">
              <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                AI Event Analysis
              </h3>
              {selectedAnomaly && (
                <button 
                  onClick={() => {
                    setSelectedAnomaly(null);
                    setAnalysis(null);
                  }}
                  className="text-slate-500 hover:text-white p-1 hover:bg-slate-800 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="p-6 min-h-[400px]">
              {!selectedAnomaly ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 py-12">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-600">
                    <Activity className="w-8 h-8" />
                  </div>
                  <div className="max-w-[240px]">
                    <p className="text-slate-400 text-sm font-medium">Select an event from the list to perform AI-powered risk assessment.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Subject Description</span>
                    <p className="text-sm text-slate-300 leading-relaxed">{selectedAnomaly.description}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        Gemini Assessment
                      </h4>
                      {isAnalyzing && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                    </div>

                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 relative min-h-[200px]">
                      {isAnalyzing ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50">
                          <span className="text-xs text-slate-500 font-medium">Computing context...</span>
                        </div>
                      ) : analysis ? (
                        <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {analysis}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-700 py-8">
                          <button 
                            onClick={() => handleAnalyze(selectedAnomaly)}
                            className="text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest border border-blue-500/20 px-4 py-2 rounded-lg"
                          >
                            Generate Report
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => onUpdateStatus(selectedAnomaly.id, 'Resolved')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Resolved
                    </button>
                    <button 
                      onClick={() => selectedAnomaly && generateMockLogs(selectedAnomaly)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 border border-slate-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Logs
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Technical Logs Modal */}
      {showLogs && selectedAnomaly && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0c0c0e] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col font-mono">
            <div className="p-4 border-b border-slate-800 bg-[#16161a] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-500/10 rounded border border-blue-500/20">
                  <Terminal className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">System Evidence Stream</h3>
                  <p className="text-[10px] text-slate-500">Source: {selectedAnomaly.source} • Session ID: {selectedAnomaly.id.toUpperCase()}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowLogs(false)}
                className="text-slate-500 hover:text-white p-1 hover:bg-slate-800 rounded transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[#09090b] text-[13px] leading-relaxed">
              <div className="space-y-1">
                <div className="text-slate-600 mb-4 flex items-center gap-2 border-b border-slate-800/50 pb-2">
                  <Shield className="w-4 h-4" />
                  <span>Sentinel Forensic Logger v2.4.1 (Ready)</span>
                </div>
                
                {mockLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 group hover:bg-slate-900/40 p-1 rounded">
                    <span className="text-slate-600 shrink-0 select-none">[{log.time.split('T')[1].replace('Z', '')}]</span>
                    <span className={`font-black shrink-0 w-16 select-none ${
                      log.level === 'ERROR' ? 'text-red-500' : 
                      log.level === 'WARN' ? 'text-orange-500' : 
                      'text-emerald-500'
                    }`}>
                      {log.level}
                    </span>
                    <span className={`${
                      log.level === 'ERROR' ? 'text-slate-200 font-medium' : 
                      log.level === 'WARN' ? 'text-slate-300' : 
                      'text-slate-400'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))}

                <div className="mt-6 flex items-center gap-2 text-blue-500/80">
                  <span className="animate-pulse">_</span>
                  <span className="text-xs italic">End of available stream segment.</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#16161a] flex justify-end gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700">
                <Download className="w-3.5 h-3.5" />
                Download Raw PCAP
              </button>
              <button 
                onClick={() => setShowLogs(false)}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomalyDetection;
