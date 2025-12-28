
import React, { useState, useRef, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  Loader2,
  Trash2,
  Zap,
  X,
  Camera,
  Upload,
  Eye,
  FileSearch,
  Clock,
  Settings2,
  AlertCircle,
  ZoomIn,
  Maximize2,
  ChevronDown
} from 'lucide-react';
import { IoCRecord, IoCType } from '../types';
import { enrichIoC, analyzeVisualForensics } from '../services/geminiService';

interface IoCManagerProps {
  iocs: IoCRecord[];
  onDelete: (id: string) => void;
  onAdd: (ioc: IoCRecord) => void;
  onBulkCleanup: (ids: string[]) => void;
  globalSearch: string;
}

const IoCManager: React.FC<IoCManagerProps> = ({ iocs, onDelete, onAdd, onBulkCleanup, globalSearch }) => {
  const [localSearch, setLocalSearch] = useState('');
  const [selectedIoC, setSelectedIoC] = useState<IoCRecord | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExpirySettings, setShowExpirySettings] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [forensicPreview, setForensicPreview] = useState<string | null>(null);
  const [expiryThreshold, setExpiryThreshold] = useState(90); // Default 90 days
  const [showZoomModal, setShowZoomModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const processedIocs = useMemo(() => {
    const now = new Date();
    return iocs.map(ioc => {
      const lastSeenDate = new Date(ioc.lastSeen);
      const diffTime = Math.abs(now.getTime() - lastSeenDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const isExpired = diffDays > expiryThreshold;
      
      return {
        ...ioc,
        calculatedStatus: isExpired ? 'Expired' : ioc.status,
        daysOld: diffDays
      };
    });
  }, [iocs, expiryThreshold]);

  const activeSearch = globalSearch || localSearch;
  const filteredIocs = processedIocs.filter(ioc => 
    ioc.value.toLowerCase().includes(activeSearch.toLowerCase()) ||
    ioc.tags.some(tag => tag.toLowerCase().includes(activeSearch.toLowerCase())) ||
    ioc.type.toLowerCase().includes(activeSearch.toLowerCase())
  );

  const expiredCount = processedIocs.filter(i => i.calculatedStatus === 'Expired').length;

  const handleEnrich = async (ioc: IoCRecord) => {
    setIsEnriching(true);
    setEnrichmentData(null);
    setForensicPreview(null);
    setSelectedIoC(ioc);
    
    const result = await enrichIoC(ioc.value, ioc.type);
    setEnrichmentData(result);
    setIsEnriching(false);
  };

  const handleBulkCleanup = () => {
    const expiredIds = processedIocs
      .filter(i => i.calculatedStatus === 'Expired')
      .map(i => i.id);
    
    if (expiredIds.length === 0) return;
    
    if (confirm(`Are you sure you want to remove ${expiredIds.length} expired indicators?`)) {
      onBulkCleanup(expiredIds);
    }
  };

  const handleVTLookup = () => {
    if (!selectedIoC) return;
    const url = `https://www.virustotal.com/gui/search/${encodeURIComponent(selectedIoC.value)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingImage(true);
    setEnrichmentData(null);
    setForensicPreview(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setForensicPreview(base64Data);
      
      const base64Content = base64Data.split(',')[1];
      try {
        const result = await analyzeVisualForensics(base64Content, file.type);
        setEnrichmentData(result);
      } catch (error) {
        setEnrichmentData("Error analyzing image forensics. Please try again.");
      } finally {
        setIsAnalyzingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const [newIoC, setNewIoC] = useState({
    value: '',
    type: 'IP' as IoCType,
    threatLevel: 'Medium' as IoCRecord['threatLevel'],
    tags: ''
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      value: newIoC.value,
      type: newIoC.type,
      threatLevel: newIoC.threatLevel,
      confidence: 50,
      lastSeen: new Date().toISOString(),
      tags: newIoC.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: 'Active',
      description: 'Manually added indicator.'
    });
    setNewIoC({ value: '', type: 'IP', threatLevel: 'Medium', tags: '' });
    setShowAddModal(false);
  };

  const clearAnalysis = () => {
    setEnrichmentData(null);
    setForensicPreview(null);
    setShowZoomModal(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)]">
      <div className={`flex flex-col flex-1 min-w-0 ${selectedIoC ? 'lg:max-w-[60%]' : 'w-full'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">IoC Management</h1>
            <p className="text-xs md:text-sm text-slate-400">Database of Indicators of Compromise.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none" ref={settingsRef}>
              <button 
                onClick={() => setShowExpirySettings(!showExpirySettings)}
                className={`w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors text-xs md:text-sm font-medium border border-slate-700 ${showExpirySettings ? 'bg-slate-700 text-white' : ''}`}
              >
                <Settings2 className="w-4 h-4" />
                <span className="hidden md:inline">Expiry Policy</span>
              </button>
              
              {showExpirySettings && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Auto-Expiration Rules</h4>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Expiration Window</span>
                        <span className="text-blue-400 font-bold">{expiryThreshold} Days</span>
                      </div>
                      <input 
                        type="range" 
                        min="7" 
                        max="180" 
                        step="1" 
                        value={expiryThreshold} 
                        onChange={(e) => setExpiryThreshold(parseInt(e.target.value))}
                        className="w-full accent-blue-600 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                      />
                    </div>
                    <div className="pt-2 border-t border-slate-800">
                      <button 
                        onClick={handleBulkCleanup}
                        disabled={expiredCount === 0}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-all border border-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Cleanup {expiredCount} Expired IoCs
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors text-xs md:text-sm font-medium border border-slate-700">
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-xs md:text-sm font-medium shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              Add IoC
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col flex-1 shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-800/20 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search indicators..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-white transition-all"
              />
            </div>
            {expiredCount > 0 && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg shrink-0">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-tight">{expiredCount} STALE INDICATORS</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto flex-1 scrollbar-thin scrollbar-thumb-slate-800">
            <table className="w-full text-left border-collapse min-w-[600px] lg:min-w-0">
              <thead className="sticky top-0 bg-slate-900 shadow-sm z-10">
                <tr className="border-b border-slate-800">
                  <th className="px-4 md:px-6 py-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Indicator</th>
                  <th className="px-4 md:px-6 py-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 md:px-6 py-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 md:px-6 py-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Level</th>
                  <th className="px-4 md:px-6 py-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredIocs.map((ioc) => (
                  <tr 
                    key={ioc.id} 
                    className={`hover:bg-slate-800/50 transition-colors cursor-pointer group ${selectedIoC?.id === ioc.id ? 'bg-blue-600/5' : ''} ${ioc.calculatedStatus === 'Expired' ? 'opacity-60 grayscale-[0.5]' : ''}`}
                    onClick={() => { setSelectedIoC(ioc); clearAnalysis(); }}
                  >
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs md:text-sm font-mono text-white truncate max-w-[120px] md:max-w-[200px]">{ioc.value}</span>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {ioc.tags.map(tag => (
                            <span key={tag} className="text-[8px] md:text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter w-fit ${
                          ioc.calculatedStatus === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 
                          ioc.calculatedStatus === 'Expired' ? 'bg-red-500/10 text-red-400' : 
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {ioc.calculatedStatus}
                        </span>
                        <span className="text-[9px] md:text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {ioc.daysOld}d
                        </span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className="text-[10px] md:text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded-full font-medium">
                        {ioc.type}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`text-[10px] md:text-xs font-bold ${
                        ioc.threatLevel === 'Critical' ? 'text-red-500' :
                        ioc.threatLevel === 'High' ? 'text-orange-500' :
                        'text-blue-500'
                      }`}>
                        {ioc.threatLevel}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEnrich(ioc); }}
                          className="p-1.5 bg-blue-600/10 text-blue-400 rounded-lg hover:bg-blue-600/20 transition-colors"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedIoC && (
        <div className="flex flex-col lg:w-[40%] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in lg:slide-in-from-right-4 duration-300">
          <div className="p-4 md:p-6 border-b border-slate-800 bg-slate-800/30">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <ShieldAlert className={`w-6 h-6 md:w-8 md:h-8 ${
                  selectedIoC.threatLevel === 'Critical' ? 'text-red-500' : 'text-blue-500'
                }`} />
              </div>
              <button 
                onClick={() => { setSelectedIoC(null); clearAnalysis(); }}
                className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white font-mono break-all mb-1">{selectedIoC.value}</h2>
            <div className="flex flex-wrap items-center gap-3">
               <p className="text-slate-400 text-xs md:text-sm">Status: <span className="text-emerald-400 font-medium">{selectedIoC.status}</span></p>
               <span className="hidden md:block w-1 h-1 bg-slate-700 rounded-full" />
               <p className="text-slate-500 text-[10px] md:text-sm">Seen: {new Date(selectedIoC.lastSeen).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => handleEnrich(selectedIoC)}
                disabled={isEnriching || isAnalyzingImage}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2.5 rounded-xl transition-all font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {isEnriching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Run Enrichment
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isEnriching || isAnalyzingImage}
                className="py-2.5 sm:px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-all flex items-center justify-center disabled:opacity-50"
                title="Visual Forensics (Upload Screenshot)"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-800 p-0 overflow-hidden relative min-h-[240px] flex flex-col">
              {isEnriching || isAnalyzingImage ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-20 backdrop-blur-sm">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                  </div>
                  <span className="text-xs text-blue-400 font-bold uppercase tracking-widest">{isAnalyzingImage ? 'Analyzing' : 'Querying Intel'}</span>
                </div>
              ) : enrichmentData || forensicPreview ? (
                <div className="flex flex-col animate-in fade-in duration-300">
                  <div className="p-3 md:p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-blue-400" />
                      <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
                        {forensicPreview ? 'Visual Forensic Analysis' : 'Intel Report'}
                      </span>
                    </div>
                    <button onClick={clearAnalysis} className="text-slate-500 hover:text-white"><X className="w-3 h-3" /></button>
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {forensicPreview && (
                      <div className="p-2 bg-slate-900 border-b border-slate-800">
                        <div 
                          className="relative group cursor-zoom-in"
                          onClick={() => setShowZoomModal(true)}
                        >
                          <img src={forensicPreview} alt="Forensic Source" className="w-full h-32 object-contain rounded-lg bg-black" />
                        </div>
                      </div>
                    )}

                    <div className="p-4 md:p-5 prose prose-invert prose-xs md:prose-sm max-w-none text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {enrichmentData}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[200px] text-slate-700 text-center px-6">
                  <ShieldAlert className="w-8 h-8 opacity-20 mb-3" />
                  <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wide">Analysis Engine Idle</p>
                </div>
              )}
            </div>

            <div className="space-y-4 pb-4">
              <h3 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Indicator Context</h3>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                  {selectedIoC.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-800/20 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleVTLookup}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-colors border border-slate-700"
            >
              <ExternalLink className="w-4 h-4" />
              VirusTotal
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-xs md:text-sm font-bold transition-colors shadow-lg shadow-blue-500/10">
              Block IoC
            </button>
          </div>
        </div>
      )}

      {/* Modal overlays omitted for brevity but they follow the same responsive container pattern */}

      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Manual IoC Entry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Indicator Value</label>
                <input required type="text" value={newIoC.value} onChange={e => setNewIoC(prev => ({ ...prev, value: e.target.value }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</label>
                  <select value={newIoC.type} onChange={e => setNewIoC(prev => ({ ...prev, type: e.target.value as IoCType }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-xs">
                    <option value="IP">IP</option><option value="Domain">Domain</option><option value="Hash">Hash</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Level</label>
                  <select value={newIoC.threatLevel} onChange={e => setNewIoC(prev => ({ ...prev, threatLevel: e.target.value as any }))} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-white text-xs">
                    <option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-4 shadow-lg shadow-blue-500/20">Create Indicator</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IoCManager;
