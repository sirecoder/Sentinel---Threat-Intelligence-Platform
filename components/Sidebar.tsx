
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
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'iocs', label: 'IoC Manager', icon: ShieldAlert },
    { id: 'hunting', label: 'Threat Hunting', icon: Search },
    { id: 'campaigns', label: 'Campaigns', icon: History },
    { id: 'mitre', label: 'MITRE Matrix', icon: Grid3X3 },
    { id: 'vulnerabilities', label: 'Vulnerabilities', icon: Database },
    { id: 'feeds', label: 'Threat Feeds', icon: Rss },
    { id: 'anomalies', label: 'Anomaly Detection', icon: Activity },
    { id: 'automations', label: 'AI Insights', icon: Zap },
  ];

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
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SENTINEL</span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-slate-800 rounded-lg text-slate-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              setActiveTab('settings');
              if (onClose) onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
          <div className="mt-4 px-3 py-2 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-400">System Status: Optimal</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
