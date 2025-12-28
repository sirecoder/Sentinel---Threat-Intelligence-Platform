
import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, Terminal } from 'lucide-react';

interface AccessDeniedProps {
  onReturn: () => void;
  requiredRole?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ onReturn, requiredRole }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative w-24 h-24 bg-slate-900 border border-red-500/30 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-slate-950 border border-slate-800 p-2 rounded-xl">
          <Lock className="w-4 h-4 text-red-400" />
        </div>
      </div>
      
      <div className="max-w-md space-y-4">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Restricted Sector</h2>
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 font-mono text-xs text-red-400">
          <div className="flex gap-2 justify-center items-center mb-1">
            <Terminal className="w-3 h-3" />
            <span>AUTH_FAILURE_0X403</span>
          </div>
          <p>Personnel with role <span className="underline font-bold">{requiredRole || 'higher clearance'}</span> required for this sector access.</p>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">
          The requested operation or view contains sensitive tactical data. Your current credentials do not have the necessary clearance level.
        </p>
      </div>

      <button 
        onClick={onReturn}
        className="mt-8 flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest border border-slate-700 transition-all active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Safe Sector
      </button>
    </div>
  );
};

export default AccessDenied;
