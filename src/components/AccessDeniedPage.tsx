import React from 'react';
import { ShieldAlert, ArrowLeft, HelpCircle } from 'lucide-react';
import { Role } from '../types';

interface AccessDeniedPageProps {
  requiredRole: Role;
  currentRole: Role;
  sectionName: string;
  onGoBack: () => void;
}

export function AccessDeniedPage({ requiredRole, currentRole, sectionName, onGoBack }: AccessDeniedPageProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto my-8 animate-scale-up">
      <div className="h-2 bg-amber-500"></div>
      <div className="p-8">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-sm animate-pulse">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Security Clearance Restricted</h3>
            <p className="text-xs text-amber-700 font-bold uppercase tracking-wider font-mono mt-0.5">Access Denied • {sectionName}</p>
          </div>
        </div>

        <div className="w-full h-[1px] bg-slate-100 my-6"></div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <p>
            Your current validated security identity clearance is <strong className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded font-mono uppercase">{currentRole}</strong>, which does not possess the direct authority required to inspect or write data within the <strong className="text-slate-800">{sectionName}</strong> segment.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs border-b border-slate-200/60 pb-2">
              <span className="text-slate-400 uppercase font-bold tracking-wider font-mono text-[9px]">Required Level:</span>
              <span className="font-mono font-bold text-amber-700 uppercase">{requiredRole} (or Administrator)</span>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-slate-400 uppercase font-bold tracking-wider font-mono text-[9px]">Attempted Path:</span>
              <span className="font-mono text-slate-500">#{sectionName.toLowerCase().replace(' ', '')}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            Note: If you are an Auditor testing the ledger workflow, you can log out and choose the required role card on our Google Auth Gateway, or log in as an administrator to bypass all regional desk desk lockouts.
          </p>
        </div>

        <div className="w-full h-[1px] bg-slate-100 my-6"></div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1 justify-between items-center">
          <button
            onClick={onGoBack}
            className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </button>
          
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Need assistance? Contact sysadmin@gov.ph
          </div>
        </div>
      </div>
    </div>
  );
}
