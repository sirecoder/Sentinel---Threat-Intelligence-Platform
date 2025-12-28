
import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Play, 
  ShieldCheck, 
  Terminal as TerminalIcon, 
  Loader2, 
  ShieldAlert, 
  History, 
  Cpu, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ShieldX,
  Database,
  Globe,
  Settings,
  Trash2
} from 'lucide-react';
import { MitigationPlaybook, MitigationTask, UserRole } from '../types';

const MOCK_PLAYBOOKS: MitigationPlaybook[] = [
  {
    id: 'pb-1',
    name: 'Ransomware Containment',
    description: 'Automated isolation of affected subnets and mandatory credential rotation for high-privilege accounts.',
    target: 'Network',
    severity: 'Critical',
    steps: ['Isolate V-LAN 42', 'Revoke Kerberos Tickets', 'Initiate Volume Shadow Copy Backup']
  },
  {
    id: 'pb-2',
    name: 'Brute Force Suppression',
    description: 'Temporary blacklisting of origin IPs across global perimeter firewalls.',
    target: 'Network',
    severity: 'Standard',
    steps: ['Query SIEM for Source IPs', 'Inject FW Rules', 'Notify Security Lead']
  },
  {
    id: 'pb-3',
    name: 'Phishing URL Takedown',
    description: 'Correlation of reported domains with DNS blocklists and local host file injection.',
    target: 'Identity',
    severity: 'Elevated',
    steps: ['Parse Domain from URL', 'Update DNS Filter', 'Purge O365 Inbox Instances']
  }
];

interface MitigationConsoleProps {
  userRole: UserRole;
}

const MitigationConsole: React.FC<MitigationConsoleProps> = ({ userRole }) => {
  // Use a Set to track multiple active executions independently
  const [executingPlaybookIds, setExecutingPlaybookIds] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<MitigationTask[]>([]);
  const [logs, setLogs] = useState<{msg: string, type: 'info' | 'exec' | 'success', timestamp: string}[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  
  const userLevel = userRole.includes('Tier-3') ? 3 : userRole.includes('Tier-2') ? 2 : 1;

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (msg: string, type: 'info' | 'exec' | 'success' = 'info') => {
    setLogs(prev => [...prev, {
      msg,
      type,
      timestamp: new Date().toLocaleTimeString().split(' ')[0]
    }].slice(-100)); // Keep last 100 lines
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('[SYSTEM] Log buffer flushed. Terminal reset.', 'info');
  };

  const handleExecute = (playbook: MitigationPlaybook) => {
    // Permission check
    if (userLevel < 3 && playbook.severity === 'Critical') return;
    
    // Prevent double execution of same playbook
    if (executingPlaybookIds.has(playbook.id)) return;

    const taskId = `task-${Math.random().toString(36).substr(2, 5)}`;
    const newTask: MitigationTask = {
      id: taskId,
      playbookId: playbook.id,
      status: 'Executing',
      initiatedBy: 'Sarah Connor',
      timestamp: new Date().toISOString(),
      logs: []
    };

    // Add this playbook to active execution set
    setExecutingPlaybookIds(prev => new Set(prev).add(playbook.id));
    addLog(`[SYSTEM] Initializing Playbook: ${playbook.name}`, 'info');

    // Simulate Step-by-Step Execution for this specific instance
    playbook.steps.forEach((step, index) => {
      setTimeout(() => {
        addLog(`[${playbook.name}] Step ${index + 1}: ${step}`, 'exec');
        
        // Final step logic
        if (index === playbook.steps.length - 1) {
          setTimeout(() => {
            // Remove only this playbook ID from the active set
            setExecutingPlaybookIds(prev => {
              const next = new Set(prev);
              next.delete(playbook.id);
              return next;
            });
            
            setHistory(prev => [{ ...newTask, status: 'Completed' }, ...prev]);
            addLog(`[SUCCESS] ${playbook.name} Deployment Verified.`, 'success');
          }, 1500);
        }
      }, (index + 1) * 2000);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Zap className="w-7 h-7 text-orange-500" />
            Active Mitigation Console
          </h1>
          <p className="text-slate-400">Orchestrating response playbooks across enterprise infrastructure.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Response Nodes: Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playbook Library */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_PLAYBOOKS.map((pb) => {
              const isRunning = executingPlaybookIds.has(pb.id);
              
              return (
                <div key={pb.id} className={`bg-slate-900 border rounded-2xl p-6 transition-all flex flex-col shadow-xl ${isRunning ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-800 hover:border-slate-700'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl border ${pb.severity === 'Critical' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${pb.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                        {pb.severity} RISK
                      </span>
                      {isRunning && (
                        <span className="text-[8px] font-black text-blue-500 animate-pulse uppercase tracking-widest">Executing...</span>
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{pb.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6 flex-1">{pb.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {pb.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                        <div className={`w-1 h-1 rounded-full ${isRunning ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`} />
                        {step}
                      </div>
                    ))}
                  </div>

                  {userLevel < 3 && pb.severity === 'Critical' ? (
                    <div className="flex items-center justify-center gap-2 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-700">
                      <Lock className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">T3 Authorization Required</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleExecute(pb)}
                      disabled={isRunning}
                      className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                        isRunning 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 cursor-wait' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-[0.98]'
                      }`}
                    >
                      {isRunning ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Nodes</>
                      ) : (
                        <><Play className="w-4 h-4 fill-current" /> Deploy Playbook</>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tactical Monitor */}
        <div className="space-y-6">
          <div className="bg-[#020617] border border-slate-800 rounded-2xl p-6 shadow-2xl h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <TerminalIcon className="w-3 h-3 text-blue-500" />
                Response Command Line
              </h3>
              <div className="flex items-center gap-3">
                {executingPlaybookIds.size > 0 && (
                  <span className="text-[9px] font-bold text-blue-500 animate-pulse">
                    {executingPlaybookIds.size} ACTIVE OPS
                  </span>
                )}
                <button 
                  onClick={clearLogs}
                  className="p-1.5 text-slate-600 hover:text-white hover:bg-slate-800 rounded transition-all"
                  title="Clear Terminal"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-black/60 rounded-xl p-4 font-mono text-[10px] overflow-y-auto space-y-1.5 shadow-inner scrollbar-thin scrollbar-thumb-slate-800">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-2">
                  <Cpu className="w-10 h-10" />
                  <p className="uppercase font-black tracking-widest">Awaiting Command Stream...</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`flex gap-3 animate-in fade-in slide-in-from-left-1 duration-200 ${
                    log.type === 'success' ? 'text-emerald-400' : 
                    log.type === 'exec' ? 'text-blue-400' : 
                    'text-slate-500'
                  }`}>
                    <span className="opacity-40 shrink-0">[{log.timestamp}]</span>
                    <span className="leading-relaxed">{log.msg}</span>
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
              {executingPlaybookIds.size > 0 && (
                <div className="flex gap-2 animate-pulse text-blue-500">
                  <span className="font-black">_</span>
                  <span className="w-1.5 h-3 bg-blue-500/50" />
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <History className="w-3 h-3" /> Execution History
             </h3>
             <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-[10px] text-slate-600 italic text-center py-4">No recent deployments recorded.</p>
                ) : (
                  history.slice(0, 3).map((h) => (
                    <div key={h.id} className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between group animate-in fade-in">
                       <div className="min-w-0">
                         <p className="text-[10px] font-bold text-white truncate">{MOCK_PLAYBOOKS.find(p => p.id === h.playbookId)?.name}</p>
                         <p className="text-[8px] text-slate-500 font-mono">{new Date(h.timestamp).toLocaleDateString()}</p>
                       </div>
                       <div className="flex items-center gap-2">
                         <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MitigationConsole;
