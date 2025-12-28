
import React from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Search, 
  Rss, 
  Activity, 
  Settings, 
  ShieldCheck,
  Zap,
  Grid3X3,
  Database,
  History,
  X,
  Lock,
  LogOut,
  ShieldX
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
  userRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose, onLogout, userRole }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, minRole: 1 },
    { id: 'iocs', label: 'IoC Manager', icon: ShieldAlert, minRole: 2 },
    { id: 'hunting', label: 'Threat Hunting', icon: Search, minRole: 2 },
    { id: 'campaigns', label: 'Campaigns', icon: History, minRole: 2 },
    { id: 'mitre', label: 'MITRE Matrix', icon: Grid3X3, minRole: 1 },
    { id: 'vulnerabilities', label: 'Vulnerabilities', icon: Database, minRole: 2 },
    { id: 'feeds', label: 'Threat Feeds', icon: Rss, minRole: 1 },
    { id: 'anomalies', label: 'Anomaly Detection', icon: Activity, minRole: 2 },
    { id: 'mitigation', label: 'Mitigation Engine', icon: Zap, minRole: 2 },
  ];

  const getRoleLevel = (role: UserRole) => {
    if (role.includes('Tier-3')) return 3;
    if (role.includes('Tier-2')) return 2;
    return 1;
  };

  const userLevel = getRoleLevel(userRole);

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-[70]
        transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase">SENTINEL</span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-slate-800 rounded-lg text-slate-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isLocked = userLevel < item.minRole;
              
              return (
                <button
                  key={item.id}
                  disabled={isLocked}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner'
                      : isLocked 
                        ? 'text-slate-700 cursor-not-allowed opacity-60'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-500' : ''}`} />
                    {item.label}
                  </div>
                  {isLocked && <Lock className="w-3 h-3 text-slate-800" />}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            disabled={userLevel < 3}
            onClick={() => {
              setActiveTab('settings');
              if (onClose) onClose();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              userLevel < 3 ? 'text-slate-800 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" />
              Settings
            </div>
            {userLevel < 3 && <Lock className="w-3 h-3" />}
          </button>

          <button
            onClick={() => {
              if (onLogout) onLogout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Terminate Session
          </button>

          <div className="mt-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Auth Integrity: High</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
