
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import IoCManager from './components/IoCManager';
import ThreatHunter from './components/ThreatHunter';
import FeedAggregator from './components/FeedAggregator';
import AnomalyDetection from './components/AnomalyDetection';
import MitreMatrix from './components/MitreMatrix';
import VulnerabilityExplorer from './components/VulnerabilityExplorer';
import CampaignTimeline from './components/CampaignTimeline';
import SentinelVoiceAssistant from './components/SentinelVoiceAssistant';
import { 
  Bell, 
  Search, 
  User, 
  ShieldCheck,
  Zap,
  X,
  AlertTriangle,
  Clock,
  ChevronRight,
  ShieldAlert,
  Menu
} from 'lucide-react';
import { MOCK_IOCS, MOCK_FEEDS, MOCK_ANOMALIES, MOCK_CAMPAIGNS } from './constants';
import { IoCRecord, ThreatFeed, AnomalyEvent } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [iocs, setIocs] = useState<IoCRecord[]>(MOCK_IOCS);
  const [feeds, setFeeds] = useState<ThreatFeed[]>(MOCK_FEEDS);
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>(MOCK_ANOMALIES);
  const [targetAnomalyId, setTargetAnomalyId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notify = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const addIoC = (ioc: IoCRecord) => {
    setIocs(prev => [ioc, ...prev]);
    notify(`New IoC added: ${ioc.value}`, 'success');
  };

  const deleteIoC = (id: string) => {
    setIocs(prev => prev.filter(i => i.id !== id));
    notify('IoC removed from database', 'info');
  };

  const bulkCleanupIocs = (ids: string[]) => {
    setIocs(prev => prev.filter(i => !ids.includes(i.id)));
    notify(`Cleaned up ${ids.length} expired indicators.`, 'success');
  };

  const addFeed = (feed: ThreatFeed) => {
    setFeeds(prev => [...prev, feed]);
    notify(`Connected to feed: ${feed.name}`, 'success');
  };

  const updateAnomalyStatus = (id: string, status: AnomalyEvent['status']) => {
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    notify(`Anomaly status updated to ${status}`, 'info');
  };

  const syncFeed = (id: string) => {
    setFeeds(prev => prev.map(f => f.id === id ? { ...f, status: 'Syncing' } : f));
    setTimeout(() => {
      setFeeds(prev => prev.map(f => f.id === id ? { ...f, status: 'Healthy', lastUpdate: 'Just now' } : f));
      notify('Feed synchronization complete', 'success');
    }, 2000);
  };

  const handleExportReport = (format: string) => {
    if (isExporting) return;
    setIsExporting(true);
    notify(`Compiling intelligence briefing (${format})...`, 'info');
    setTimeout(() => {
      setIsExporting(false);
      notify(`Sentinel_Intelligence_Report_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()} is ready.`, 'success');
    }, 3000);
  };

  const runNewScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    notify('Initiating deep infrastructure scan...', 'info');
    setTimeout(() => {
      const newFoundIoC: IoCRecord = {
        id: Math.random().toString(36).substr(2, 9),
        value: `103.25.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        type: 'IP',
        threatLevel: 'High',
        confidence: 92,
        lastSeen: new Date().toISOString(),
        tags: ['Scan Discovery', 'Suspicious Traffic'],
        status: 'Active',
        description: 'Discovered during automated infrastructure scan.'
      };
      setIocs(prev => [newFoundIoC, ...prev]);
      setIsScanning(false);
      notify('Scan complete. 1 new high-confidence threat identified.', 'warning');
    }, 4500);
  };

  const stats = useMemo(() => ({
    totalIoCs: iocs.length + 124500,
    activeThreats: iocs.filter(i => i.status === 'Active' && (i.threatLevel === 'High' || i.threatLevel === 'Critical')).length + 1200,
    activeFeeds: feeds.filter(f => f.status === 'Healthy').length,
    alerts24h: anomalies.length + 340
  }), [iocs, feeds, anomalies]);

  const unreadAlerts = anomalies.filter(a => a.status === 'New').length;

  const handleAlertJump = (id: string) => {
    setTargetAnomalyId(id);
    setActiveTab('anomalies');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardHome stats={stats} onNewScan={runNewScan} isScanning={isScanning} onExportReport={handleExportReport} isExporting={isExporting} onNavigate={setActiveTab} anomalies={anomalies} onAlertClick={handleAlertJump} />;
      case 'iocs': return <IoCManager iocs={iocs} onDelete={deleteIoC} onAdd={addIoC} onBulkCleanup={bulkCleanupIocs} globalSearch={searchQuery} />;
      case 'hunting': return <ThreatHunter />;
      case 'campaigns': return <CampaignTimeline campaigns={MOCK_CAMPAIGNS} />;
      case 'mitre': return <MitreMatrix />;
      case 'vulnerabilities': return <VulnerabilityExplorer />;
      case 'feeds': return <FeedAggregator feeds={feeds} onAdd={addFeed} onSync={syncFeed} />;
      case 'anomalies': return <AnomalyDetection anomalies={anomalies} onUpdateStatus={updateAnomalyStatus} globalSearch={searchQuery} initialTargetId={targetAnomalyId} onAnalysisStart={() => setTargetAnomalyId(null)} />;
      case 'automations': return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
          <div className="p-6 bg-blue-600/10 rounded-full border border-blue-500/20 animate-pulse"><Zap className="w-12 h-12 md:w-16 md:h-16 text-blue-500" /></div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Automated Threat Mitigation</h2>
            <p className="text-slate-400 max-w-lg text-sm md:text-base">AI-powered workflows that automatically block IoCs and isolate compromised endpoints based on confidence scoring.</p>
          </div>
          <button onClick={() => notify('Playbook configuration is currently in read-only mode.', 'warning')} className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">Configure Playbooks</button>
        </div>
      );
      default: return <DashboardHome stats={stats} onNewScan={runNewScan} isScanning={isScanning} onExportReport={handleExportReport} isExporting={isExporting} onNavigate={setActiveTab} anomalies={anomalies} onAlertClick={handleAlertJump} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 flex flex-col min-w-0">
        <header className="flex justify-between items-center mb-6 md:mb-10 sticky top-0 bg-slate-950/80 backdrop-blur-md z-40 py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-slate-900/50">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2 w-64 xl:w-96 group focus-within:border-blue-500/50 transition-all">
              <Search className="w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Search threats..." className="bg-transparent border-none outline-none text-sm text-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>}
            </div>
            {/* Small screen logo shortcut */}
            <div className="md:hidden flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <span className="font-bold text-sm tracking-tighter">SENTINEL</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] md:text-xs font-bold px-2 md:px-3 py-1.5 rounded-full border border-emerald-500/20"><ShieldCheck className="w-3 h-3" />PROTECTED</div>
            
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg relative transition-all hover:bg-slate-800 ${showNotifications ? 'bg-slate-800 ring-2 ring-blue-500/20' : ''}`}
              >
                <Bell className="w-5 h-5" />
                {unreadAlerts > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-4 w-[280px] sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-800 bg-slate-800/20 flex justify-between items-center">
                    <h3 className="font-bold text-white text-[10px] md:text-sm uppercase tracking-wider flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      Recent Alerts
                    </h3>
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-black">
                      {unreadAlerts} NEW
                    </span>
                  </div>
                  <div className="max-h-[300px] md:max-h-[400px] overflow-y-auto divide-y divide-slate-800">
                    {anomalies.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`p-3 md:p-4 hover:bg-slate-800/40 transition-all cursor-pointer group ${alert.status === 'New' ? 'bg-blue-500/5' : ''}`}
                        onClick={() => {
                          handleAlertJump(alert.id);
                          setShowNotifications(false);
                        }}
                      >
                        <div className="flex gap-3">
                          <div className={`mt-1 p-1.5 md:p-2 rounded-lg shrink-0 ${
                            alert.score > 0.9 ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                          }`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="text-[10px] md:text-xs font-bold text-white truncate">{alert.source}</p>
                              <span className="text-[8px] md:text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                                <Clock className="w-2.5 h-2.5" />
                                {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[10px] md:text-[11px] text-slate-400 mt-1 line-clamp-1 leading-relaxed">{alert.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-tighter ${
                                alert.status === 'New' ? 'text-blue-400' : 'text-slate-500'
                              }`}>
                                {alert.status}
                              </span>
                              <ChevronRight className="w-3 h-3 text-slate-600" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-slate-800/20 border-t border-slate-800">
                    <button 
                      onClick={() => {
                        setActiveTab('anomalies');
                        setShowNotifications(false);
                      }}
                      className="w-full py-2 text-[10px] md:text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
                    >
                      View All Activity
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-slate-800 mx-1 md:mx-2" />
            <div className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-xs md:text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Analyst View</p>
                <p className="text-[8px] md:text-[10px] text-slate-500 uppercase tracking-widest font-bold truncate">Security Lead</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg md:rounded-xl flex items-center justify-center text-white border border-blue-400/20 shadow-lg shadow-blue-500/10">
                <User className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 animate-in fade-in slide-in-from-top-4 duration-500">
          {renderContent() || null}
        </div>
      </main>
      
      <SentinelVoiceAssistant />
      
      {toast && (
        <div className={`fixed bottom-4 md:bottom-8 right-4 md:right-8 z-[100] p-4 rounded-xl border flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 max-w-[calc(100vw-2rem)] ${toast.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-50' : toast.type === 'warning' ? 'bg-orange-900/90 border-orange-500/50 text-orange-50' : 'bg-blue-900/90 border-blue-500/50 text-blue-50'}`}>
          <div className="p-1 bg-white/10 rounded-full shrink-0"><Zap className="w-4 h-4" /></div>
          <span className="text-xs md:text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70 shrink-0"><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
};

export default App;
