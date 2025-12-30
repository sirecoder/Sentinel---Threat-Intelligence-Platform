
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Loader2, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Scan,
  ArrowLeft,
  Mail,
  UserPlus,
  CircleCheck,
  AlertOctagon,
  Check,
  RefreshCw,
  Fingerprint,
  ShieldAlert
} from 'lucide-react';
import { User as UserType, UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30;

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('sarah.connor@sentinel.io');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Tier-3 (Admin)');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [step, setStep] = useState<'form' | 'signup' | 'signup-success' | 'forgot' | 'forgot-success' | 'error'>('form');
  const [authError, setAuthError] = useState<{ code: string; message: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [errorTimestamp, setErrorTimestamp] = useState<number>(0);
  
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);
  const [captchaStatus, setCaptchaStatus] = useState<'idle' | 'verifying' | 'verified'>('idle');

  // Parse URL hash for Supabase Auth errors (like otp_expired)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const errorCode = params.get('error_code');
      const errorDesc = params.get('error_description')?.replace(/\+/g, ' ');
      
      if (errorCode) {
        setAuthError({ 
          code: errorCode, 
          message: errorDesc || "Authentication link has expired or is invalid." 
        });
        setStep('error');
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

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

  const validateEmail = (emailStr: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (lockoutTimeLeft > 0) return;

    if (!validateEmail(email)) {
      setFormError("IDENTITY_MALFORMED: Ensure standard email syntax (analyst@sentinel.io).");
      triggerFailure("MALFORMED_IDENTIFIER");
      return;
    }
    
    setIsAuthenticating(true);
    addLog("Establishing secure handshake with Supabase Auth...");
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const displayMsg = error.message.includes("Invalid login credentials") 
        ? "CREDENTIAL_REJECTION: Personnel ID or Cipher is incorrect." 
        : error.message;
      setFormError(displayMsg);
      triggerFailure(error.message);
      setIsAuthenticating(false);
      return;
    }

    if (data.user) {
      addLog("Primary authentication successful.");
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
    setFormError(null);

    if (!validateEmail(email)) {
      setFormError("PROVISION_ERROR: Target email format is invalid.");
      triggerFailure("MALFORMED_IDENTIFIER");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("CIPHER_MISMATCH: Access ciphers do not match.");
      triggerFailure("CIPHER_MISMATCH");
      return;
    }

    setIsAuthenticating(true);
    addLog(`Initiating provisioning for ${selectedRole}...`);
    
    const { error } = await supabase.auth.signUp({
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
      setFormError(error.message);
      triggerFailure(error.message);
      setIsAuthenticating(false);
      return;
    }

    addLog("PROVISION_REQUEST accepted.");
    setIsAuthenticating(false);
    setStep('signup-success');
  };

  const handleResendConfirmation = async () => {
    setIsAuthenticating(true);
    addLog(`Resending confirmation pulse to ${email}...`);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    
    if (error) {
      addLog(`ERR: ${error.message}`);
    } else {
      addLog("Confirmation signal re-dispatched.");
      setStep('signup-success');
    }
    setIsAuthenticating(false);
  };

  const triggerFailure = (reason: string) => {
    setErrorTimestamp(Date.now());
    setFailedAttempts(prev => prev + 1);
    addLog(`FAIL: ${reason}`);
    
    if (failedAttempts + 1 >= MAX_ATTEMPTS) {
      setLockoutTimeLeft(LOCKOUT_DURATION);
      setFailedAttempts(0);
    }
  };

  const handleCaptchaVerify = () => {
    setCaptchaStatus('verifying');
    setTimeout(() => {
      setCaptchaStatus('verified');
      addLog("Neural integrity verified.");
    }, 1000);
  };

  const renderCaptcha = () => (
    <div 
      onClick={captchaStatus === 'idle' ? handleCaptchaVerify : undefined}
      className={`group cursor-pointer bg-slate-950/50 border rounded-xl p-4 flex items-center gap-4 transition-all duration-300 ${
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
          captchaStatus === 'verified' ? 'text-emerald-400' : 'text-slate-500'
        }`}>
          {captchaStatus === 'verified' ? 'Identity Integral' : captchaStatus === 'verifying' ? 'Scanning...' : 'Neural Integrity Check'}
        </p>
      </div>
      <Scan className={`w-4 h-4 ${captchaStatus === 'verified' ? 'text-emerald-500' : 'text-slate-700'}`} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%"><rect width="100%" height="100%" fill="url(#grid)" /></svg>
      </div>

      <div className={`w-full max-w-md relative z-10 transition-transform duration-300`}>
        
        {lockoutTimeLeft > 0 && (
          <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-8 text-center border border-red-500/50 animate-in fade-in duration-500">
            <AlertOctagon className="w-12 h-12 text-red-500 mb-4 animate-pulse" />
            <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Security Lockout</h2>
            <div className="text-4xl font-black text-red-500 font-mono">00:{lockoutTimeLeft.toString().padStart(2, '0')}</div>
            <p className="mt-4 text-[10px] text-slate-500 uppercase font-black tracking-widest leading-relaxed">Too many failed handshake attempts. System cooling down...</p>
          </div>
        )}

        <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          
          <div className="p-8 text-center space-y-4">
            <div className="relative inline-flex p-4 bg-slate-900 border border-slate-800 rounded-2xl">
              <ShieldCheck className="w-10 h-10 text-blue-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse border-2 border-slate-900" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">SENTINEL</h1>
          </div>

          <div className="p-8 pt-0 space-y-6">
            {/* Professional Feedback Alert for errors */}
            {formError && (
              <div 
                key={errorTimestamp}
                className="p-4 bg-red-500/10 border border-red-500/40 rounded-xl flex items-start gap-4 animate-in slide-in-from-top-2 fade-in duration-300 ring-2 ring-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
              >
                <div className="p-1.5 bg-red-500/20 rounded-lg">
                   <ShieldAlert className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Authorization Fault</h4>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-bold">{formError}</p>
                </div>
              </div>
            )}

            {step === 'error' && (
              <div className="space-y-6 py-4 animate-in fade-in duration-300">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-red-400 uppercase tracking-widest mb-1">Link Invalid ({authError?.code})</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{authError?.message}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={handleResendConfirmation}
                    disabled={isAuthenticating}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-[11px] tracking-widest uppercase shadow-lg shadow-blue-500/20"
                  >
                    {isAuthenticating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RefreshCw className="w-4 h-4" /> Resend Verification Signal</>}
                  </button>
                  <button 
                    onClick={() => setStep('form')}
                    className="w-full py-4 bg-slate-800 text-slate-300 font-black rounded-xl text-[11px] tracking-widest uppercase border border-slate-700 hover:bg-slate-700 transition-colors"
                  >
                    Back to Gateway
                  </button>
                </div>
              </div>
            )}

            {step === 'form' && (
              <form onSubmit={handleInitialSubmit} className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Personnel ID</label>
                    {email && !validateEmail(email) && (
                      <span className="text-[8px] font-black text-red-500 uppercase animate-pulse">Invalid Format</span>
                    )}
                  </div>
                  <div className="relative">
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${formError && !validateEmail(email) ? 'text-red-500' : 'text-slate-500'}`} />
                    <input 
                      type="text" required value={email} onChange={(e) => { setEmail(e.target.value); setFormError(null); }}
                      className={`w-full bg-slate-950/50 border rounded-xl py-4 pl-11 pr-4 text-sm text-white focus:border-blue-500 outline-none transition-all duration-300 ${formError && !validateEmail(email) ? 'border-red-500/50 bg-red-500/5 focus:border-red-500' : 'border-slate-800'}`}
                      placeholder="analyst@sentinel.io"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Cipher</label>
                  <div className="relative">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${formError && password === '' ? 'text-red-500' : 'text-slate-500'}`} />
                    <input 
                      type={showPassword ? "text" : "password"} required value={password} onChange={(e) => { setPassword(e.target.value); setFormError(null); }}
                      className={`w-full bg-slate-950/50 border rounded-xl py-4 pl-11 pr-12 text-sm text-white focus:border-blue-500 outline-none transition-all duration-300 ${formError && password === '' ? 'border-red-500/50 bg-red-500/5' : 'border-slate-800'}`}
                      placeholder="••••••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {renderCaptcha()}

                <button 
                  type="submit" disabled={isAuthenticating || captchaStatus !== 'verified'}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl text-[11px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/10 active:scale-[0.98]"
                >
                  {isAuthenticating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Fingerprint className="w-4 h-4" /> Authenticate Session</>}
                </button>
                
                <button type="button" onClick={() => { setStep('signup'); setFormError(null); }} className="w-full text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors py-2">
                  New Personnel? Register Provisioning
                </button>
              </form>
            )}

            {step === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-5 animate-in slide-in-from-right-8 duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <button type="button" onClick={() => { setStep('form'); setFormError(null); }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /></button>
                  <h3 className="text-white font-bold">New Personnel</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Clearance Tier</label>
                  <select 
                    value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    <option value="Tier-1 (Viewer)">Tier-1 (Viewer)</option>
                    <option value="Tier-2 (Analyst)">Tier-2 (Analyst)</option>
                    <option value="Tier-3 (Admin)">Tier-3 (Admin)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setFormError(null); }}
                    className={`w-full bg-slate-950/50 border rounded-xl py-4 px-4 text-sm text-white outline-none focus:border-blue-500 transition-all ${formError && !validateEmail(email) ? 'border-red-500/50 bg-red-500/5' : 'border-slate-800'}`}
                    placeholder="analyst@sentinel.io"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cipher</label>
                  <input 
                    type="password" required value={password} onChange={(e) => { setPassword(e.target.value); setFormError(null); }}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 px-4 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirm Cipher</label>
                  <input 
                    type="password" required value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setFormError(null); }}
                    className={`w-full bg-slate-950/50 border rounded-xl py-4 px-4 text-sm text-white outline-none focus:border-blue-500 transition-all ${formError && password !== confirmPassword ? 'border-red-500/50 bg-red-500/5' : 'border-slate-800'}`}
                  />
                </div>

                {renderCaptcha()}

                <button 
                  type="submit" disabled={isAuthenticating || captchaStatus !== 'verified' || (password !== confirmPassword && password.length > 0)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl text-[11px] tracking-widest uppercase transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
                >
                  {isAuthenticating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Request Provisioning</>}
                </button>
              </form>
            )}

            {step === 'signup-success' && (
              <div className="space-y-8 py-8 text-center animate-in zoom-in-95 duration-500">
                <div className="relative p-6 bg-emerald-500/10 rounded-full border border-emerald-500/20 inline-block">
                  <CircleCheck className="w-16 h-16 text-emerald-500" />
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                </div>
                <div className="space-y-3 relative z-10">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Provisioning Dispatched</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed px-6 font-bold uppercase tracking-wide">
                    Identity parameters committed. Check your email to verify the neural link.
                  </p>
                </div>
                <button 
                  onClick={() => setStep('form')}
                  className="w-full py-4 bg-slate-800 text-white font-black rounded-xl text-[11px] tracking-widest uppercase border border-slate-700 hover:bg-slate-700 transition-all"
                >
                  Return to Gateway
                </button>
              </div>
            )}

            <div className="bg-black/60 rounded-2xl p-4 border border-slate-800/50 font-mono text-[9px] h-24 flex flex-col justify-end space-y-1.5 shadow-inner">
              <div className="text-slate-700 uppercase font-black tracking-widest mb-1 border-b border-slate-900 pb-1 flex justify-between">
                <span>Supabase Edge Logs</span>
                <span className="text-[7px] text-slate-800">Uptime: 99.9%</span>
              </div>
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-left-1">
                  <span className="text-blue-900 font-black">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                  <span className={`truncate font-bold ${log.includes('FAIL') ? 'text-red-900' : 'text-slate-500'}`}>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
