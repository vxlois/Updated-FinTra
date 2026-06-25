import React, { useState } from 'react';
import { useWorkflow } from '../hooks/useWorkflow';
import { RoleBasedAccess } from '../components/RoleBasedAccess';
import { DocumentStatusTracker } from '../components/DocumentStatusTracker';
import { Document } from '../types';
import { 
  CreditCard, Landmark, CheckCircle, ShieldCheck, HelpCircle, 
  Sparkles, Signature, Send, Receipt, FileCheck, Building,
  Key, Eye, EyeOff, AlertCircle
} from 'lucide-react';

export const CashierSectionPage: React.FC = () => {
  const { documents, processPayment, user } = useWorkflow();

  // Signature verification states
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signaturePasswordInput, setSignaturePasswordInput] = useState('');
  const [showSignaturePasswordMask, setShowSignaturePasswordMask] = useState(false);
  const [signatureError, setSignatureError] = useState<string | null>(null);

  // Selected document to pay
  const [selectedDocId, setSelectedDocId] = useState<string | null>(() => {
    const queue = documents.filter(d => d.currentSection === 'CASHIER');
    return queue.length > 0 ? queue[0].id : null;
  });

  // Selected document instance
  const selectedDoc = documents.find(d => d.id === selectedDocId);

  // Cashier inputs state
  const [paymentMode, setPaymentMode] = useState<'EMDS' | 'LDDAP-ADA' | 'CHECK'>('EMDS');
  const [emdsStatus, setEmdsStatus] = useState<'INITIALIZED' | 'TRANSMITTED' | 'ACKNOWLEDGED'>('INITIALIZED');
  const [accountantSigned, setAccountantSigned] = useState(false);
  const [ordSigned, setOrdSigned] = useState(false);
  const [checkNo, setCheckNo] = useState('');
  const [remarks, setRemarks] = useState('');

  // Sync state values when selected document changes
  React.useEffect(() => {
    if (selectedDoc) {
      setPaymentMode(selectedDoc.paymentMode || 'EMDS');
      setEmdsStatus(selectedDoc.emdsStatus || 'INITIALIZED');
      setAccountantSigned(selectedDoc.signatures?.accountantSigned || false);
      setOrdSigned(selectedDoc.signatures?.ordSigned || false);
      setCheckNo(selectedDoc.checkNumber || '');
      setRemarks(selectedDoc.cashierRemarks || '');
    }
  }, [selectedDocId]);

  // Handle Systematic Check No Generator
  const generateCheckSeriesNo = () => {
    const randomSeries = Math.floor(10000000 + Math.random() * 90000000);
    setCheckNo(`CK-${randomSeries}`);
  };

  // Submit payment release
  const handlePaymentReleaseSubmit = () => {
    if (!selectedDoc) return;

    if (!accountantSigned || !ordSigned) {
      alert("Disbursement Blocked: Systematic clearance requires verified authorization signatures from both the Chief Accountant and the Office of the Regional Director (ORD) before disbursing public funds.");
      return;
    }

    if (paymentMode === 'CHECK' && !checkNo) {
      alert("Voucher Blocked: Please enter or generate a Valid Check Series Number for physical paper disbursement.");
      return;
    }

    // Launch signature authentication modal
    setSignaturePasswordInput('');
    setShowSignaturePasswordMask(false);
    setSignatureError(null);
    setShowSignatureModal(true);
  };

  const handleVerifyCashierSignatureAndRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    // Retrieve valid comparison passwords
    const standardPasswords: Record<string, string> = {
      'regina.clave@region5.dost.gov.ph': 'cashier123',
      'loislainalcantara@gmail.com': 'admin123'
    };

    let correctPassword = 'cashier123'; // Disbursing Cashier default role passcode
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

    if (signaturePasswordInput !== correctPassword && signaturePasswordInput !== 'cashier123') {
      setSignatureError("Verification Failed: Secure administrative signature key is incorrect.");
      return;
    }

    // Verified: run process payment and trigger final transaction dispatch
    processPayment(selectedDoc.id, {
      paymentMode,
      emdsStatus: paymentMode === 'EMDS' ? emdsStatus : undefined,
      accountantSigned,
      ordSigned,
      checkNumber: paymentMode === 'CHECK' ? checkNo : undefined,
      remarks: remarks || 'Payment released from cash accounts. Beneficiary supplier bank notification wired.'
    });

    alert(`Disbursement finalized! Released ₱${selectedDoc.amount.toLocaleString()} to ${selectedDoc.supplier} successfully.`);
    setShowSignatureModal(false);
    
    // Choose next item in queue
    const remaining = documents.filter(d => d.currentSection === 'CASHIER' && d.id !== selectedDoc.id);
    if (remaining.length > 0) {
      setSelectedDocId(remaining[0].id);
    } else {
      setSelectedDocId(null);
    }
  };

  const cashierQueue = documents.filter(d => d.currentSection === 'CASHIER');
  const disbursedLedger = documents.filter(d => d.status === 'CASHIER_PAID');

  return (
    <RoleBasedAccess allowedRoles={['Disbursing Cashier']}>
      <div className="space-y-6">

        {/* Desk Header Banner */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
              Department: Cashier & Disbursing Operations
            </div>
            <h1 className="font-sans font-black text-xl text-slate-800 tracking-tight mt-1">
              Supplier & Wire Disbursement Desk
            </h1>
            <p className="text-xs text-slate-400">Validate authorized executive signatures, select disbursing channels (Check, Direct ADA or EMDS), queue bank wires, and release finalized financial public assets</p>
          </div>

          <div className="text-xs font-bold text-slate-450 font-mono bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
            CASHIER ON DUTY: Regina Clave (Treasurer Officer)
          </div>
        </div>

        {/* Dynamic Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT Queue panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h4 className="font-sans font-bold text-slate-700 text-xs uppercase flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  Ready Payments Pool ({cashierQueue.length})
                </h4>
              </div>

              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {cashierQueue.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-xs">
                    <p className="font-semibold">Payments pool is empty.</p>
                    <p className="text-[10px] mt-1 text-slate-400">Awaiting internal accounting audit stamp approvals.</p>
                  </div>
                ) : (
                  cashierQueue.map((doc) => {
                    const isSelected = doc.id === selectedDocId;

                    return (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`w-full p-4 flex flex-col gap-1 text-left transition select-none ${
                          isSelected ? 'bg-emerald-50/60 border-l-4 border-emerald-650' : 'hover:bg-slate-50/40 border-l-4 border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-mono font-bold text-xs text-emerald-700 block truncate">
                            {doc.id}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-black tracking-tight uppercase bg-slate-100 text-slate-500">
                            DV Auth: {doc.dvNumber}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-800 line-clamp-1">{doc.title}</h5>
                        <p className="text-[10px] text-slate-400 line-clamp-1">To: {doc.supplier}</p>
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-mono text-slate-600 font-bold text-xs">
                            NET: ₱{doc.taxConfig?.netAmount ? doc.taxConfig.netAmount.toLocaleString() : doc.amount.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-slate-400">Audited: {doc.accountingDateApproved}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT payment processing details */}
          <div className="lg:col-span-8">
            {selectedDoc ? (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
                
                {/* Header profile */}
                <div className="border-b border-emerald-50 pb-4 flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div>
                    <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 rounded px-1.5 py-0.5 uppercase tracking-wide font-mono">
                      Acctg Reference JEV #: {selectedDoc.jevNumber}
                    </span>
                    <h2 className="font-sans font-black text-lg text-slate-800 tracking-tight mt-1">{selectedDoc.title}</h2>
                    <p className="text-xs text-slate-400">Total Net payout scheduled: <span className="font-mono font-black text-emerald-600 text-sm">₱{(selectedDoc.taxConfig?.netAmount || selectedDoc.amount).toLocaleString()}</span> due to <span className="font-semibold text-slate-700">{selectedDoc.supplier}</span></p>
                  </div>
                  <div>
                    <span className="p-1 px-2.5 bg-emerald-50 border border-emerald-110 rounded-lg text-xs font-bold font-mono text-emerald-700">
                      ID: {selectedDoc.id}
                    </span>
                  </div>
                </div>

                {/* Status Timeline tracking */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cycle tracking status</h4>
                  <DocumentStatusTracker document={selectedDoc} />
                </div>

                {/* Tax Verification Summary Card (Satisfies requirement) */}
                {selectedDoc.taxConfig && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5 text-slate-500" />
                      Auditor Tax Deductions summary verification
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-500 font-semibold">
                      <div>
                        <span>Gross Cost Value:</span>
                        <p className="font-bold text-slate-700 font-mono text-xs">₱{selectedDoc.taxConfig.grossAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <span>VAT Withheld:</span>
                        <p className="font-bold text-slate-700 font-mono text-xs">₱{selectedDoc.taxConfig.vatAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <span>Withholding EWT:</span>
                        <p className="font-bold text-slate-700 font-mono text-xs">₱{selectedDoc.taxConfig.withholdingTax.toLocaleString()}</p>
                      </div>
                      <div className="bg-emerald-55 border border-emerald-100 rounded p-1">
                        <span className="text-[9px] font-bold text-emerald-600 block uppercase">Final Net Disbursement:</span>
                        <p className="font-extrabold text-emerald-700 font-mono text-sm">₱{selectedDoc.taxConfig.netAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Signature verification block (Required) */}
                <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50">
                  <h4 className="text-xs font-bold text-slate-605 uppercase tracking-wider flex items-center gap-1">
                    <Signature className="w-4 h-4 text-emerald-600" />
                    Double Check Authorized Executive Signatures
                  </h4>
                  <p className="text-[10px] text-slate-400">Co-signature validation safeguards municipal assets against unauthorized release audits.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Chief Accountant Signature checkbox */}
                    <label className={`p-2.5 border rounded-lg flex items-center gap-3 cursor-pointer select-none transition text-xs font-bold ${
                      accountantSigned ? 'bg-emerald-50 border-emerald-150 text-emerald-900' : 'bg-white border-slate-200 text-slate-500'
                    }`}>
                      <input
                        type="checkbox"
                        checked={accountantSigned}
                        onChange={() => setAccountantSigned(!accountantSigned)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <div className="text-left font-sans">
                        <p className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Internal audit</p>
                        <p className="font-black text-slate-755">Chief Accountant Signed</p>
                      </div>
                    </label>

                    {/* ORD (Office of Regional Director) signature checkpoint */}
                    <label className={`p-2.5 border rounded-lg flex items-center gap-3 cursor-pointer select-none transition text-xs font-bold ${
                      ordSigned ? 'bg-emerald-50 border-emerald-150 text-emerald-900' : 'bg-white border-slate-200 text-slate-500'
                    }`}>
                      <input
                        type="checkbox"
                        checked={ordSigned}
                        onChange={() => setOrdSigned(!ordSigned)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <div className="text-left font-sans">
                        <p className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Executive check</p>
                        <p className="font-black text-slate-755">Regional Director Sign-off (ORD)</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Payment channel mode selector */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-401 uppercase tracking-wider">Disbursement Delivery Mode Channel</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {/* EMDS Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentMode('EMDS')}
                      className={`p-3 rounded-lg border text-left transition ${
                        paymentMode === 'EMDS' ? 'border-emerald-600 bg-emerald-50/20 text-emerald-900 ring-2 ring-emerald-500/10' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <Signature className="w-4 h-4 text-emerald-600 mb-1" />
                      <p className="font-bold">LBP EMDS Channel</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Electronic Payment Release system</p>
                    </button>

                    {/* LDDAP-ADA Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentMode('LDDAP-ADA')}
                      className={`p-3 rounded-lg border text-left transition ${
                        paymentMode === 'LDDAP-ADA' ? 'border-emerald-600 bg-emerald-50/20 text-emerald-900 ring-2 ring-emerald-500/10' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <Landmark className="w-4 h-4 text-emerald-640 mb-1" />
                      <p className="font-bold">LDDAP-ADA Wire</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Direct Advice wire transfer</p>
                    </button>

                    {/* Check Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentMode('CHECK')}
                      className={`p-3 rounded-lg border text-left transition ${
                        paymentMode === 'CHECK' ? 'border-emerald-600 bg-emerald-50/20 text-emerald-900 ring-2 ring-emerald-500/10' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <Receipt className="w-4 h-4 text-emerald-640 mb-1" />
                      <p className="font-bold">Cheque Instrument</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Physical check voucher preparation</p>
                    </button>
                  </div>
                </div>

                {/* EMDS processing panel */}
                {paymentMode === 'EMDS' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs text-slate-600">
                    <span className="font-bold text-[10px] text-slate-500 uppercase block tracking-wider">LandBank EMDS Integration state management</span>
                    <p className="text-[10px] text-slate-400">Cycle through EMDS API states to transmit directly to municipal treasury holding bank.</p>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEmdsStatus('INITIALIZED')}
                        className={`px-3 py-1.5 rounded text-xs font-bold border transition ${
                          emdsStatus === 'INITIALIZED' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200'
                        }`}
                      >
                        1. Initialize
                      </button>
                      <span className="text-slate-400">→</span>
                      
                      <button
                        type="button"
                        onClick={() => setEmdsStatus('TRANSMITTED')}
                        className={`px-3 py-1.5 rounded text-xs font-bold border transition ${
                          emdsStatus === 'TRANSMITTED' ? 'bg-tech-accent text-white border-blue-600' : 'bg-white border-slate-200'
                        }`}
                      >
                        2. Transmit XML
                      </button>
                      <span className="text-slate-400">→</span>

                      <button
                        type="button"
                        onClick={() => setEmdsStatus('ACKNOWLEDGED')}
                        className={`px-3 py-1.5 rounded text-xs font-bold border transition ${
                          emdsStatus === 'ACKNOWLEDGED' ? 'bg-emerald-600 text-white border-emerald-610' : 'bg-white border-slate-200'
                        }`}
                      >
                        3. LBP Acknowledged
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400 italic">
                      {emdsStatus === 'INITIALIZED' && '• System wired connection initialized. Ready for structural payload checks.'}
                      {emdsStatus === 'TRANSMITTED' && '• XML digital cert injected and transmitted to LandBank secure gateway servers.'}
                      {emdsStatus === 'ACKNOWLEDGED' && '• Bank API validated signature hashes. Wire transfer success response verified.'}
                    </p>
                  </div>
                )}

                {/* Check preparation panel form */}
                {paymentMode === 'CHECK' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                    <span className="font-bold text-[10px] text-slate-500 uppercase block">Check Instrument Preparation form</span>
                    <p className="text-[10px] text-slate-400">Input standard Check serial details matching physical LandBank checkbooks.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] uppercase block font-semibold">Verify Cheque Serial #:</label>
                        <input
                          id="check_no_input"
                          type="text"
                          placeholder="e.g. CK-230981726"
                          value={checkNo}
                          onChange={(e) => setCheckNo(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                        />
                      </div>

                      <div className="self-end">
                        <button
                          type="button"
                          onClick={generateCheckSeriesNo}
                          className="px-4 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-110 text-emerald-700 font-extrabold rounded-lg transition text-xs flex items-center justify-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Spin Cheque Number
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cashier logs remarks */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Disbursement Notes and Remittance remarks</h4>
                  <textarea
                    id="cashier_remarks_textarea"
                    placeholder="Enter remittance advice observations or bank transaction codes..."
                    className="w-full h-16 p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-705 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-tech-accent"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>

                {/* Confirmation payout Release gate */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 font-semibold text-slate-600">
                  <div className="text-left text-xs">
                    <h3>Disbursing Warrant Clearance</h3>
                    {accountantSigned && ordSigned ? (
                      <span className="text-emerald-600">✓ Security signatures verified</span>
                    ) : (
                      <span className="text-amber-500">⚠ Validation Alert: Requires Accountant + ORD co-signature checks</span>
                    )}
                  </div>

                  <button
                    id="final_release_payment_btn"
                    onClick={handlePaymentReleaseSubmit}
                    className={`px-6 py-2 rounded-xl text-xs font-black shadow transition flex items-center gap-1.5 ${
                      accountantSigned && ordSigned && (paymentMode !== 'CHECK' || checkNo)
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-150'
                    }`}
                  >
                    Payment Release Confirmation
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm text-slate-400">
                <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
                <h3 className="font-sans font-bold text-base text-slate-800 tracking-tight">Select Certified Voucher for Release</h3>
                <p className="text-xs max-w-sm mx-auto mt-1">
                  Pick any accounting certified items on the let menu pool panel to finalize physical/direct digital disbursement wires.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Bank Wire Disbursement Historical Ledger Logs */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <Building className="w-4.5 h-4.5 text-slate-500" />
            <h4 className="font-sans font-bold text-slate-700 text-xs uppercase">Cashier Disbursements & Supplier/Bank Wire Audit Logs</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3">Disbursed Date</th>
                  <th className="px-4 py-3">Document Code</th>
                  <th className="px-4 py-3">Remitted Beneficiary</th>
                  <th className="px-4 py-3">Disbursement Mode</th>
                  <th className="px-4 py-3">Reference Voucher codes</th>
                  <th className="px-4 py-3 text-right">Net Value Transferred</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-mono">
                {disbursedLedger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-xs text-slate-400 font-sans italic">
                      No bank wires successfully released in this active session yet
                    </td>
                  </tr>
                ) : (
                  disbursedLedger.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition font-sans">
                      <td className="px-4 py-2 text-slate-500 font-mono text-[11px] whitespace-nowrap">{doc.paymentReleasedDate}</td>
                      <td className="px-4 py-2 font-mono font-bold text-tech-accent">{doc.id}</td>
                      <td className="px-4 py-2 font-bold text-slate-800">{doc.supplier}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 border border-slate-200 font-mono font-medium text-slate-600">
                          {doc.paymentMode} {doc.checkNumber ? `(${doc.checkNumber})` : ''}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        DV: {doc.dvNumber} | JEV: {doc.jevNumber}
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-extrabold text-emerald-600 whitespace-nowrap">
                        ₱{doc.taxConfig?.netAmount ? doc.taxConfig.netAmount.toLocaleString() : doc.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Google Signature password clearance popup */}
        {showSignatureModal && (
          <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 ring-1 ring-black/5 space-y-4 text-left font-inter">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans font-black text-slate-850 tracking-tight uppercase text-xs">Verify Treasury Signature</h4>
                  <p className="text-[10px] text-slate-400">Authenticating authorization clearance</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Applying digital treasury certification signature to release ₱{(selectedDoc?.taxConfig?.netAmount || selectedDoc?.amount || 0).toLocaleString()} to <span className="font-bold text-slate-700">{selectedDoc?.supplier}</span> checklist. Please verify your workspace password.
              </p>

              <form onSubmit={handleVerifyCashierSignatureAndRelease} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                    <span>Administrative Signature Key</span>
                    <span className="text-emerald-700 font-mono px-1.5 py-0.5 bg-slate-100 rounded">
                      Demo Key: cashier123
                    </span>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      autoFocus
                      type={showSignaturePasswordMask ? "text" : "password"}
                      placeholder="Enter organizational password..."
                      className="w-full pl-9 pr-12 h-10 border border-slate-205 rounded-xl text-xs focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none"
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
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 font-sans cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Sign & Release Assets
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
