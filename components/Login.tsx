
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
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);
  
  // Security States
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);
  const [captchaStatus, setCaptchaStatus] = useState<'idle' | 'verifying' | 'verified'>('idle');
  const [isShaking, setIsShaking] = useState(false);

  const mfaRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

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

  // Real-time security heuristics
  const passwordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length > 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

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

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimeLeft > 0) return;
    
    if (password === '123') {
      triggerFailure("Invalid credentials provided.");
      return;
    }

    if (passwordStrength(password) < 2) {
      triggerFailure("Credential complexity insufficient.");
      return;
    }

    setIsAuthenticating(true);
    addLog("Establishing TLS 1.3 encrypted tunnel...");
    
    setTimeout(() => {
      addLog("Verifying JWT claims and RBAC levels...");
      setTimeout(() => {
        addLog("Primary authentication successful.");
        setIsAuthenticating(false);
        setStep('mfa');
      }, 1000);
    }, 1200);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      triggerFailure("Access ciphers do not match.");
      return;
    }
    setIsAuthenticating(true);
    addLog(`Initiating provisioning for ${selectedRole}...`);
    setTimeout(() => {
      addLog("Generating unique identity descriptors...");
      setTimeout(() => {
        addLog("PROVISION_REQUEST accepted. Dispatching verification.");
        setIsAuthenticating(false);
        setStep('signup-success');
      }, 1000);
    }, 1200);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    addLog("Dispatching recovery handshake...");
    setTimeout(() => {
      setStep('forgot-success');
      setIsAuthenticating(false);
      addLog("Handshake dispatched to secure relay.");
    }, 1500);
  };

  const triggerFailure = (reason: string) => {
    setIsShaking(true);
    const newCount = failedAttempts + 1;
    setFailedAttempts(newCount);
    addLog(`FAIL: ${reason} (Attempt ${newCount}/${MAX_ATTEMPTS})`);
    
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

  const handlePasskeyLogin = () => {
    if (lockoutTimeLeft > 0) return;
    setStep('passkey');
    addLog("Requesting WebAuthn challenge...");
    setTimeout(() => {
      addLog("User verified via biometric hardware token.");
      setTimeout(() => {
        onLogin({
          id: 'u1',
          name: 'Sarah Connor',
          role: 'Tier-3 (Admin)',
          email: 'sarah.connor@sentinel.io',
          lastLogin: new Date().toISOString()
        });
      }, 800);
    }, 2000);
  };

  const handleMfaChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newCode = [...mfaCode];
    newCode[index] = value.substring(value.length - 1);
    setMfaCode(newCode);

    if (value && index < 5) {
      mfaRefs[index + 1].current?.focus();
    }

    if (newCode.every(digit => digit !== '')) {
      verifyMFA();
    }
  };

  const verifyMFA = () => {
    setIsAuthenticating(true);
    addLog("Validating TOTP drift and counter...");
    
    setTimeout(() => {
      addLog("Multi-factor challenge accepted.");
      setTimeout(() => {
        onLogin({
          id: 'u1',
          name: email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
          role: selectedRole,
          email: email,
          lastLogin: new Date().toISOString()
        });
      }, 500);
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
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Zero-Trust Auth Gateway</p>
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

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Clearance</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Tier-1 (Viewer)', 'Tier-2 (Analyst)', 'Tier-3 (Admin)'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRole(r)}
                        className={`py-2 px-1 rounded-lg border text-[8px] font-black uppercase transition-all ${
                          selectedRole === r 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'
                        }`}
                      >
                        {r.split(' ')[0]}
                      </button>
                    ))}
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

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={handlePasskeyLogin}
                      disabled={lockoutTimeLeft > 0}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl border border-slate-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-xs disabled:opacity-30"
                    >
                      <Fingerprint className="w-4 h-4 text-blue-400" />
                      Passkey
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setStep('signup'); setCaptchaStatus('idle'); setPassword(''); setConfirmPassword(''); }}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl border border-slate-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-xs"
                    >
                      <UserPlus className="w-4 h-4 text-emerald-400" />
                      Register
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
                  <div className="relative">
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 px-4 text-sm text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-800 font-mono"
                      placeholder="Create complex cipher"
                    />
                    {password && (
                      <div className="flex gap-1 mt-2 px-1">
                        {[...Array(4)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                              i < passwordStrength(password) 
                              ? (passwordStrength(password) < 2 ? 'bg-red-500' : passwordStrength(password) < 4 ? 'bg-orange-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]') 
                              : 'bg-slate-800'
                            }`} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
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
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[9px] text-red-400 font-bold uppercase tracking-tight ml-1 animate-pulse">Ciphers do not match</p>
                  )}
                </div>

                {renderCaptcha()}

                <button 
                  type="submit"
                  disabled={isAuthenticating || captchaStatus !== 'verified' || !password || password !== confirmPassword || passwordStrength(password) < 2}
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
                    Identity parameters have been committed to the Sentinel database. Please verify your personnel link via secure relay.
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

            {step === 'forgot' && (
              <form onSubmit={handleForgotSubmit} className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                <div className="flex items-center gap-3 mb-4">
                   <button type="button" onClick={() => setStep('form')} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /></button>
                   <div>
                     <h3 className="text-white font-bold">Access Recovery</h3>
                   </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Personnel ID</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
                  />
                </div>
                {renderCaptcha()}
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl uppercase text-xs font-black tracking-widest">Initiate Recovery</button>
              </form>
            )}

            {step === 'forgot-success' && (
              <div className="space-y-6 py-8 text-center">
                <Mail className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-white font-bold">Handshake Dispatched</h3>
                <button onClick={() => setStep('form')} className="w-full py-4 bg-slate-800 text-white rounded-xl">Return to Gateway</button>
              </div>
            )}

            {step === 'mfa' && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center space-y-3">
                  <div className="inline-flex p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <Lock className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-white font-bold">Verification Code</h3>
                </div>
                
                <div className="flex justify-center gap-2">
                  {mfaCode.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={mfaRefs[idx]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleMfaChange(e.target.value, idx)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && idx > 0) mfaRefs[idx - 1].current?.focus();
                      }}
                      className="w-12 h-14 bg-slate-950 border border-slate-800 rounded-xl text-center text-blue-500 font-mono text-xl font-bold focus:border-blue-500 outline-none"
                    />
                  ))}
                </div>

                <button 
                  onClick={verifyMFA}
                  disabled={isAuthenticating || mfaCode.some(d => !d)}
                  className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl uppercase text-[11px] tracking-widest"
                >
                  {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Token"}
                </button>
              </div>
            )}

            {step === 'passkey' && (
              <div className="space-y-8 py-6 flex flex-col items-center">
                <Fingerprint className="w-16 h-16 text-blue-500 animate-pulse" />
                <h3 className="text-white font-bold">Biometric Handshake</h3>
                <Loader2 className="w-6 h-6 text-slate-700 animate-spin" />
              </div>
            )}

            <div className="bg-black/60 rounded-2xl p-4 border border-slate-800/50 font-mono text-[9px] h-28 flex flex-col justify-end space-y-1.5 shadow-inner">
              <div className="text-slate-700 uppercase font-black tracking-widest mb-1 border-b border-slate-900 pb-1">Audit Stream</div>
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
