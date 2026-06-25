import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';
import { DostLogo } from '../components/DostLogo';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Valid official DOST V regional registered emails
  const REGISTERED_EMAILS = [
    'loislainalcantara@gmail.com',
    'maria.santos@region5.dost.gov.ph',
    'cesar.aguinaldo@region5.dost.gov.ph',
    'regina.clave@region5.dost.gov.ph'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    // Simulate standard secure backend network checking with 1.2s delay
    setTimeout(() => {
      setLoading(false);
      const isRegistered = REGISTERED_EMAILS.some(
        (registered) => registered.toLowerCase() === email.trim().toLowerCase()
      );

      if (isRegistered) {
        setSuccess(`A password password recovery link has been sent to ${email}. Please check your inbox within 15 minutes to reset your security credentials.`);
      } else {
        setError(`This email address (${email}) is not registered in our secure system directory.`);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-6 font-sans select-none">
      
      {/* Centered card container */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-150/80 shadow-2xl shadow-slate-200/50 p-8 sm:p-10 relative">
        
        {/* DOST Brand Branding consistent with login page */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-blue-50/60 rounded-full border border-blue-100 mb-4 animate-fade-in">
            <DostLogo className="w-12 h-12" />
          </div>
          <h1 className="text-[22px] font-bold text-slate-800 tracking-tight text-center uppercase font-sans">
            Forgot Password
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 text-center font-sans tracking-wide">
            Enter your email to verify your account
          </p>
        </div>

        {/* Success Alert Block */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-start gap-3 animate-fade-in font-sans leading-relaxed">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <div>
              <span className="font-bold block mb-0.5">✓ Reset Link Dispatched</span>
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* Error Alert Block */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50/60 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-start gap-3 animate-shake font-sans leading-relaxed">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <div>
              <span className="font-bold block mb-0.5">✕ Validation Failed</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Input Field with explicit HTML id and validation */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="recovery-email" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-sans block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="recovery-email"
                  required
                  type="email"
                  placeholder="your.email@region5.dost.gov.ph"
                  className="w-full h-11 pl-11 pr-4 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-4 focus:ring-[#025191]/10 focus:border-[#025191] placeholder-slate-400 text-slate-800 transition duration-150 font-sans shadow-2xs"
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Submit button with loading state */}
            <button
              id="send-reset-btn"
              type="submit"
              disabled={loading || !email}
              className={`w-full h-11 bg-[#025191] hover:bg-[#025191]/90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-150 shadow-md shadow-blue-900/10 flex items-center justify-center gap-2 cursor-pointer ${
                (loading || !email) ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Account...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>

          </form>
        )}

        {/* Back navigation option */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex justify-center">
          <Link
            id="back-to-login-link"
            to="/login"
            className="flex items-center gap-1.5 text-xs font-bold text-[#025191] hover:text-[#025191]/80 transition font-sans cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Login</span>
          </Link>
        </div>

      </div>

      {/* Decorative Branding Watermark consistent with other views */}
      <span className="text-[10px] text-slate-400/70 font-mono mt-8 block select-none">
        DOST-V FTS • CENTRAL PORTAL SERVICES
      </span>

    </div>
  );
}
