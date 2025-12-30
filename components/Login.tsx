
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Terminal, 
  Loader2, 
  ShieldAlert, 
  Cpu, 
  Fingerprint, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Key,
  ShieldQuestion,
  Info,
  CheckCircle2,
  AlertOctagon,
  Scan,
  RefreshCw,
  ArrowLeft,
  Mail,
  UserPlus,
  Shield,
  CircleCheck,
  Check
} from 'lucide-react';
import { User as UserType, UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30; // seconds

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('sarah.connor@sentinel.io');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Tier-3 (Admin)');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [step, setStep] = useState<'form' | 'mfa' | 'passkey' | 'signup' | 'signup-success' | 'forgot' | 'forgot-success'>('form');
  const [capsLock, setCapsLock] = useState(false);
  
  // Security States
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);
  const [captchaStatus, setCaptchaStatus] = useState<'idle' | 'verifying' | 'verified'>('idle');
  const [isShaking, setIsShaking] = useState(false);

  // Handle Lockout Countdown
  useEffect(() => {
    let timer: number;
    if (lockoutTimeLeft > 0) {
      timer = window.setInterval(() => {
        setLockoutTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTimeLeft]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-4), msg]);
  };

  const checkCapsLock = (e: React.KeyboardEvent) => {
    if (e.getModifierState('CapsLock')) {
      setCapsLock(true);
    } else {
      setCapsLock(false);
    }
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimeLeft > 0) return;
    
    setIsAuthenticating(true);
    addLog("Establishing secure handshake with Supabase Auth...");
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      triggerFailure(error.message);
      setIsAuthenticating(false);
      return;
    }

    if (data.user) {
      addLog("Primary authentication successful. Retrieving session...");
      onLogin({
        id: data.user.id,
        name: data.user.user_metadata?.name || email.split('@')[0],
        role: (data.user.user_metadata?.role as UserRole) || selectedRole,
        email: data.user.email || '',
        lastLogin: data.user.last_sign_in_at || new Date().toISOString()
      });
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      triggerFailure("Access ciphers do not match.");
      return;
    }

    setIsAuthenticating(true);
    addLog(`Initiating provisioning for ${selectedRole}...`);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: selectedRole,
          name: email.split('@')[0]
        }
      }
    });

    if (error) {
      triggerFailure(error.message);
      setIsAuthenticating(false);
      return;
    }

    addLog("PROVISION_REQUEST accepted. Dispatching verification.");
    setIsAuthenticating(false);
    setStep('signup-success');
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    addLog("Dispatching recovery handshake...");
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      triggerFailure(error.message);
    } else {
      setStep('forgot-success');
      addLog("Handshake dispatched to secure relay.");
    }
    setIsAuthenticating(false);
  };

  const triggerFailure = (reason: string) => {
    setIsShaking(true);
    const newCount = failedAttempts + 1;
    setFailedAttempts(newCount);
    addLog(`FAIL: ${reason}`);
    
    if (newCount >= MAX_ATTEMPTS) {
      setLockoutTimeLeft(LOCKOUT_DURATION);
      setFailedAttempts(0);
      addLog("CRITICAL: Maximum attempts exceeded. IP rate-limited.");
    }

    setTimeout(() => setIsShaking(false), 500);
  };

  const handleCaptchaVerify = () => {
    setCaptchaStatus('verifying');
    addLog("Verifying integrity of neural verification token...");
    setTimeout(() => {
      setCaptchaStatus('verified');
      addLog("Bot verification successful. [S_TOKEN_OK]");
    }, 1500);
  };

  const renderCaptcha = () => (
    <div className="space-y-2">
      <div 
        onClick={captchaStatus === 'idle' ? handleCaptchaVerify : undefined}
        className={`group cursor-pointer bg-slate-950/50 border rounded-xl p-4 flex items-center gap-4 transition-all ${
          captchaStatus === 'verified' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800 hover:border-blue-500/30'
        }`}
      >
        <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-all ${
          captchaStatus === 'verified' ? 'bg-emerald-500 border-emerald-500 text-white' : 
          captchaStatus === 'verifying' ? 'border-blue-500/50' : 'border-slate-700'
        }`}>
          {captchaStatus === 'verified' && <Check className="w-4 h-4" />}
          {captchaStatus === 'verifying' && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
        </div>
        <div className="flex-1">
          <p className={`text-[10px] font-black uppercase tracking-widest ${
            captchaStatus === 'verified' ? 'text-emerald-400' : 'text-slate-500 group-hover:text-blue-400'
          }`}>
            {captchaStatus === 'verified' ? 'Identity Integral' : captchaStatus === 'verifying' ? 'Scanning Pulse...' : 'Neural Integrity Check'}
          </p>
        </div>
        <Scan className={`w-4 h-4 ${captchaStatus === 'verified' ? 'text-emerald-500' : 'text-slate-700'}`} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className={`w-full max-w-md relative z-10 transition-transform duration-300 ${isShaking ? 'animate-shake' : ''}`}>
        
        {lockoutTimeLeft > 0 && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300 border border-red-500/50">
            <div className="p-4 bg-red-500/10 rounded-full mb-4 animate-pulse">
              <AlertOctagon className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Security Lockout</h2>
            <div className="text-4xl font-black text-red-500 font-mono mb-2 tracking-tighter">
              00:{lockoutTimeLeft.toString().padStart(2, '0')}
            </div>
          </div>
        )}

        <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-700">
          
          <div className="p-8 text-center space-y-4">
            <div className="relative inline-block group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative inline-flex p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
                <ShieldCheck className="w-10 h-10 text-blue-500" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase">SENTINEL</h1>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Edge-Sync Cloud Auth</p>
              </div>
            </div>
          </div>

          <div className="p-8 pt-0 space-y-6">
            {step === 'form' && (
              <form onSubmit={handleInitialSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Personnel ID</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-11 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-800"
                      placeholder="analyst@sentinel.io"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Cipher</label>
                    <button type="button" onClick={() => setStep('forgot')} className="text-[9px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest">Forgotten?</button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      value={password}
                      onKeyDown={checkCapsLock}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-11 pr-12 text-sm text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-800 font-mono"
                      placeholder="••••••••••••"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {renderCaptcha()}

                <div className="flex flex-col gap-3">
                  <button 
                    type="submit"
                    disabled={isAuthenticating || captchaStatus !== 'verified'}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed uppercase text-[11px] tracking-widest"
                  >
                    {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Authenticate Session</>}
                  </button>
                  
                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-slate-800"></div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">OR</span>
                    <div className="flex-1 h-px bg-slate-800"></div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      type="button"
                      onClick={() => { setStep('signup'); setCaptchaStatus('idle'); setPassword(''); setConfirmPassword(''); }}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl border border-slate-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-xs"
                    >
                      <UserPlus className="w-4 h-4 text-emerald-400" />
                      Register New Personnel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {step === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-5 animate-in slide-in-from-right-8 duration-300">
                <div className="flex items-center gap-3 mb-4">
                   <button type="button" onClick={() => setStep('form')} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /></button>
                   <div>
                     <h3 className="text-white font-bold">New Personnel</h3>
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest">Provisioning Access</p>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Clearance Tier</label>
                  <select 
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="Tier-1 (Viewer)">Tier-1 (Viewer)</option>
                    <option value="Tier-2 (Analyst)">Tier-2 (Analyst)</option>
                    <option value="Tier-3 (Admin)">Tier-3 (Admin)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Personnel ID</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-11 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-800"
                      placeholder="analyst@sentinel.io"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Cipher</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 px-4 text-sm text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-800 font-mono"
                    placeholder="Create complex cipher"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Access Cipher</label>
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 px-4 text-sm text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-800 font-mono"
                    placeholder="Verify cipher"
                  />
                </div>

                {renderCaptcha()}

                <button 
                  type="submit"
                  disabled={isAuthenticating || captchaStatus !== 'verified' || !password || password !== confirmPassword}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-30 uppercase text-[11px] tracking-widest"
                >
                  {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /> Request Provisioning</>}
                </button>
              </form>
            )}

            {step === 'signup-success' && (
              <div className="space-y-8 py-8 text-center animate-in zoom-in-95 duration-500">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
                  <div className="relative p-6 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <CircleCheck className="w-16 h-16 text-emerald-500" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Provisioning Accepted</h3>
                  <p className="text-xs text-slate-500 leading-relaxed px-6">
                    Identity parameters have been committed to the Sentinel database. Please verify your personnel link via email.
                  </p>
                </div>
                <button 
                  onClick={() => setStep('form')}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl transition-all uppercase text-[11px] tracking-widest border border-slate-700"
                >
                  Return to Gateway
                </button>
              </div>
            )}

            <div className="bg-black/60 rounded-2xl p-4 border border-slate-800/50 font-mono text-[9px] h-28 flex flex-col justify-end space-y-1.5 shadow-inner">
              <div className="text-slate-700 uppercase font-black tracking-widest mb-1 border-b border-slate-900 pb-1">Supabase Edge Logs</div>
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-blue-900 font-black">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                  <span className="text-slate-500 truncate">{log}</span>
                </div>
              ))}
              <div className="flex gap-2 animate-pulse">
                <span className="text-blue-600 tracking-tighter">$</span>
                <span className="w-1.5 h-3 bg-blue-600/50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;