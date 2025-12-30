
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
import MitigationConsole from './components/MitigationConsole';
import SentinelVoiceAssistant from './components/SentinelVoiceAssistant';
import Login from './components/Login';
import AccessDenied from './components/AccessDenied';
import { supabase } from './lib/supabase';
import { 
  Bell, 
  Search, 
  User as UserIcon, 
  ShieldCheck,
  Zap,
  X,
  AlertTriangle,
  Clock,
  ChevronRight,
  ShieldAlert,
  Menu,
  LogOut,
  Shield,
  CheckCircle2,
  Trash2,
  Activity,
  AlertOctagon,
  LogOut as LogOutIcon
} from 'lucide-react';
import { MOCK_IOCS, MOCK_FEEDS, MOCK_ANOMALIES, MOCK_CAMPAIGNS } from './constants';
import { IoCRecord, ThreatFeed, AnomalyEvent, User, UserRole, SavedHunt } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [iocs, setIocs] = useState<IoCRecord[]>(MOCK_IOCS);
  const [feeds, setFeeds] = useState<ThreatFeed[]>(MOCK_FEEDS);
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>(MOCK_ANOMALIES);
  const [savedHunts, setSavedHunts] = useState<SavedHunt[]>([]);
  const [targetAnomalyId, setTargetAnomalyId] = useState<string | null>(null);
  const [huntTarget, setHuntTarget] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warning' } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);

  // Initialize Supabase Auth and Session
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          mapSupabaseUserToSentinel(session.user);
          // If we came from a redirect, clear the hash
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        mapSupabaseUserToSentinel(session.user);
        if (event === 'SIGNED_IN') {
          notify(`Session synchronized via ${event}`, 'success');
        }
      } else {
        setUser(null);
      }
    });

    initSession();
    fetchCloudData();

    return () => subscription.unsubscribe();
  }, []);

  const mapSupabaseUserToSentinel = (sbUser: any) => {
    setUser({
      id: sbUser.id,
      name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0],
      email: sbUser.email || '',
      role: (sbUser.user_metadata?.role as UserRole) || 'Tier-1 (Viewer)',
      lastLogin: sbUser.last_sign_in_at || new Date().toISOString()
    });
  };

  const fetchCloudData = async () => {
    try {
      const { data: iocData, error: iocError } = await supabase.from('iocs').select('*');
      if (!iocError && iocData) {
        setIocs([...MOCK_IOCS, ...iocData]);
      }

      const { data: huntData, error: huntError } = await supabase.from('saved_hunts').select('*');
      if (!huntError && huntData) {
        setSavedHunts(huntData);
      }
    } catch (err) {
      console.warn("Supabase Sync skipped: Tables may not be initialized yet.");
    }
  };

  const getRoleLevel = (role?: UserRole) => {
    if (!role) return 0;
    if (role.includes('Tier-3')) return 3;
    if (role.includes('Tier-2')) return 2;
    return 1;
  };

  const userLevel = useMemo(() => getRoleLevel(user?.role), [user]);

  const TAB_PERMISSIONS: Record<string, number> = {
    'dashboard': 1,
    'iocs': 1,
    'hunting': 2,
    'campaigns': 2,
    'mitre': 1,
    'vulnerabilities': 1,
    'feeds': 1,
    'anomalies': 1,
    'mitigation': 2,
    'settings': 3
  };

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

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    notify(`Session authorized. Clearance: ${authenticatedUser.role}`, 'success');
  };

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsLogoutModalOpen(false);
    notify('Session terminated successfully.', 'info');
  };

  const handleLogoutRequest = () => {
    setIsLogoutModalOpen(true);
  };

  const handleSaveHunt = async (hunt: SavedHunt) => {
    const { error } = await supabase.from('saved_hunts').insert([hunt]);
    if (error) {
      setSavedHunts(prev => [hunt, ...prev]);
    } else {
      setSavedHunts(prev => [hunt, ...prev]);
      notify(`Hunt saved to cloud: ${hunt.name}`, 'success');
    }
  };

  const handleDeleteSavedHunt = async (id: string) => {
    const { error } = await supabase.from('saved_hunts').delete().eq('id', id);
    if (!error) {
      setSavedHunts(prev => prev.filter(h => h.id !== id));
      notify('Saved hunt purged from cloud.', 'info');
    }
  };

  const addIoC = async (ioc: IoCRecord) => {
    if (userLevel < 2) return;
    const { error } = await supabase.from('iocs').insert([ioc]);
    if (error) {
      setIocs(prev => [ioc, ...prev]);
    } else {
      setIocs(prev => [ioc, ...prev]);
      notify(`New IoC registered: ${ioc.value}`, 'success');
    }
  };

  const deleteIoC = async (id: string) => {
    if (userLevel < 3) return;
    const { error } = await supabase.from('iocs').delete().eq('id', id);
    if (!error) {
      setIocs(prev => prev.filter(i => i.id !== id));
      notify('IoC removed from database', 'info');
    }
  };

  const bulkCleanupIocs = async (ids: string[]) => {
    if (userLevel < 3) return;
    const { error } = await supabase.from('iocs').delete().in('id', ids);
    if (!error) {
      setIocs(prev => prev.filter(i => !ids.includes(i.id)));
      notify(`Cleaned up ${ids.length} expired indicators.`, 'success');
    }
  };

  const addFeed = (feed: ThreatFeed) => {
    if (userLevel < 3) return;
    setFeeds(prev => [...prev, feed]);
    notify(`Connected to feed: ${feed.name}`, 'success');
  };

  const updateAnomalyStatus = (id: string, status: AnomalyEvent['status']) => {
    if (userLevel < 2) return;
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    notify(`Anomaly status updated to ${status}`, 'info');
  };

  const clearAllNotifications = () => {
    setAnomalies(prev => prev.map(a => ({ ...a, status: 'Investigating' })));
    notify('All alerts marked for investigation.', 'success');
    setShowNotifications(false);
  };

  const syncFeed = (id: string) => {
    if (userLevel < 2) return;
    setFeeds(prev => prev.map(f => f.id === id ? { ...f, status: 'Syncing', syncProgress: 0, lastError: undefined } : f));
    setTimeout(() => {
      setFeeds(prev => prev.map(f => f.id === id ? { ...f, status: 'Healthy', lastUpdate: 'Just now' } : f));
      notify('Feed synchronization complete', 'success');
    }, 2000);
  };

  const handleExportReport = (format: string) => {
    if (isExporting || userLevel < 2) return;
    setIsExporting(true);
    notify(`Compiling intelligence briefing (${format})...`, 'info');
    setTimeout(() => {
      setIsExporting(false);
      notify(`Sentinel_Report_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()} ready.`, 'success');
    }, 3000);
  };

  const runNewScan = () => {
    if (isScanning || userLevel < 2) return;
    setIsScanning(true);
    notify('Initiating deep infrastructure scan...', 'info');
    setTimeout(() => {
      setIsScanning(false);
      notify('Scan complete. System parameters verified.', 'success');
    }, 4500);
  };

  const stats = useMemo(() => ({
    totalIoCs: iocs.length + 124500,
    activeThreats: iocs.filter(i => i.status === 'Active').length + 1200,
    activeFeeds: feeds.filter(f => f.status === 'Healthy').length,
    alerts24h: anomalies.length + 340
  }), [iocs, feeds, anomalies]);

  const handleAlertJump = (id: string) => {
    if (userLevel < 2) {
      notify('Clearance Tier-2 required to triage anomalies.', 'warning');
      return;
    }
    setTargetAnomalyId(id);
    setActiveTab('anomalies');
    setShowNotifications(false);
  };

  const newAlerts = useMemo(() => anomalies.filter(a => a.status === 'New'), [anomalies]);

  const renderContent = () => {
    if (!user) return null;
    const requiredLevel = TAB_PERMISSIONS[activeTab] || 1;
    if (userLevel < requiredLevel) {
      return (
        <AccessDenied 
          onReturn={() => setActiveTab('dashboard')} 
          requiredRole={`Tier-${requiredLevel}`} 
        />
      );
    }

    switch (activeTab) {
      case 'dashboard': return <DashboardHome stats={stats} onNewScan={runNewScan} isScanning={isScanning} onExportReport={handleExportReport} isExporting={isExporting} onNavigate={setActiveTab} anomalies={anomalies} onAlertClick={handleAlertJump} userRole={user.role} />;
      case 'iocs': return <IoCManager iocs={iocs} onDelete={deleteIoC} onAdd={addIoC} onBulkCleanup={bulkCleanupIocs} globalSearch={searchQuery} userRole={user.role} />;
      case 'hunting': return <ThreatHunter initialTarget={huntTarget} onHuntStart={() => setHuntTarget(null)} userRole={user.role} savedHunts={savedHunts} onSaveHunt={handleSaveHunt} onDeleteSavedHunt={handleDeleteSavedHunt} />;
      case 'campaigns': return <CampaignTimeline campaigns={MOCK_CAMPAIGNS} />;
      case 'mitre': return <MitreMatrix onNavigate={setActiveTab} onHuntRequest={(target) => setHuntTarget(target)} />;
      case 'vulnerabilities': return <VulnerabilityExplorer />;
      case 'feeds': return <FeedAggregator feeds={feeds} onAdd={addFeed} onSync={syncFeed} userRole={user.role} />;
      case 'anomalies': return <AnomalyDetection anomalies={anomalies} onUpdateStatus={updateAnomalyStatus} globalSearch={searchQuery} initialTargetId={targetAnomalyId} onAnalysisStart={() => setTargetAnomalyId(null)} userRole={user.role} />;
      case 'mitigation': return <MitigationConsole userRole={user.role} />;
      default: return <DashboardHome stats={stats} onNewScan={runNewScan} isScanning={isScanning} onExportReport={handleExportReport} isExporting={isExporting} onNavigate={setActiveTab} anomalies={anomalies} onAlertClick={handleAlertJump} userRole={user.role} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      {user && (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onLogout={handleLogoutRequest}
          userRole={user.role}
        />
      )}
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 flex flex-col min-w-0">
        {user && (
          <header className="flex justify-between items-center mb-6 md:mb-10 sticky top-0 bg-slate-950/80 backdrop-blur-md z-40 py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-slate-900/50">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg">
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden md:flex items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2 w-64 xl:w-96 group focus-within:border-blue-500/50 transition-all">
                <Search className="w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Search threats..." className="bg-transparent border-none outline-none text-sm text-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <div className={`hidden sm:flex items-center gap-1 text-[10px] md:text-xs font-black px-2 md:px-3 py-1.5 rounded-full border shadow-lg ${
                userLevel === 3 ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 
                userLevel === 2 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                'bg-slate-500/10 text-slate-400 border-slate-500/30'
              }`}>
                <Shield className="w-3 h-3" />
                {user.role.split(' ')[0].toUpperCase()} CLEARED
              </div>
              
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)} 
                  className={`p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg relative transition-all hover:bg-slate-800 ${showNotifications ? 'bg-slate-800 ring-2 ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''}`}
                >
                  <Bell className="w-5 h-5" />
                  {newAlerts.length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute top-full right-0 mt-3 w-[320px] md:w-[400px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
                       <div>
                         <h3 className="text-xs font-black text-white uppercase tracking-widest">Command Alert Hub</h3>
                       </div>
                       {newAlerts.length > 0 && (
                         <button 
                          onClick={clearAllNotifications}
                          className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all flex items-center gap-2 group"
                         >
                           <CheckCircle2 className="w-4 h-4" />
                           <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Global Reset</span>
                         </button>
                       )}
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                      {newAlerts.length === 0 ? (
                        <div className="p-10 text-center space-y-3 opacity-50">
                          <Activity className="w-8 h-8 text-slate-500 mx-auto" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Threat Landscape Static</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-800">
                          {newAlerts.map(alert => (
                            <div 
                              key={alert.id}
                              onClick={() => handleAlertJump(alert.id)}
                              className="p-4 hover:bg-slate-800/50 cursor-pointer transition-all flex gap-4 group"
                            >
                              <div className={`p-2 rounded-xl h-fit border shrink-0 ${alert.score > 0.9 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                                <ShieldAlert className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex justify-between mb-1 items-start">
                                  <h4 className="text-[11px] font-black text-white uppercase truncate">{alert.source}</h4>
                                  <span className="text-[8px] text-slate-600 font-mono shrink-0 ml-2">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{alert.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-[1px] bg-slate-800 mx-1 md:mx-2" />
              
              <div className="relative group">
                <div className="flex items-center gap-3 pl-2 cursor-pointer">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs md:text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{user.name}</p>
                    <p className="text-[8px] md:text-[10px] text-slate-500 uppercase tracking-widest font-black truncate">{user.role.split(' ')[0]}</p>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg md:rounded-xl flex items-center justify-center text-white border border-blue-400/20 shadow-lg shadow-blue-500/10">
                    <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                </div>
                
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50 overflow-hidden">
                  <button onClick={handleLogoutRequest} className="w-full flex items-center gap-3 px-4 py-3 text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left font-bold">
                    <LogOutIcon className="w-4 h-4" /> Terminate Session
                  </button>
                </div>
              </div>
            </div>
          </header>
        )}

        <div className="flex-1">
          {user ? renderContent() : <Login onLogin={handleLogin} />}
        </div>
      </main>
      
      {user && <SentinelVoiceAssistant />}
      
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                <AlertOctagon className="w-10 h-10 text-red-500 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Terminate Active Session?</h3>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={confirmLogout} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 active:scale-[0.98]">Confirm Termination</button>
                <button onClick={() => setIsLogoutModalOpen(false)} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black rounded-xl text-xs uppercase tracking-widest border border-slate-700 transition-all">Return to Command</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
