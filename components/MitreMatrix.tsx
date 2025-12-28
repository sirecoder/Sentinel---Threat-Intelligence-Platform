
import React, { useState } from 'react';
import { 
  Info, 
  ExternalLink, 
  ShieldAlert, 
  Layers, 
  Download, 
  ChevronDown,
  FileJson,
  Filter,
  X,
  Loader2,
  Zap,
  ShieldCheck,
  Search,
  Eye,
  GitCompare,
  ArrowRightLeft
} from 'lucide-react';
import { getMitreTechniqueDetails } from '../services/geminiService';

type LayerType = 'Live' | 'APT29' | 'FIN7';

interface MitreMatrixProps {
  onNavigate?: (tab: string) => void;
  onHuntRequest?: (target: string) => void;
}

const MITRE_DATA_PRESETS: Record<LayerType, any[]> = {
  'Live': [
    {
      tactic: 'Initial Access',
      techniques: [
        { id: 'T1566', name: 'Phishing', active: true, count: 12, color: 'bg-blue-500/20' },
        { id: 'T1190', name: 'Exploit Public-Facing App', active: false },
        { id: 'T1133', name: 'External Remote Services', active: true, count: 4, color: 'bg-blue-500/20' },
        { id: 'T1078', name: 'Valid Accounts', active: false },
      ]
    },
    {
      tactic: 'Execution',
      techniques: [
        { id: 'T1059', name: 'Cmd & Script Interpreter', active: true, count: 8, color: 'bg-blue-500/20' },
        { id: 'T1204', name: 'User Execution', active: true, count: 15, color: 'bg-blue-500/20' },
        { id: 'T1053', name: 'Scheduled Task/Job', active: false },
        { id: 'T1072', name: 'Software Deployment', active: false },
      ]
    },
    {
      tactic: 'Persistence',
      techniques: [
        { id: 'T1547', name: 'Boot or Logon Autostart', active: true, count: 3, color: 'bg-blue-500/20' },
        { id: 'T1136', name: 'Create Account', active: false },
        { id: 'T1574', name: 'Hijack Execution Flow', active: false },
      ]
    },
    {
      tactic: 'Exfiltration',
      techniques: [
        { id: 'T1048', name: 'Exfiltration Over Alt Protocol', active: true, count: 2, color: 'bg-blue-500/20' },
        { id: 'T1041', name: 'Exfiltration Over C2 Channel', active: true, count: 5, color: 'bg-blue-500/20' },
      ]
    },
    {
      tactic: 'Command & Control',
      techniques: [
        { id: 'T1071', name: 'Application Layer Protocol', active: true, count: 22, color: 'bg-blue-500/40' },
        { id: 'T1105', name: 'Ingress Tool Transfer', active: true, count: 9, color: 'bg-blue-500/20' },
        { id: 'T1573', name: 'Encrypted Channel', active: true, count: 14, color: 'bg-blue-500/20' },
      ]
    }
  ],
  'APT29': [
    {
      tactic: 'Initial Access',
      techniques: [
        { id: 'T1566', name: 'Phishing', active: true, count: 'Priority', color: 'bg-red-600/40' },
        { id: 'T1190', name: 'Exploit Public-Facing App', active: true, count: 'Primary', color: 'bg-red-600/30' },
        { id: 'T1078', name: 'Valid Accounts', active: true, count: 'Secondary', color: 'bg-red-600/20' },
      ]
    },
    {
      tactic: 'Execution',
      techniques: [
        { id: 'T1059', name: 'PowerShell', active: true, count: 'Signature', color: 'bg-red-600/50' },
      ]
    },
    {
      tactic: 'Persistence',
      techniques: [
        { id: 'T1078', name: 'Valid Accounts', active: true, count: 'Common', color: 'bg-red-600/30' },
      ]
    },
    {
      tactic: 'Exfiltration',
      techniques: [
        { id: 'T1041', name: 'Exfiltration Over C2 Channel', active: true, count: 'High', color: 'bg-red-600/30' },
      ]
    }
  ],
  'FIN7': [
    {
      tactic: 'Initial Access',
      techniques: [
        { id: 'T1566', name: 'Phishing', active: true, count: 'High', color: 'bg-emerald-500/30' },
      ]
    },
    {
      tactic: 'Execution',
      techniques: [
        { id: 'T1204', name: 'Malicious File', active: true, count: 'Critical', color: 'bg-emerald-500/40' },
      ]
    }
  ]
};

const MitreMatrix: React.FC<MitreMatrixProps> = ({ onNavigate, onHuntRequest }) => {
  const [selectedLayer, setSelectedLayer] = useState<LayerType>('Live');
  const [comparisonLayer, setComparisonLayer] = useState<LayerType | null>(null);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showCompareMenu, setShowCompareMenu] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<any | null>(null);
  const [isFetchingIntel, setIsFetchingIntel] = useState(false);
  const [techniqueIntel, setTechniqueIntel] = useState<string | null>(null);

  const handleOpenNavigator = () => {
    window.open('https://mitre-attack.github.io/attack-navigator/', '_blank');
  };

  const handleOpenDocumentation = (id: string) => {
    const url = `https://attack.mitre.org/techniques/${id.replace('.', '/')}/`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTechniqueClick = async (tech: any) => {
    setSelectedTechnique(tech);
    setIsFetchingIntel(true);
    setTechniqueIntel(null);
    
    const intel = await getMitreTechniqueDetails(tech.id, tech.name);
    setTechniqueIntel(intel);
    setIsFetchingIntel(false);
  };

  const handleStartHunt = () => {
    if (selectedTechnique && onHuntRequest && onNavigate) {
      onHuntRequest(`${selectedTechnique.name} (${selectedTechnique.id})`);
      onNavigate('hunting');
      setSelectedTechnique(null);
    }
  };

  const getTechniqueDiff = (tacticName: string, techId: string) => {
    const primaryTactic = MITRE_DATA_PRESETS[selectedLayer].find(t => t.tactic === tacticName);
    const primaryTech = primaryTactic?.techniques.find((t: any) => t.id === techId);
    const isPrimaryActive = primaryTech?.active;

    if (!comparisonLayer) return { active: isPrimaryActive, tech: primaryTech, mode: 'single' };

    const secondaryTactic = MITRE_DATA_PRESETS[comparisonLayer].find(t => t.tactic === tacticName);
    const secondaryTech = secondaryTactic?.techniques.find((t: any) => t.id === techId);
    const isSecondaryActive = secondaryTech?.active;

    if (isPrimaryActive && isSecondaryActive) return { active: true, tech: primaryTech, mode: 'both' };
    if (isPrimaryActive) return { active: true, tech: primaryTech, mode: 'primary' };
    if (isSecondaryActive) return { active: true, tech: secondaryTech, mode: 'secondary' };

    return { active: false, tech: primaryTech || secondaryTech, mode: 'none' };
  };

  const currentData = MITRE_DATA_PRESETS[selectedLayer];
  // To ensure we show all techniques from both layers if comparing, we need a set of tactics
  const allTactics = Array.from(new Set([
    ...MITRE_DATA_PRESETS[selectedLayer].map(t => t.tactic),
    ...(comparisonLayer ? MITRE_DATA_PRESETS[comparisonLayer].map(t => t.tactic) : [])
  ]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            MITRE ATT&CK® Matrix
            <span className="px-2 py-0.5 bg-blue-600 text-[10px] font-black uppercase rounded">v14.1</span>
          </h1>
          <p className="text-slate-400"> Adhering to the Unified Cyber Kill Chain methodology.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          {/* Base Layer Selection */}
          <div className="relative">
            <button 
              onClick={() => { setShowLayerMenu(!showLayerMenu); setShowCompareMenu(false); }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors text-sm font-medium border border-slate-700 min-w-[160px] justify-between shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>{selectedLayer}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showLayerMenu ? 'rotate-180' : ''}`} />
            </button>
            {showLayerMenu && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-2 space-y-1">
                  {(['Live', 'APT29', 'FIN7'] as LayerType[]).map((layer) => (
                    <button
                      key={layer}
                      onClick={() => { setSelectedLayer(layer); setShowLayerMenu(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                        selectedLayer === layer ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="font-bold">{layer}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ArrowRightLeft className="w-4 h-4 text-slate-600 hidden xl:block" />

          {/* Comparison Layer Selection */}
          <div className="relative">
            <button 
              onClick={() => { setShowCompareMenu(!showCompareMenu); setShowLayerMenu(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium border min-w-[160px] justify-between shadow-lg ${
                comparisonLayer 
                ? 'bg-purple-900/20 border-purple-500/50 text-purple-400 hover:text-purple-300' 
                : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4" />
                <span>{comparisonLayer ? `Diff: ${comparisonLayer}` : 'Compare Layer...'}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showCompareMenu ? 'rotate-180' : ''}`} />
            </button>
            {showCompareMenu && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => { setComparisonLayer(null); setShowCompareMenu(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                      comparisonLayer === null ? 'bg-slate-700 text-white' : 'text-slate-500 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="font-bold italic text-slate-500">None (Disable Diff)</span>
                    {comparisonLayer === null && <X className="w-3 h-3" />}
                  </button>
                  {(['Live', 'APT29', 'FIN7'] as LayerType[]).map((layer) => (
                    layer !== selectedLayer && (
                      <button
                        key={layer}
                        onClick={() => { setComparisonLayer(layer); setShowCompareMenu(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                          comparisonLayer === layer ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span className="font-bold">{layer}</span>
                      </button>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-800 mx-2 hidden xl:block" />

          <button 
            onClick={handleOpenNavigator}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium shadow-lg shadow-blue-500/20"
          >
            <ExternalLink className="w-4 h-4" />
            Official Navigator
          </button>
        </div>
      </div>

      {/* Matrix Header / Tactics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {allTactics.map((tacticName) => {
          const primaryTactic = MITRE_DATA_PRESETS[selectedLayer].find(t => t.tactic === tacticName);
          const secondaryTactic = comparisonLayer ? MITRE_DATA_PRESETS[comparisonLayer].find(t => t.tactic === tacticName) : null;
          
          // Merge unique techniques from both for full matrix coverage
          const techniquesList = Array.from(new Set([
            ...(primaryTactic?.techniques.map((t: any) => t.id) || []),
            ...(secondaryTactic?.techniques.map((t: any) => t.id) || [])
          ])).sort();

          return (
            <div key={tacticName} className="space-y-3">
              <div className="bg-slate-900 border border-slate-800 p-3 border-b-2 border-blue-500 rounded-t-lg shadow-sm">
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">{tacticName}</h3>
              </div>
              <div className="space-y-2">
                {techniquesList.map((techId) => {
                  const diff = getTechniqueDiff(tacticName, techId);
                  const tech = diff.tech;
                  
                  let cardStyle = "bg-slate-900/40 border-slate-800/50 text-slate-600 opacity-40";
                  let badgeStyle = "bg-slate-950 text-slate-700 border-slate-800";
                  
                  if (diff.mode === 'single' && diff.active) {
                    cardStyle = "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:border-blue-500 hover:scale-[1.02] active:scale-[0.98]";
                    badgeStyle = "bg-slate-950 text-blue-400 border-blue-500/20";
                  } else if (diff.mode === 'primary') {
                    cardStyle = "bg-blue-500/10 border-blue-500/40 text-blue-400 hover:border-blue-500 hover:scale-[1.02]";
                    badgeStyle = "bg-slate-950 text-blue-400 border-blue-500/20";
                  } else if (diff.mode === 'secondary') {
                    cardStyle = "bg-orange-500/10 border-orange-500/40 text-orange-400 hover:border-orange-500 hover:scale-[1.02]";
                    badgeStyle = "bg-slate-950 text-orange-400 border-orange-500/20";
                  } else if (diff.mode === 'both') {
                    cardStyle = "bg-purple-500/10 border-purple-500/50 text-purple-400 hover:border-purple-500 hover:scale-[1.02] ring-1 ring-purple-500/20";
                    badgeStyle = "bg-purple-600 text-white border-purple-400/30";
                  }

                  return (
                    <button 
                      key={techId}
                      onClick={() => diff.active && handleTechniqueClick(tech)}
                      className={`w-full text-left p-3 rounded-lg border transition-all group relative block ${cardStyle}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[9px] font-bold ${diff.active ? '' : 'text-slate-600'}`}>
                          {techId}
                        </span>
                        {diff.active && (
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black border transition-colors ${badgeStyle}`}>
                            {tech.count || '1'}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] font-bold mt-1 leading-tight ${diff.active ? 'text-white' : 'text-slate-700'}`}>
                        {tech?.name || 'Unknown Technique'}
                      </p>
                      
                      {/* Layer Markers */}
                      {comparisonLayer && diff.active && (
                        <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                           {(diff.mode === 'primary' || diff.mode === 'both') && <div className="w-1 h-1 bg-blue-500 rounded-full" />}
                           {(diff.mode === 'secondary' || diff.mode === 'both') && <div className="w-1 h-1 bg-orange-500 rounded-full" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary / Legend Footer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mt-8 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
              <GitCompare className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">
                {comparisonLayer ? 'Layer Intelligence Comparison' : 'Active Intel Strategy'}
              </h4>
              <p className="text-sm text-slate-400">
                {comparisonLayer 
                  ? `Differencing ${selectedLayer} against ${comparisonLayer} to identify coverage overlaps and gaps.` 
                  : `Currently inspecting the ${selectedLayer} layer for tactical alignment.`
                }
              </p>
            </div>
          </div>
          
          {comparisonLayer && (
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500/20 border border-blue-500/50 rounded" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedLayer} Only</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500/20 border border-orange-500/50 rounded" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{comparisonLayer} Only</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500/20 border border-purple-500/50 rounded" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Technique Overlap</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-6 px-8 border-l border-slate-800">
          <div className="text-center">
            <span className="block text-3xl font-bold text-white font-mono">
              {MITRE_DATA_PRESETS[selectedLayer].reduce((acc, t) => acc + t.techniques.filter((te: any) => te.active).length, 0)}
            </span>
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Active TTPs</span>
          </div>
          {comparisonLayer && (
            <div className="text-center border-l border-slate-800 pl-6">
              <span className="block text-3xl font-bold text-purple-400 font-mono">
                {/* Simple intersection calc */}
                {(() => {
                  let overlaps = 0;
                  MITRE_DATA_PRESETS[selectedLayer].forEach(t1 => {
                    const t2 = MITRE_DATA_PRESETS[comparisonLayer!].find(tx => tx.tactic === t1.tactic);
                    if (t2) {
                      t1.techniques.forEach((tech1: any) => {
                        if (tech1.active && t2.techniques.find((tech2: any) => tech2.id === tech1.id && tech2.active)) {
                          overlaps++;
                        }
                      });
                    }
                  });
                  return overlaps;
                })()}
              </span>
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Direct Match</span>
            </div>
          )}
        </div>
      </div>

      {/* Technique Intelligence Modal */}
      {selectedTechnique && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${selectedTechnique.active ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedTechnique.name}
                    <span className="text-xs font-mono text-slate-500">[{selectedTechnique.id}]</span>
                  </h3>
                  <p className="text-xs text-slate-500">Enterprise Adversary Technique Intelligence</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTechnique(null)}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-950/30">
              {isFetchingIntel ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <Zap className="w-4 h-4 text-blue-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold">Synthesizing Technique Briefing...</p>
                    <p className="text-xs text-slate-500 mt-1">Fetching global adversary patterns and mitigation data.</p>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {techniqueIntel ? (
                    <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {techniqueIntel}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-red-400 border border-red-500/20 bg-red-500/5 rounded-xl">
                      Failed to generate adversary intelligence for this technique.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex gap-3">
              <button 
                onClick={() => handleOpenDocumentation(selectedTechnique.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
              >
                <ExternalLink className="w-4 h-4" />
                View MITRE Documentation
              </button>
              <button 
                onClick={handleStartHunt}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
              >
                <Search className="w-4 h-4" />
                Launch Threat Hunt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MitreMatrix;
