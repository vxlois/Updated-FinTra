import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkflow } from '../hooks/useWorkflow';
import { useAuth } from '../hooks/useAuth';
import { User, Role } from '../types';
import { Mail, UserPlus, Check, Globe, AlertCircle, RefreshCw, Key, ShieldCheck, Twitter, Instagram, ArrowRight, Phone, Facebook } from 'lucide-react';
import { DostLogo } from '../components/DostLogo';
import { InsideBoxLogo } from '../components/InsideBoxLogo';

export function LoginPage() {
  const { signInWithGoogle, loading, error: authError } = useAuth();
  const [showAccounts, setShowAccounts] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Clearance passwords mapping for official accounts
  const ACCOUNT_PASSWORDS: Record<string, string> = {
    'reconjoylyn@gmail.com': 'admin123',
    'loislainalcantara@gmail.com': 'admin123',
    'maria.santos@region5.dost.gov.ph': 'budget123',
    'cesar.aguinaldo@region5.dost.gov.ph': 'accountant123',
    'regina.clave@region5.dost.gov.ph': 'cashier123'
  };

  // Helper dictionary loaded from localStorage for custom generated workspace accounts
  const getCustomPasswords = (): Record<string, string> => {
    try {
      const stored = localStorage.getItem('dost_custom_credentials');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const saveCustomPassword = (email: string, pass: string) => {
    try {
      const current = getCustomPasswords();
      current[email.toLowerCase()] = pass;
      localStorage.setItem('dost_custom_credentials', JSON.stringify(current));
    } catch (e) {
      console.error(e);
    }
  };

  // Password verification and prompt states
  const [passwordVerificationAccount, setPasswordVerificationAccount] = useState<{
    name: string;
    email: string;
    role: Role;
    avatar?: string;
  } | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswordMask, setShowPasswordMask] = useState(false);
  
  // Password reset helper states
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handlePasswordResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setIsResetting(true);
    setResetSuccessMessage(null);
    setTimeout(() => {
      setIsResetting(false);
      setResetSuccessMessage(`A password recovery instruction email has been sent successfully to ${resetEmail}. Please check your inbox.`);
      setResetEmail('');
    }, 1200);
  };

  // Direct login form states (matching InsideBox mockup layout)
  const [directEmail, setDirectEmail] = useState('');
  const [directPassword, setDirectPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotHelp, setShowForgotHelp] = useState(false);

  // Custom account creation state
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState<Role>('Budget Officer');
  const [customPassword, setCustomPassword] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  // Pre-configured official DOST V accounts available on the user's device
  const googleAccounts = [
    {
      name: 'Joylyn Recon',
      email: 'reconjoylyn@gmail.com',
      role: 'Administrator' as Role,
      badge: 'All Clearance Access',
      avatar: 'JR'
    }
  ];

  const handleSelectAccountClick = async (acc: typeof googleAccounts[0]) => {
    setLoadingAccount(acc.email);
    try {
      await signInWithGoogle(acc.name, acc.email, acc.role);
      sessionStorage.setItem('dost_session_signed_pass', ACCOUNT_PASSWORDS[acc.email.toLowerCase()] || 'admin123');
      setShowAccounts(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to authenticate with Google.");
    } finally {
      setLoadingAccount(null);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordVerificationAccount) return;

    const email = passwordVerificationAccount.email.toLowerCase();
    const correctPassword = ACCOUNT_PASSWORDS[email] || getCustomPasswords()[email];

    if (!correctPassword) {
      setPasswordError("No clearance key registered for this workspace email.");
      return;
    }

    if (passwordInput !== correctPassword) {
      setPasswordError("Access Restricted: Invalid administrative password.");
      return;
    }

    setLoadingAccount(passwordVerificationAccount.email);
    setPasswordError(null);
    try {
      await signInWithGoogle(passwordVerificationAccount.name, passwordVerificationAccount.email, passwordVerificationAccount.role);
      // Save password to session to represent signed token signature
      sessionStorage.setItem('dost_session_signed_pass', correctPassword);
      setPasswordVerificationAccount(null);
      setShowAccounts(false);
    } catch (err: any) {
      setPasswordError(err.message || "Authentication token request refused.");
    } finally {
      setLoadingAccount(null);
    }
  };

  // Direct Credentials login submission handler
  const handleDirectLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailClean = directEmail.trim().toLowerCase();
    const passClean = directPassword.trim();

    if (!emailClean || !passClean) {
      setErrorMessage("Please complete all employee credentials.");
      return;
    }

    // Check pre-configured DOST Bicol accounts
    const match = googleAccounts.find(acc => acc.email.toLowerCase() === emailClean);
    let correctPassword = ACCOUNT_PASSWORDS[emailClean];
    let roleToUse: Role | null = null;
    let nameToUse = '';

    if (match) {
      roleToUse = match.role;
      nameToUse = match.name;
    } else {
      // Check custom accounts from local storage
      const customPassMap = getCustomPasswords();
      if (customPassMap[emailClean]) {
        correctPassword = customPassMap[emailClean];
      }
    }

    // If matches custom password but no role was mapped, lookup in detailed array
    if (correctPassword && passClean === correctPassword) {
      if (roleToUse) {
        setLoadingAccount(emailClean);
        try {
          await signInWithGoogle(nameToUse, emailClean, roleToUse);
          sessionStorage.setItem('dost_session_signed_pass', passClean);
        } catch (err: any) {
          setErrorMessage(err.message || "Failed to direct authenticate.");
        } finally {
          setLoadingAccount(null);
        }
        return;
      } else {
        // Find custom detailed account
        try {
          const stored = localStorage.getItem('dost_custom_accounts_detailed');
          const detailedList = stored ? JSON.parse(stored) : [];
          const customAcct = detailedList.find((x: any) => x.email.toLowerCase() === emailClean);
          if (customAcct) {
            setLoadingAccount(emailClean);
            await signInWithGoogle(customAcct.name, customAcct.email, customAcct.role);
            sessionStorage.setItem('dost_session_signed_pass', passClean);
            setLoadingAccount(null);
            return;
          }
        } catch {
          // ignore
        }
      }
    }

    // If incorrect password for recognized account
    if (correctPassword && passClean !== correctPassword) {
      setErrorMessage("Access Restricted: Invalid administrative password.");
      return;
    }

    // Fallback: search custom accounts list
    try {
      const stored = localStorage.getItem('dost_custom_accounts_detailed');
      const detailedList = stored ? JSON.parse(stored) : [];
      const customAcct = detailedList.find((x: any) => x.email.toLowerCase() === emailClean);
      if (customAcct) {
        if (passClean === customAcct.password) {
          setLoadingAccount(emailClean);
          await signInWithGoogle(customAcct.name, customAcct.email, customAcct.role);
          sessionStorage.setItem('dost_session_signed_pass', passClean);
          setLoadingAccount(null);
          return;
        } else {
          setErrorMessage("Access Restricted: Invalid administrative password.");
          return;
        }
      }
    } catch {
      // ignore
    }

    setErrorMessage("No clearance account registered for this email. Please check spelling or use the account selector.");
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailClean = customEmail.trim();

    if (!emailClean || !customName.trim() || !customPassword.trim()) {
      setErrorMessage("Please complete all credentials and passwords.");
      return;
    }

    if (customPassword.trim().length < 4) {
      setErrorMessage("Security policy: password must be at least 4 characters.");
      return;
    }

    if (!emailClean.includes('@') || emailClean.length < 5) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    
    setLoadingAccount('custom');
    try {
      // Save password in local storage dictionary for test logins in this workstation
      saveCustomPassword(emailClean, customPassword.trim());

      // Save detailed accounts array for direct form logins
      try {
        const stored = localStorage.getItem('dost_custom_accounts_detailed');
        const detailedList = stored ? JSON.parse(stored) : [];
        const existingIdx = detailedList.findIndex((x: any) => x.email.toLowerCase() === emailClean.toLowerCase());
        const newAccount = {
          name: customName.trim(),
          email: emailClean,
          role: customRole,
          password: customPassword.trim()
        };
        if (existingIdx >= 0) {
          detailedList[existingIdx] = newAccount;
        } else {
          detailedList.push(newAccount);
        }
        localStorage.setItem('dost_custom_accounts_detailed', JSON.stringify(detailedList));
      } catch (errCustom) {
        console.error(errCustom);
      }
      
      await signInWithGoogle(customName.trim(), emailClean, customRole);
      // Save password to session
      sessionStorage.setItem('dost_session_signed_pass', customPassword.trim());
      
      setIsCreatingCustom(false);
      setShowAccounts(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to authenticate.");
    } finally {
      setLoadingAccount(null);
    }
  };

  // Dynamic greeting matching entered email
  const getGreetingName = () => {
    const emailClean = directEmail.trim().toLowerCase();
    if (!emailClean) return '';
    const match = googleAccounts.find(acc => acc.email.toLowerCase() === emailClean);
    if (match) return match.name;
    try {
      const stored = localStorage.getItem('dost_custom_accounts_detailed');
      const detailedList = stored ? JSON.parse(stored) : [];
      const customAcct = detailedList.find((x: any) => x.email.toLowerCase() === emailClean);
      if (customAcct) return customAcct.name;
    } catch {
      // ignore
    }
    return '';
  };

  const displayNameForGreeting = getGreetingName();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Main Container - High Fidelity Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row bg-slate-100">
        
        {/* Left Panel: DOST Regional Branding (OneDOST4U theme) */}
        <div className="flex w-full md:w-[45%] lg:w-[50%] xl:w-[52%] text-white pt-10 pb-[36px] md:pb-6 px-6 sm:px-10 md:pl-6 md:pr-4 lg:pl-10 lg:pr-[80px] xl:pr-[120px] flex-col justify-between relative overflow-hidden select-none bg-gradient-to-b from-[#013c6e] via-[#025191] to-[#014073]">
          {/* Subtle dark pattern overlay for premium texture depth */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08)_0%,transparent_70%)] z-0 pointer-events-none" />

          {/* Top Left minimal header details (Target of CSS Selector for exact upper-left alignment) */}
          <div 
            style={{ paddingTop: '3px', paddingLeft: '0px', paddingRight: '0px', paddingBottom: '2px', maxWidth: 'none' }}
            className="relative z-10 flex items-center gap-2 self-start w-full max-w-full"
          >
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-lg shrink-0">
              <DostLogo className="w-10 h-10" />
            </div>
            <div className="flex flex-col text-left font-sans gap-0.5 text-[9.5px] min-[375px]:text-[11px] sm:text-xs xl:text-sm justify-center">
              <span 
                style={{ textAlign: 'left', lineHeight: '15px', paddingLeft: '1px', whiteSpace: 'nowrap' }}
                className="font-normal text-white"
              >
                Department of Science and Technology
              </span>
              <span 
                style={{ textAlign: 'left', lineHeight: '15px', whiteSpace: 'nowrap' }}
                className="font-normal text-white"
              >
                DOST Region V
              </span>
              <span 
                style={{ textAlign: 'left', lineHeight: '15px', fontWeight: 'normal', fontFamily: 'Poppins', whiteSpace: 'nowrap' }}
                className="font-normal text-white/90"
              >
                Finance and Administrative Services
              </span>
            </div>
          </div>

          {/* Center brand exhibit - flush left, font sizes customized as requested */}
          <div className="relative z-10 my-8 md:my-auto text-left w-full max-w-full">
            <h1 
              style={{ fontSize: 'clamp(32px, 5.5vw, 70px)' }}
              className="font-bold font-sans tracking-tight leading-none text-white select-none drop-shadow-md"
            >
              FinTra
            </h1>
            <p 
              style={{ paddingLeft: '1px', paddingRight: '3px', marginLeft: '0px', marginTop: '0px', fontSize: 'clamp(14px, 1.8vw, 22px)' }}
              className="font-light font-sans tracking-tight text-white/90 leading-normal drop-shadow-xs whitespace-normal xl:whitespace-nowrap animate-fade-in"
            >
              Solutions and Opportunities for All
            </p>
          </div>

          {/* Bottom Panel handles: Website, Phone, Email, Facebook beautifully organized and staying safely inside solid blue */}
          <div className="relative z-10 pt-4 border-t border-white/10 w-full text-white/80 max-w-full hidden md:block animate-fade-in">
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 lg:flex lg:flex-row lg:flex-nowrap lg:items-center lg:justify-between lg:gap-x-2 text-[10px] md:text-[9.5px] lg:text-[10px] xl:text-[11px] font-normal overflow-hidden">
              <a href="https://region5.dost.gov.ph" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition cursor-pointer shrink-0">
                <Globe className="w-3.5 h-3.5 lg:w-3 lg:h-3 shrink-0 text-sky-300" />
                <span className="font-sans truncate">region5.dost.gov.ph</span>
              </a>
              <div className="flex items-center gap-1.5 hover:text-white transition shrink-0">
                <Phone className="w-3.5 h-3.5 lg:w-3 lg:h-3 shrink-0 text-sky-300" />
                <span className="font-sans truncate">09671152307</span>
              </div>
              <a href="mailto:albay@ro5.dost.gov.ph" className="flex items-center gap-1.5 hover:text-white transition cursor-pointer shrink-0">
                <Mail className="w-3.5 h-3.5 lg:w-3 lg:h-3 shrink-0 text-sky-300" />
                <span className="font-sans truncate" title="albay@ro5.dost.gov.ph">albay@ro5.dost.gov.ph</span>
              </a>
              <a href="https://www.facebook.com/dost5albay/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition cursor-pointer shrink-0">
                <Facebook className="w-3.5 h-3.5 lg:w-3 lg:h-3 shrink-0 text-sky-300" />
                <span className="font-sans truncate">DOST-Albay</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Panel: Interactive Google OAuth Entry Portal */}
        <div className="flex-1 flex flex-col justify-between items-center p-6 sm:p-10 md:p-6 lg:p-12 xl:p-16 bg-[#f8fafc]">
          
          {/* Centering space helper for desktop size */}
          <div className="hidden md:block flex-1" />

          {/* Main Card */}
          <div className="w-full max-w-[340px] bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-5 sm:p-6 md:p-5 lg:p-6 font-sans relative my-auto">
            
            <div>
              <h2 style={{ fontSize: '22px' }} className="font-semibold text-slate-800 tracking-tight mt-0.5 mb-4 font-sans">
                Welcome to FinTra!
              </h2>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50/60 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-shake font-sans">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <span className="leading-snug font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Credentials Login Form */}
            <form onSubmit={handleDirectLoginSubmit} className="space-y-3.5">
              
              {/* Email Address Input */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-sans block">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  placeholder="Enter your email"
                  style={{ fontSize: '12px' }}
                  className="w-full h-10 px-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 placeholder-slate-400 text-slate-800 transition duration-150 font-sans shadow-2xs"
                  value={directEmail}
                  onChange={(e) => setDirectEmail(e.target.value)}
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-sans block">
                  Password
                </label>
                <div className="relative">
                  <input
                    required
                    type={showPasswordMask ? "text" : "password"}
                    placeholder="Enter your password"
                    style={{ fontSize: '12px' }}
                    className="w-full h-10 pl-3.5 pr-11 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 placeholder-slate-400 text-slate-800 transition duration-150 font-sans shadow-2xs"
                    value={directPassword}
                    onChange={(e) => setDirectPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordMask(!showPasswordMask)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer select-none transition"
                  >
                    {showPasswordMask ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Checkbox "Remember for 30 days" & Link "Forgot password" */}
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-sans text-slate-500 pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 h-3.5 w-3.5 cursor-pointer"
                  />
                  <span>Remember</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[#025191] hover:text-[#025191]/90 font-semibold cursor-pointer font-sans transition"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-[#025191] hover:bg-[#025191]/90 text-white font-semibold rounded-xl text-xs sm:text-sm transition duration-150 cursor-pointer flex items-center justify-center shadow-md shadow-[#025191]/10 font-sans select-none"
              >
                {loading ? "Authenticating..." : "Sign in"}
              </button>
            </form>

            {/* Google Authentication alternate login button */}
            <div className="relative my-4 select-none font-sans flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <span className="relative px-2.5 bg-white text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Or continue with</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setShowAccounts(true);
              }}
              className="w-full h-10 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold px-4 rounded-xl transition duration-150 text-xs sm:text-sm select-none cursor-pointer font-sans shadow-2xs"
            >
              {/* Google Icon logo */}
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Footer switcher to register another admin / employee */}
            <div className="mt-5 text-center text-xs text-slate-500 font-sans select-none">
              <span>Don't have an account? </span>
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setIsCreatingCustom(true);
                  setShowAccounts(true);
                }}
                type="button"
                className="text-[#025191] hover:text-[#025191]/90 font-bold transition cursor-pointer font-sans"
              >
                Sign up
              </button>
            </div>

          </div>

          {/* Spacer for desktop layout centering */}
          <div className="hidden md:block flex-1" />

          {/* Social Platforms for Mobile (Phone) Size */}
          <div className="w-full max-w-md mt-7 pt-5 border-t border-slate-200/60 pb-1 md:hidden text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 font-sans">
              Contact & Support Details
            </p>
            <div className="flex justify-center">
              <div className="grid grid-cols-[145px_115px] gap-x-4 gap-y-3 text-left text-[10px] sm:text-[11px] font-semibold text-slate-500 mx-auto">
                <a href="https://region5.dost.gov.ph" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#025191] transition cursor-pointer min-w-0">
                  <Globe className="w-4 h-4 shrink-0 text-[#025191]" />
                  <span className="font-sans truncate">region5.dost.gov.ph</span>
                </a>
                <div className="flex items-center gap-2 hover:text-[#025191] transition min-w-0">
                  <Phone className="w-4 h-4 shrink-0 text-[#025191]" />
                  <span className="font-sans truncate">09671152307</span>
                </div>
                <a href="mailto:albay@ro5.dost.gov.ph" className="flex items-center gap-2 hover:text-[#025191] transition cursor-pointer min-w-0">
                  <Mail className="w-4 h-4 shrink-0 text-[#025191]" />
                  <span className="font-sans truncate" title="albay@ro5.dost.gov.ph">albay@ro5.dost.gov.ph</span>
                </a>
                <a href="https://www.facebook.com/dost5albay/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#025191] transition cursor-pointer min-w-0">
                  <Facebook className="w-4 h-4 shrink-0 text-[#025191]" />
                  <span className="font-sans truncate">DOST-Albay</span>
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Google Real Account Selector Overlay Modal */}
      {showAccounts && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in font-inter">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5 animate-scale-up">
            
            {/* Header Google Identity Branding */}
            <div className="p-6 pb-4 border-b border-slate-100 flex flex-col items-center select-none">
              <div className="flex gap-1.5 items-center justify-center py-1">
                <span className="text-blue-500 font-bold text-xl font-sans">G</span>
                <span className="text-red-500 font-bold text-xl font-sans">o</span>
                <span className="text-yellow-500 font-bold text-xl font-sans">o</span>
                <span className="text-blue-500 font-bold text-xl font-sans">g</span>
                <span className="text-green-500 font-bold text-xl font-sans">l</span>
                <span className="text-red-500 font-bold text-xl font-sans">e</span>
              </div>
              <h3 className="text-base font-bold text-slate-800 mt-2 font-sans">Choose an account</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-inter">
                to continue to <span className="font-semibold text-blue-600">FinTra</span>
              </p>
            </div>

            {loadingAccount ? (
              /* Loading auth transition */
              <div className="p-16 flex flex-col items-center justify-center font-inter">
                <RefreshCw className="w-9 h-9 text-blue-600 animate-spin" />
                <p className="text-xs font-bold text-slate-600 mt-4 animate-pulse font-sans">Requesting authorization token...</p>
              </div>
            ) : passwordVerificationAccount ? (
              /* Clearance Password Prompt Screen */
              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4 font-inter text-slate-700">
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-205/50">
                  <div className="w-10 h-10 rounded-full bg-sky-50 border border-sky-200/60 flex items-center justify-center font-sans font-black text-sky-800 text-sm">
                    {passwordVerificationAccount.avatar || passwordVerificationAccount.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-none truncate font-sans">{passwordVerificationAccount.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1 leading-none truncate">{passwordVerificationAccount.email}</p>
                    <p className="text-[10px] text-[#0c4a6e] font-extrabold uppercase mt-1.5 leading-none tracking-tight font-sans">
                      {passwordVerificationAccount.role}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Workspace Password</label>
                    <span className="text-[9px] text-[#0c4a6e] font-bold font-mono px-1.5 py-0.5 bg-slate-100/80 rounded-md">
                      Test Pass: {ACCOUNT_PASSWORDS[passwordVerificationAccount.email.toLowerCase()] || getCustomPasswords()[passwordVerificationAccount.email.toLowerCase()] || "your key"}
                    </span>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      autoFocus
                      type={showPasswordMask ? "text" : "password"}
                      placeholder="Enter organizational password..."
                      className="w-full pl-9 pr-14 h-10 border border-slate-250 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-1 focus:ring-[#0c4a6e] focus:border-[#0c4a6e] focus:outline-none placeholder-slate-350"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordMask(!showPasswordMask)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600 font-sans cursor-pointer select-none"
                    >
                      {showPasswordMask ? "Hide" : "Show"}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1 animate-pulse font-sans">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {passwordError}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordVerificationAccount(null);
                      setPasswordInput('');
                      setPasswordError(null);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition font-sans"
                  >
                    Back to Accounts
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0c4a6e] hover:bg-[#083550] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 font-sans cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Verify Clearance
                  </button>
                </div>
              </form>
            ) : isCreatingCustom ? (
              /* Custom Account Generator for flexibility */
              <form onSubmit={handleCustomSubmit} className="p-6 space-y-4 font-inter">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="email"
                      placeholder="e.g. name@example.com"
                      className="w-full pl-9 pr-3 h-9 border border-slate-250 rounded-lg text-xs font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Dr. Maria Santos"
                    className="w-full px-3 h-9 border border-slate-250 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">Section Designation</label>
                  <select
                    className="w-full px-3 h-9 border border-slate-250 rounded-lg text-xs font-medium text-slate-700 bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value as Role)}
                  >
                    <option value="Budget Officer">Budget Officer (Budget Unit)</option>
                    <option value="Chief Accountant">Chief Accountant (Accounting Unit)</option>
                    <option value="Disbursing Cashier">Disbursing Cashier (Cashiering Unit)</option>
                    <option value="Administrator">Administrator (Regional Director)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="password"
                      placeholder="Enter password..."
                      className="w-full pl-9 pr-3 h-9.5 border border-slate-250 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingCustom(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                  >
                    Back to Accounts
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0c4a6e] hover:bg-[#083550] text-white text-xs font-bold rounded-lg transition"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            ) : (
              /* Standard Accounts selector */
              <div className="font-inter">
                <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-100">
                  {googleAccounts.map((acc, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectAccountClick(acc)}
                      type="button"
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition text-left cursor-pointer select-none group"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-105 flex items-center justify-center font-mono font-bold text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition duration-150 shrink-0">
                          {acc.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 leading-none truncate font-sans">{acc.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono leading-none mt-1 truncate">{acc.email}</p>
                          <p className="text-[10px] text-slate-500 leading-none mt-2 font-semibold uppercase tracking-tight">{acc.role}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-150 group-hover:bg-blue-50 group-hover:text-blue-650 px-2 py-0.5 rounded transition shrink-0">
                        Select
                      </span>
                    </button>
                  ))}
                </div>

                {/* Switcher to Custom Profile */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
                  <button
                    onClick={() => setIsCreatingCustom(true)}
                    type="button"
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    Use another workspace email
                  </button>
                  <button
                    onClick={() => setShowAccounts(false)}
                    type="button"
                    className="text-slate-500 hover:text-slate-800 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


    </div>
  );
}
