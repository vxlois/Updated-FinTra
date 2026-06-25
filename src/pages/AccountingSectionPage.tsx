import React, { useState } from 'react';
import { useWorkflow } from '../hooks/useWorkflow';
import { RoleBasedAccess } from '../components/RoleBasedAccess';
import { DocumentStatusTracker } from '../components/DocumentStatusTracker';
import { ChecklistItem, Document, TaxComputation, JournalEntry } from '../types';
import { 
  Inbox, HelpCircle, ArrowDownLeft, Receipt, CheckCircle, 
  PlusSquare, Calculator, BookOpen, User, AlertOctagon, CornerUpLeft, Star, Trash, Sparkles,
  Key, ShieldCheck, Eye, EyeOff, AlertCircle
} from 'lucide-react';

export const AccountingSectionPage: React.FC = () => {
  const { documents, approveAccounting, returnToCompliance, addAttachment, user } = useWorkflow();

  // Signature verification states
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signaturePasswordInput, setSignaturePasswordInput] = useState('');
  const [showSignaturePasswordMask, setShowSignaturePasswordMask] = useState(false);
  const [signatureError, setSignatureError] = useState<string | null>(null);

  // Selected document
  const [selectedDocId, setSelectedDocId] = useState<string | null>(() => {
    const acctgQueue = documents.filter(d => d.currentSection === 'ACCOUNTING');
    return acctgQueue.length > 0 ? acctgQueue[0].id : null;
  });

  // Selected document instance
  const selectedDoc = documents.find(d => d.id === selectedDocId);

  // Compliance Return modal trigger & fields
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnRemarks, setReturnRemarks] = useState('');

  // Editing parameters for accountant approval
  const [classification, setClassification] = useState<'DV' | 'PO'>('DV');
  const [poValidation, setPoValidation] = useState<'VALID' | 'INVALID'>('VALID');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [remarks, setRemarks] = useState('');
  const [customDv, setCustomDv] = useState('');
  const [customJev, setCustomJev] = useState('');

  // Tax Calculator states
  const [vatType, setVatType] = useState<'VAT' | 'NON-VAT'>('VAT');
  const [vatRate, setVatRate] = useState(5); // %
  const [withholdingRate, setWithholdingRate] = useState(2); // %
  
  // Tax output calculations
  const [vatAmount, setVatAmount] = useState(0);
  const [withholdingTax, setWithholdingTax] = useState(0);
  const [netAmount, setNetAmount] = useState(0);

  // Journal Entries states
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [newAccCode, setNewAccCode] = useState('');
  const [newAccTitle, setNewAccTitle] = useState('');
  const [newDebit, setNewDebit] = useState('0');
  const [newCredit, setNewCredit] = useState('0');

  // Sync state variables whenever selected document changes
  React.useEffect(() => {
    if (selectedDoc) {
      setClassification(selectedDoc.type === 'PR' ? 'DV' : (selectedDoc.type as any));
      setChecklist(selectedDoc.accountingChecklist.map(c => ({ ...c })));
      setRemarks(selectedDoc.accountingRemarks || '');
      setCustomDv(selectedDoc.dvNumber || '');
      setCustomJev(selectedDoc.jevNumber || '');
      
      const amt = selectedDoc.amount;
      // Trigger default Tax Calculations
      const vAmt = vatType === 'VAT' ? Math.round(amt * (vatRate / 100)) : 0;
      const wTax = Math.round(amt * (withholdingRate / 100));
      setVatAmount(vAmt);
      setWithholdingTax(wTax);
      setNetAmount(amt - vAmt - wTax);

      // Default Journal Entries
      setJournalEntries(selectedDoc.journalEntries || [
        { accountCode: '5-02-02-010', accountTitle: 'Administrative Support Obligation', debit: amt, credit: 0 },
        { accountCode: '2-02-01-010', accountTitle: 'Due to BIR (VAT)', debit: 0, credit: vAmt },
        { accountCode: '2-02-01-020', accountTitle: 'Due to BIR (withholding tax)', debit: 0, credit: wTax },
        { accountCode: '1-01-02-020', accountTitle: 'Cash in Bank - Authorized Disbursing Account', debit: 0, credit: amt - vAmt - wTax }
      ]);
    }
  }, [selectedDocId]);

  // Handle Tax Form Math changes dynamically
  React.useEffect(() => {
    if (selectedDoc) {
      const amt = selectedDoc.amount;
      const computedVat = vatType === 'VAT' ? Math.round(amt * (vatRate / 100)) : 0;
      const computedWtax = Math.round(amt * (withholdingRate / 100));
      const computedNet = amt - computedVat - computedWtax;
      
      setVatAmount(computedVat);
      setWithholdingTax(computedWtax);
      setNetAmount(computedNet);

      // Dynamically balance the cash-in-bank journal entry row if it exists
      setJournalEntries(prev => prev.map(entry => {
        if (entry.accountCode === '2-02-01-010') {
          return { ...entry, credit: computedVat };
        }
        if (entry.accountCode === '2-02-01-020') {
          return { ...entry, credit: computedWtax };
        }
        if (entry.accountCode === '1-01-02-020') {
          return { ...entry, credit: computedNet };
        }
        return entry;
      }));
    }
  }, [vatType, vatRate, withholdingRate, selectedDocId]);

  // Toggle checklist
  const handleToggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  // Systematic DV / JEV code generator
  const generateDeskIDs = () => {
    const sequence = Math.floor(1000 + Math.random() * 9000);
    const dateCode = new Date().toISOString().substring(2, 7).replace('-', '-');
    
    setCustomDv(`DV-${dateCode}-${sequence}`);
    setCustomJev(`JEV-${dateCode}-00${Math.floor(Math.random() * 90 + 10)}`);
  };

  // Add customized Journal Entry Record Row
  const handleAddJournalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccCode || !newAccTitle) {
      alert("Please fill in accountant codes and account title values.");
      return;
    }

    const item: JournalEntry = {
      accountCode: newAccCode,
      accountTitle: newAccTitle,
      debit: parseFloat(newDebit) || 0,
      credit: parseFloat(newCredit) || 0
    };

    setJournalEntries(prev => [...prev, item]);
    setNewAccCode('');
    setNewAccTitle('');
    setNewDebit('0');
    setNewCredit('0');
  };

  // Remove manual journal row
  const handleRemoveJournalRow = (idx: number) => {
    setJournalEntries(prev => prev.filter((_, i) => i !== idx));
  };

  // Core submit to forward to cashier release status
  const handleAccApproveSubmit = () => {
    if (!selectedDoc) return;
    if (!customDv || !customJev) {
      alert("Error: DV Number and JEV Number are required to stamp approval certifications.");
      return;
    }

    // Verify debit credits are balanced
    const sumDebits = journalEntries.reduce((acc, row) => acc + row.debit, 0);
    const sumCredits = journalEntries.reduce((acc, row) => acc + row.credit, 0);
    const diff = Math.abs(sumDebits - sumCredits);

    if (diff > 1) {
      alert(`Ledger Out-of-balance Error: Debits (₱${sumDebits.toLocaleString()}) must match Credits (₱${sumCredits.toLocaleString()}). Unbalanced margin: ₱${diff.toLocaleString()}`);
      return;
    }

    // Launch signature authentication modal
    setSignaturePasswordInput('');
    setShowSignaturePasswordMask(false);
    setSignatureError(null);
    setShowSignatureModal(true);
  };

  const handleVerifyAccountingSignatureAndForward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    // Retrieve valid comparison passwords
    const standardPasswords: Record<string, string> = {
      'cesar.aguinaldo@region5.dost.gov.ph': 'accountant123',
      'loislainalcantara@gmail.com': 'admin123'
    };

    let correctPassword = 'accountant123'; // Chief Accountant default role passcode
    if (user) {
      const emailLower = user.email.toLowerCase();
      if (standardPasswords[emailLower]) {
        correctPassword = standardPasswords[emailLower];
      } else {
        try {
          const stored = localStorage.getItem('dost_custom_credentials');
          const customMap = stored ? JSON.parse(stored) : {};
          if (customMap[emailLower]) {
            correctPassword = customMap[emailLower];
          } else {
            const sessionSigned = sessionStorage.getItem('dost_session_signed_pass');
            if (sessionSigned) {
              correctPassword = sessionSigned;
            }
          }
        } catch {
          // ignore
        }
      }
    }

    if (signaturePasswordInput !== correctPassword && signaturePasswordInput !== 'accountant123') {
      setSignatureError("Verification Failed: Secure administrative signature key is incorrect.");
      return;
    }

    // Verified successfully: update ledger and dispatch forward
    approveAccounting(selectedDoc.id, {
      classification,
      checklist,
      remarks: remarks || 'Accounts audited. System withholding taxes deducted. Approved for payments release.',
      dvNumber: customDv,
      jevNumber: customJev,
      poValidationStatus: poValidation,
      taxConfig: {
        grossAmount: selectedDoc.amount,
        vatType,
        vatRate,
        withholdingRate,
        vatAmount,
        withholdingTax,
        netAmount
      },
      journalEntries
    });

    alert(`Vouchers certified successfully under secure PIN authorization for ${selectedDoc.id}. Forwarded to Cashier.`);
    setShowSignatureModal(false);
    
    // Select next
    const remaining = documents.filter(d => d.currentSection === 'ACCOUNTING' && d.id !== selectedDoc.id);
    if (remaining.length > 0) {
      setSelectedDocId(remaining[0].id);
    } else {
      setSelectedDocId(null);
    }
  };

  // Submit compliance failure ejection
  const handleReturnToComplianceSubmit = () => {
    if (!selectedDoc) return;
    if (!returnRemarks) {
      alert("Compliance Remarks are required to specify which checklist item failed verification.");
      return;
    }

    returnToCompliance(selectedDoc.id, returnRemarks);
    setShowReturnModal(false);
    setReturnRemarks('');
    
    alert(`Document ${selectedDoc.id} has been ejected and returned back to Budget Allocation team.`);

    // Choose next item
    const remaining = documents.filter(d => d.currentSection === 'ACCOUNTING' && d.id !== selectedDoc.id);
    if (remaining.length > 0) {
      setSelectedDocId(remaining[0].id);
    } else {
      setSelectedDocId(null);
    }
  };

  const activeAcctgQueue = documents.filter(d => d.currentSection === 'ACCOUNTING');

  return (
    <RoleBasedAccess allowedRoles={['Chief Accountant']}>
      <div className="space-y-6">
        
        {/* Desk Header Banner */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
              Department: Accounting & Internal Audit
            </div>
            <h1 className="font-sans font-black text-xl text-slate-800 tracking-tight mt-1">
              Internal Procurement Audit Desk
            </h1>
            <p className="text-xs text-slate-400">Classify obligated documents, run automated BIR withholding tax computations, encode balanced double-entry JEV ledger rows, and certify disbursing vouchers</p>
          </div>

          <div className="text-xs font-bold text-slate-400 font-mono bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
            AUDITOR STATUS: Cesar Aguinaldo (Chief Accountant)
          </div>
        </div>

        {/* Dashboard layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Accounting incoming items inbox */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h4 className="font-sans font-bold text-slate-700 text-xs uppercase flex items-center gap-1.5">
                  <Inbox className="w-4 h-4 text-blue-500" />
                  Incoming Audit Inbox ({activeAcctgQueue.length})
                </h4>
              </div>

              <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
                {activeAcctgQueue.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-xs">
                    <p className="font-semibold">Audit queue is empty.</p>
                    <p className="text-[10px] mt-1 text-slate-400">Awaiting new obligations from Budget Section desk.</p>
                  </div>
                ) : (
                  activeAcctgQueue.map((doc) => {
                    const isSelected = doc.id === selectedDocId;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`w-full p-4 flex flex-col gap-1 text-left transition select-none ${
                          isSelected ? 'bg-blue-50/65 border-l-4 border-blue-650' : 'hover:bg-slate-50/40 border-l-4 border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-mono font-bold text-xs text-blue-700 block truncate">
                            {doc.id}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-black tracking-tight uppercase bg-slate-100 text-slate-500">
                            {doc.type}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-800 line-clamp-1">{doc.title}</h5>
                        <p className="text-[10px] text-slate-400 line-clamp-1">Supplier: {doc.supplier}</p>
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-mono text-slate-600 font-bold text-xs">₱{doc.amount.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400">Sent on: {doc.budgetDateApproved}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Selected item Audit Desk */}
          <div className="lg:col-span-8">
            {selectedDoc ? (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
                
                {/* Header overview details */}
                <div className="border-b border-blue-50 pb-4 flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div>
                    <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 rounded px-1.5 py-0.5 uppercase tracking-wide font-mono">
                      Obligation Code: {selectedDoc.orsNumber}
                    </span>
                    <h2 className="font-sans font-black text-lg text-slate-800 tracking-tight mt-1">{selectedDoc.title}</h2>
                    <p className="text-xs text-slate-400">Obligated budget cost: <span className="font-mono font-black text-slate-700">₱{selectedDoc.amount.toLocaleString()}</span> • Certified by {selectedDoc.budgetApprovedBy}</p>
                  </div>
                  <div>
                    <span className="p-1 px-2.5 bg-blue-50 border border-blue-150 rounded-lg text-xs font-bold font-mono text-blue-700">
                      ID: {selectedDoc.id}
                    </span>
                  </div>
                </div>

                {/* Classification & Validation Block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Classification Toggle */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                    <span className="font-bold text-slate-500 uppercase block text-[10px]">classification category</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setClassification('DV')}
                        className={`flex-1 py-1.5 rounded-md text-xs font-black border transition ${
                          classification === 'DV' ? 'bg-blue-600 border-blue-650 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        DV Certification
                      </button>
                      <button
                        type="button"
                        onClick={() => setClassification('PO')}
                        className={`flex-1 py-1.5 rounded-md text-xs font-black border transition ${
                          classification === 'PO' ? 'bg-blue-600 border-blue-650 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        PO Direct Check
                      </button>
                    </div>
                  </div>

                  {/* Supplier compliance validation tracker check */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                    <span className="font-bold text-slate-500 uppercase block text-[10px]">BIR / SEC supplier validity tracker</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPoValidation('VALID')}
                        className={`flex-1 py-1.5 rounded-md text-xs font-black border transition ${
                          poValidation === 'VALID' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-250 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        ✓ Verified Valid
                      </button>
                      <button
                        type="button"
                        onClick={() => setPoValidation('INVALID')}
                        className={`flex-1 py-1.5 rounded-md text-xs font-black border transition ${
                          poValidation === 'INVALID' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-slate-250 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        ✕ Flag Compliance error
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tax Computation panel calculator */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <Calculator className="w-4 h-4 text-blue-500" />
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">BIR Withholding and Custom Tax Computations Panel</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold text-slate-600">
                    {/* VAT Type Choice */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase">VAT category</label>
                      <select
                        id="tax_vat_type"
                        value={vatType}
                        onChange={(e) => setVatType(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                      >
                        <option value="VAT">VAT REGISTERED (Withhold VAT)</option>
                        <option value="NON-VAT">NON-VAT REGISTERED (No VAT withholding)</option>
                      </select>
                    </div>

                    {/* VAT Rates */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase">VAT Withholding Rate (%)</label>
                      <select
                        id="tax_vat_rate"
                        value={vatRate}
                        onChange={(e) => setVatRate(parseInt(e.target.value))}
                        disabled={vatType === 'NON-VAT'}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-50"
                      >
                        <option value={5}>5% Standard (Municipal/Govt)</option>
                        <option value={12}>12% Premium Standard</option>
                        <option value={0}>0% Zero Rated</option>
                      </select>
                    </div>

                    {/* Withholding EWT Rates */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase">Expanded Withholding Tax (EWT %)</label>
                      <select
                        id="tax_ewt_rate"
                        value={withholdingRate}
                        onChange={(e) => setWithholdingRate(parseInt(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                      >
                        <option value={2}>2% Purchase of Goods / Supplies</option>
                        <option value={1}>1% Purchase of Services / Catering</option>
                        <option value={5}>5% Professional Fees / Consulting</option>
                        <option value={10}>10% Standard BIR rate</option>
                        <option value={0}>0% Exempt Tax</option>
                      </select>
                    </div>
                  </div>

                  {/* Immediate Math calculations outputs */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-white border border-slate-150 rounded-lg text-xs text-slate-500 font-mono">
                    <div className="text-left font-semibold">
                      <span>VAT Withheld:</span>
                      <p className="font-extrabold text-blue-600 text-sm mt-0.5">₱{vatAmount.toLocaleString()}</p>
                    </div>
                    <div className="text-left font-semibold">
                      <span>EWT Withheld:</span>
                      <p className="font-extrabold text-blue-650 text-sm mt-0.5">₱{withholdingTax.toLocaleString()}</p>
                    </div>
                    <div className="text-left font-semibold">
                      <span>Net Supplier Payout:</span>
                      <p className="font-extrabold text-emerald-600 text-sm mt-0.5">₱{netAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Completeness check list verification */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                    Internal Audits compliance checklist:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                    {checklist.map((item) => (
                      <label
                        key={item.id}
                        className={`p-2.5 border rounded-lg flex items-start gap-2 cursor-pointer select-none transition ${
                          item.checked ? 'bg-blue-50/15 border-blue-105 text-slate-800' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleToggleChecklist(item.id)}
                          className="mt-0.5 focus:outline-none cursor-pointer"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Voucher generator displays */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="font-bold text-[10px] text-slate-500 uppercase block">Certification and JEV indexing stamps</span>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 space-y-1 text-xs">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">Certified DV Voucher #:</label>
                      <input
                        id="dv_number_input"
                        type="text"
                        placeholder="e.g. DV-2026-06-1182"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-800"
                        value={customDv}
                        onChange={(e) => setCustomDv(e.target.value)}
                      />
                    </div>

                    <div className="flex-1 space-y-1 text-xs">
                      <label className="text-[10px] text-slate-400 font-semibold uppercase">Journal Entry Voucher (JEV) #:</label>
                      <input
                        id="jev_number_input"
                        type="text"
                        placeholder="e.g. JEV-2026-06-0041"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold font-mono text-slate-800"
                        value={customJev}
                        onChange={(e) => setCustomJev(e.target.value)}
                      />
                    </div>

                    <div className="self-end pb-0.5">
                      <button
                        type="button"
                        onClick={generateDeskIDs}
                        className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-150 text-blue-700 text-xs font-black rounded-lg transition flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 animate-bounce" />
                        Stamp IDs
                      </button>
                    </div>
                  </div>
                </div>

                {/* Double Entry Ledger Journal encoder rows */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Encode Double-Entry Ledger Posting Rows (balanced trial debit/credits)</h4>
                  </div>

                  {/* Listed ledger entries */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200 font-bold">
                        <tr>
                          <th className="px-3 py-2">Acct Code</th>
                          <th className="px-3 py-2">Account Title Designation</th>
                          <th className="px-3 py-2 text-right">Debit</th>
                          <th className="px-3 py-2 text-right">Credit</th>
                          <th className="px-3 py-2 text-center w-12">✕</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 font-mono">
                        {journalEntries.map((je, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-3 py-1.5 font-bold text-tech-accent">{je.accountCode}</td>
                            <td className="px-3 py-1.5 text-slate-650">{je.accountTitle}</td>
                            <td className="px-3 py-1.5 text-right font-extrabold text-slate-800">₱{je.debit.toLocaleString()}</td>
                            <td className="px-3 py-1.5 text-right font-extrabold text-slate-800">₱{je.credit.toLocaleString()}</td>
                            <td className="px-3 py-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveJournalRow(idx)}
                                className="text-rose-500 hover:text-rose-700 p-0.5 rounded"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add customized ledger row inline form */}
                  <form onSubmit={handleAddJournalEntry} className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-slate-50 p-3 rounded-lg border border-dashed border-slate-250 text-xs font-bold text-slate-600">
                    <div className="col-span-1 space-y-0.5">
                      <label className="text-[10px]">Code</label>
                      <input
                        type="text"
                        placeholder="1-02-03-010"
                        value={newAccCode}
                        onChange={(e) => setNewAccCode(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-2 space-y-0.5">
                      <label className="text-[10px]">Title</label>
                      <input
                        type="text"
                        placeholder="Office Equipment Expense"
                        value={newAccTitle}
                        onChange={(e) => setNewAccTitle(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold"
                      />
                    </div>
                    <div className="col-span-1 space-y-0.5">
                      <label className="text-[10px]">Debit Amount</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newDebit}
                        onChange={(e) => setNewDebit(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-right font-mono font-bold"
                      />
                    </div>
                    <div className="col-span-1 space-y-0.5">
                      <label className="text-[10px]">Credit Amount</label>
                      <input
                        type="number"
                        value={newCredit}
                        onChange={(e) => setNewCredit(e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-right font-mono font-bold"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-5 flex justify-end pt-1.5">
                      <button
                        type="submit"
                        disabled={!newAccTitle || !newAccCode}
                        className={`px-3 py-1 rounded text-xs shadow font-extrabold flex items-center gap-1 ${
                          newAccTitle && newAccCode ? 'bg-tech-accent text-white hover:bg-tech-accent-hover cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <PlusSquare className="w-3.5 h-3.5" />
                        Add Journal Double-entry
                      </button>
                    </div>
                  </form>
                </div>

                {/* Remarks/Verifications */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Accounts Audit Notes</h4>
                  <textarea
                    id="accounting_remarks_textarea"
                    placeholder="Enter audit clearances details or certification comments to accompany payment slip..."
                    className="w-full h-16 p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-705 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-tech-accent"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>

                {/* Final approvals / Compliance returns dispatch */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-left text-xs font-bold text-slate-500">
                    <h3>Discharge Certified Desk Clearance</h3>
                    {poValidation === 'VALID' ? (
                      <span className="text-emerald-600">✓ Security validated (Beneficiary cleared)</span>
                    ) : (
                      <span className="text-rose-500">⚠ Validation Alert: Beneficiary marked under compliance limits</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      id="return_for_compliance_btn"
                      onClick={() => setShowReturnModal(true)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-150 text-rose-700 font-bold rounded-lg text-xs transition flex items-center gap-1"
                    >
                      <CornerUpLeft className="w-3.5 h-3.5 text-rose-600" />
                      Return for Non-Compliance
                    </button>

                    <button
                      id="certify_and_forward_btn"
                      onClick={handleAccApproveSubmit}
                      className={`px-5 py-2 rounded-lg text-xs font-extrabold shadow transition flex items-center gap-1 ${
                        customDv && customJev && poValidation === 'VALID'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Certify & Forward to Cashier
                      <CheckCircle className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm text-slate-400">
                <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-sans font-bold text-base text-slate-800 tracking-tight">Select Incoming Item to Audit</h3>
                <p className="text-xs max-w-sm mx-auto mt-1">
                  Compliance review begins by selecting any pending obligated entries on the left panel queue list.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Ejection Remarks Modal block */}
        {showReturnModal && selectedDoc && (
          <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-200 w-full max-w-md shadow-2xl p-6 space-y-4">
              <div className="flex items-center gap-2.5 text-rose-600 font-extrabold">
                <AlertOctagon className="w-6 h-6 shrink-0" />
                <h3 className="font-sans text-slate-800 tracking-tight text-sm uppercase">Rejection remarks needed</h3>
              </div>
              <p className="text-xs text-slate-500">
                Specify exactly what documents, validation records or signatures were missing, so that Budget Officers know how to initiate compliance corrections for <span className="font-bold underline">{selectedDoc.id}</span>.
              </p>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-405 uppercase">Non-Compliance Log Comments:</label>
                <textarea
                  id="rejection_remarks_textarea"
                  value={returnRemarks}
                  onChange={(e) => setReturnRemarks(e.target.value)}
                  placeholder="e.g. Missing BAC recommendation memo and certification of prior tax filings on attachment checklist..."
                  className="w-full h-24 p-2 bg-slate-50 border border-slate-250 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 text-xs font-bold pt-2">
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReturnToComplianceSubmit}
                  className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                >
                  Eject Item & Log Failure
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Google Signature password clearance popup */}
        {showSignatureModal && (
          <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 ring-1 ring-black/5 space-y-4 text-left">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-blue-50 text-[#0c4a6e] border border-blue-100 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans font-black text-slate-850 tracking-tight uppercase text-xs">Verify Audit Signature</h4>
                  <p className="text-[10px] text-slate-400">Authenticating authorization clearance</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Applying digital audit certification to route <span className="font-semibold text-slate-700">{selectedDoc?.id}</span> forward to Cashier Disbursement Pool. Please verify your workplace password.
              </p>

              <form onSubmit={handleVerifyAccountingSignatureAndForward} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                    <span>Administrative Signature Key</span>
                    <span className="text-[#0c4a6e] font-mono px-1.5 py-0.5 bg-slate-100 rounded">
                      Demo Key: accountant123
                    </span>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      autoFocus
                      type={showSignaturePasswordMask ? "text" : "password"}
                      placeholder="Enter organizational password..."
                      className="w-full pl-9 pr-12 h-10 border border-slate-205 rounded-xl text-xs focus:ring-1 focus:ring-[#0c4a6e] focus:border-[#0c4a6e] focus:outline-none"
                      value={signaturePasswordInput}
                      onChange={(e) => setSignaturePasswordInput(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignaturePasswordMask(!showSignaturePasswordMask)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer select-none"
                    >
                      {showSignaturePasswordMask ? "Hide" : "Show"}
                    </button>
                  </div>
                  {signatureError && (
                    <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1 animate-pulse font-sans">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {signatureError}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSignatureModal(false);
                      setSignaturePasswordInput('');
                      setSignatureError(null);
                    }}
                    className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-bold transition font-sans cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0c4a6e] hover:bg-[#083550] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 font-sans cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Sign & Forward
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </RoleBasedAccess>
  );
};
