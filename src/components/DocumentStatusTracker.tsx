import React from 'react';
import { Document } from '../types';
import { Check, ClipboardList, BookOpen, CreditCard, AlertTriangle, User, Calendar } from 'lucide-react';

interface DocumentStatusTrackerProps {
  document: Document;
}

export const DocumentStatusTracker: React.FC<DocumentStatusTrackerProps> = ({ document }) => {
  const steps = [
    {
      id: 'BUDGET',
      title: 'Budget Allocation Desk',
      description: 'Document Registration & ORS Generation',
      icon: ClipboardList,
      isCompleted: () => {
        return !!document.orsNumber && document.status !== 'BUDGET_PENDING' && document.status !== 'ACCOUNTING_RETURNED';
      },
      isActive: () => {
        return document.currentSection === 'BUDGET' || document.status === 'BUDGET_PENDING';
      },
      details: () => (
        <div className="text-xs text-slate-500 mt-2 space-y-1">
          {document.orsNumber && (
            <div className="flex items-center gap-1 font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit">
              <span>ORS:</span> {document.orsNumber}
            </div>
          )}
          {document.budgetApprovedBy && (
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{document.budgetApprovedBy}</span>
            </div>
          )}
          {document.budgetDateApproved && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{document.budgetDateApproved}</span>
            </div>
          )}
          {document.budgetRemarks && (
            <p className="italic text-slate-500 bg-slate-100 p-2 rounded border border-slate-200 mt-1">
              "{document.budgetRemarks}"
            </p>
          )}
        </div>
      )
    },
    {
      id: 'ACCOUNTING',
      title: 'Accounting Audit Desk',
      description: 'Tax Computations, JEV & DV Verification',
      icon: BookOpen,
      isCompleted: () => {
        return document.status === 'ACCOUNTING_APPROVED' || document.status === 'CASHIER_PENDING' || document.status === 'CASHIER_PAID';
      },
      isActive: () => {
        return document.currentSection === 'ACCOUNTING';
      },
      details: () => (
        <div className="text-xs text-slate-500 mt-2 space-y-1">
          {document.jevNumber && (
            <div className="flex flex-wrap gap-1.5 font-mono">
              <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">JEV: {document.jevNumber}</span>
              {document.dvNumber && (
                <span className="text-teal-600 bg-teal-50 px-2 py-0.5 rounded">DV: {document.dvNumber}</span>
              )}
            </div>
          )}
          {document.taxConfig && (
            <div className="bg-slate-50 p-2 rounded border border-slate-200 mt-1 space-y-0.5">
              <div className="flex justify-between">
                <span>Withholding Tax:</span>
                <span className="font-semibold text-slate-700">₱{document.taxConfig.withholdingTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT Deduction:</span>
                <span className="font-semibold text-slate-700">₱{document.taxConfig.vatAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-0.5 font-semibold">
                <span>Net Released:</span>
                <span className="text-emerald-600">₱{document.taxConfig.netAmount.toLocaleString()}</span>
              </div>
            </div>
          )}
          {document.accountingApprovedBy && (
            <div className="flex items-center gap-1 mt-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{document.accountingApprovedBy}</span>
            </div>
          )}
          {document.accountingRemarks && (
            <p className="italic text-slate-500 bg-slate-100 p-2 rounded border border-slate-200 mt-1">
              "{document.accountingRemarks}"
            </p>
          )}
        </div>
      )
    },
    {
      id: 'CASHIER',
      title: 'Cashier Disbursement Desk',
      description: 'Check Prep, EMDS Release & Bank Wire',
      icon: CreditCard,
      isCompleted: () => {
        return document.status === 'CASHIER_PAID';
      },
      isActive: () => {
        return document.currentSection === 'CASHIER';
      },
      details: () => (
        <div className="text-xs text-slate-500 mt-2 space-y-1">
          {document.paymentMode && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Mode:</span>
              <span className="font-mono bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded">{document.paymentMode}</span>
            </div>
          )}
          {document.checkNumber && (
            <div className="font-mono text-xs">
              Check No: <span className="text-slate-700 font-semibold">{document.checkNumber}</span>
            </div>
          )}
          {document.paymentReleasedDate && (
            <div className="flex items-center gap-1 text-emerald-600 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>Disbursed on {document.paymentReleasedDate}</span>
            </div>
          )}
          {document.cashierRemarks && (
            <p className="italic text-slate-500 bg-slate-100 p-2 rounded border border-slate-200 mt-1">
              "{document.cashierRemarks}"
            </p>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="relative">
      {/* If document was returned for compliance */}
      {document.status === 'ACCOUNTING_RETURNED' && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5 animate-bounce" />
          <div className="text-sm">
            <h4 className="font-bold">Returned for Compliance Action</h4>
            <p className="text-xs text-rose-700 mt-1">{document.accountingRemarks}</p>
            <p className="text-xs text-slate-500 mt-2 font-medium">Please verify checklists, re-attach missing certifications, and re-submit from budget.</p>
          </div>
        </div>
      )}

      {/* Grid Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const completed = step.isCompleted();
          const active = step.isActive();

          return (
            <div 
              key={step.id} 
              className={`p-4 rounded-xl border relative transition shadow-sm ${
                completed ? 'bg-emerald-50/40 border-emerald-100' :
                active ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-indigo-500 ring-offset-2' :
                'bg-white border-slate-200'
              }`}
            >
              {/* Timeline Connector lines */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-[2px] bg-slate-200 z-10" />
              )}

              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  completed ? 'bg-emerald-100 text-emerald-700' :
                  active ? 'bg-indigo-600 text-white' :
                  'bg-slate-100 text-slate-500'
                }`}>
                  {completed ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>

                <div>
                  <h4 className={`text-sm font-bold tracking-tight ${active ? 'text-white' : 'text-slate-800'}`}>
                    {step.title}
                  </h4>
                  <p className={`text-xs ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Specific metadata context renderer */}
              <div className={`mt-3 pt-3 border-t ${active ? 'border-slate-800' : 'border-slate-100'}`}>
                {step.details()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
