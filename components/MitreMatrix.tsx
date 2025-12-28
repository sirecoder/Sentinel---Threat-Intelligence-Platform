
import React, { useState } from 'react';
import { 
  Info, 
  ExternalLink, 
  ShieldAlert, 
  Layers, 
  Download, 
  ChevronDown,
  FileJson,
  Filter
} from 'lucide-react';

type LayerType = 'Live' | 'APT29' | 'FIN7';

const MITRE_DATA_PRESETS: Record<LayerType, any[]> = {
  'Live': [
    {
      tactic: 'Initial Access',
      techniques: [
        { id: 'T1566', name: 'Phishing', active: true, count: 12, color: 'bg-red-500/20' },
        { id: 'T1190', name: 'Exploit Public-Facing App', active: false },
        { id: 'T1133', name: 'External Remote Services', active: true, count: 4, color: 'bg-orange-500/20' },
        { id: 'T1078', name: 'Valid Accounts', active: false },
      ]
    },
    {
      tactic: 'Execution',
      techniques: [
        { id: 'T1059', name: 'Cmd & Script Interpreter', active: true, count: 8, color: 'bg-red-500/20' },
        { id: 'T1204', name: 'User Execution', active: true, count: 15, color: 'bg-red-500/30' },
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
        { id: 'T1048', name: 'Exfiltration Over Alt Protocol', active: true, count: 2, color: 'bg-blue-500/10' },
        { id: 'T1041', name: 'Exfiltration Over C2 Channel', active: true, count: 5, color: 'bg-blue-500/20' },
      ]
    },
    {
      tactic: 'Command & Control',
      techniques: [
        { id: 'T1071', name: 'Application Layer Protocol', active: true, count: 22, color: 'bg-red-500/40' },
        { id: 'T1105', name: 'Ingress Tool Transfer', active: true, count: 9, color: 'bg-orange-500/20' },
        { id: 'T1573', name: 'Encrypted Channel', active: true, count: 14, color: 'bg-red-500/20' },
      ]
    }
  ],
  'APT29': [
    {
      tactic: 'Initial Access',
      techniques: [
        { id: 'T1566', name: 'Phishing', active: true, count: 'APT29 Priority', color: 'bg-red-600/40' },
        { id: 'T1190', name: 'Exploit Public-Facing App', active: true, count: 'Primary', color: 'bg-red-600/30' },
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
        { id: 'T1078', name: 'Valid Accounts', active: true, count: 'Common', color: 'bg-orange-600/30' },
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

const MitreMatrix: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<LayerType>('Live');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const handleOpenNavigator = () => {
    window.open('https://mitre-attack.github.io/attack-navigator/', '_blank');
  };

  const handleOpenDocumentation = (id: string) => {
    // Standard MITRE ATT&CK technique URL structure
    // Example: https://attack.mitre.org/techniques/T1566/
    const url = `https://attack.mitre.org/techniques/${id.replace('.', '/')}/`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleExportJSON = () => {
    const layerJson = {
      name: `Sentinel - ${selectedLayer} Analysis`,
      versions: { attack: "14", navigator: "4.8.1", layer: "4.4" },
      domain: "enterprise-attack",
      description: `Threat intelligence layer exported from Sentinel for ${selectedLayer} activity.`,
      techniques: MITRE_DATA_PRESETS[selectedLayer].flatMap(t => 
        t.techniques.filter((tech: any) => tech.active).map((tech: any) => ({
          techniqueID: tech.id,
          score: typeof tech.count === 'number' ? tech.count : 100,
          color: "#3b82f6",
          comment: `Detected in Sentinel ${selectedLayer} stream.`
        }))
      )
    };

    const blob = new Blob([JSON.stringify(layerJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel_mitre_${selectedLayer.toLowerCase()}_layer.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentData = MITRE_DATA_PRESETS[selectedLayer];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            MITRE ATT&CK® Matrix
            <span className="px-2 py-0.5 bg-blue-600 text-[10px] font-black uppercase rounded">v14.1</span>
          </h1>
          <p className="text-slate-400">Standardized mapping of environmental behavior to global adversary tactics.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors text-sm font-medium border border-slate-700 min-w-[180px] justify-between shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>{selectedLayer === 'Live' ? 'Live Detections' : `${selectedLayer} Profile`}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showLayerMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showLayerMenu && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-2 space-y-1">
                  {(['Live', 'APT29', 'FIN7'] as LayerType[]).map((layer) => (
                    <button
                      key={layer}
                      onClick={() => { setSelectedLayer(layer); setShowLayerMenu(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                        selectedLayer === layer ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="font-bold">{layer === 'Live' ? 'Internal: Live Stream' : `Intel: ${layer} Group`}</span>
                      {selectedLayer === layer && <ShieldAlert className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:text-white transition-colors text-sm font-medium border border-slate-700"
            title="Export Layer for MITRE Navigator"
          >
            <FileJson className="w-4 h-4" />
            Export Layer
          </button>

          <button 
            onClick={handleOpenNavigator}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-medium shadow-lg shadow-blue-500/20"
          >
            <ExternalLink className="w-4 h-4" />
            Official Navigator
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {currentData.map((col) => (
          <div key={col.tactic} className="space-y-3">
            <div className="bg-slate-900 border border-slate-800 p-3 border-b-2 border-blue-500 rounded-t-lg shadow-sm">
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">{col.tactic}</h3>
            </div>
            <div className="space-y-2">
              {col.techniques.map((tech: any) => (
                <div 
                  key={tech.id}
                  className={`p-3 rounded-lg border transition-all cursor-help group relative ${
                    tech.active 
                    ? `${tech.color || 'bg-blue-500/10'} border-blue-500/30 hover:border-blue-500` 
                    : 'bg-slate-900/40 border-slate-800/50 hover:border-slate-700 text-slate-600 opacity-40'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[9px] font-bold ${tech.active ? 'text-blue-400' : 'text-slate-600'}`}>
                      {tech.id}
                    </span>
                    {tech.active && (
                      <span className="bg-slate-950 text-blue-400 text-[8px] px-1.5 py-0.5 rounded font-black border border-blue-500/20">
                        {tech.count}
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] font-bold mt-1 leading-tight ${tech.active ? 'text-white' : 'text-slate-700'}`}>
                    {tech.name}
                  </p>
                  
                  {/* Enhanced Tooltip */}
                  <div className="absolute z-50 left-0 top-full mt-2 w-56 p-4 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-95 group-hover:scale-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-[10px] font-black text-white uppercase">{tech.id}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Adversary behavior involving <span className="text-white">{tech.name}</span> detected. 
                      {selectedLayer === 'Live' 
                        ? ` Found in ${tech.count || 0} local events.`
                        : ` This is a high-confidence TTP for ${selectedLayer}.`}
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col gap-2">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenDocumentation(tech.id);
                        }}
                        className="pointer-events-auto text-[9px] text-blue-400 font-bold flex items-center gap-1 hover:text-blue-300 transition-colors uppercase"
                      >
                        VIEW DOCUMENTATION <ExternalLink className="w-2 h-2" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mt-8 flex flex-col md:flex-row items-center gap-6 shadow-xl">
        <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
          <ShieldAlert className="w-8 h-8 text-blue-500" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-white font-bold text-lg">Cross-Layer Intel Analysis</h4>
          <p className="text-sm text-slate-400 max-w-2xl">
            You are viewing the <span className="text-blue-400 font-bold">{selectedLayer}</span> intelligence layer. 
            Sentinel uses this data to prioritize alerts. 12 matching TTPs have been identified between your live stream and global adversary profiles.
          </p>
        </div>
        <div className="flex gap-6 px-8 border-l border-slate-800">
          <div className="text-center">
            <span className="block text-3xl font-bold text-white font-mono">12</span>
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Overlaps</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold text-emerald-400 font-mono">84%</span>
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Confidence</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MitreMatrix;
