import React, { useState } from 'react';
import { useWorkflow } from '../hooks/useWorkflow';
import { RoleBasedAccess } from '../components/RoleBasedAccess';
import { DocumentStatusTracker } from '../components/DocumentStatusTracker';
import { FileUploadAttachment } from '../components/FileUploadAttachment';
import { ChecklistItem, Document } from '../types';
import { 
  FileText, Plus, ClipboardCheck, ArrowUpRight, 
  HelpCircle, Sparkles, CheckSquare, Save, FolderOpen, AlertCircle,
  Key, ShieldCheck, Eye, EyeOff, ClipboardList, Milestone, Clock, Calendar, Check, ArrowLeft, ArrowRight, CornerUpLeft, BookOpen, AlertTriangle
} from 'lucide-react';

export const BudgetSectionPage: React.FC = () => {
  const { documents, createDocument, approveBudget, addAttachment, user } = useWorkflow();

  // Signature verification states
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signaturePasswordInput, setSignaturePasswordInput] = useState('');
  const [showSignaturePasswordMask, setShowSignaturePasswordMask] = useState(false);
  const [signatureError, setSignatureError] = useState<string | null>(null);

  // Selected document to process
  const [selectedDocId, setSelectedDocId] = useState<string | null>(() => {
    const budgetQueue = documents.filter(d => d.currentSection === 'BUDGET');
    return budgetQueue.length > 0 ? budgetQueue[0].id : null;
  });

  // Intake Form toggle and state
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'PR' | 'DV' | 'PO'>('PR');
  const [newSupplier, setNewSupplier] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [intakeAttachments, setIntakeAttachments] = useState<{ name: string; size: string; dateAdded: string }[]>([]);

  // 4-Step Manual Encoding Workflow States
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Receiving Details
  const [docsRefNo, setDocsRefNo] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [receivedDocsForObligation, setReceivedDocsForObligation] = useState(true);
  const [receivedDate, setReceivedDate] = useState('');
  const [receivedTime, setReceivedTime] = useState('');

  // Step 2: Payee, Procurement & Transaction Details (Encoding)
  const [payeeName, setPayeeName] = useState('');
  const [prNo, setPrNo] = useState('');
  const [poNo, setPoNo] = useState('');
  const [particulars, setParticulars] = useState('');
  const [responsibilityCenter, setResponsibilityCenter] = useState('');
  const [amountValue, setAmountValue] = useState('');

  // Step 3: Financial Classification
  const [allotmentClass, setAllotmentClass] = useState('MOOE');
  const [expenseObjectCode, setExpenseObjectCode] = useState('');
  const [customOrs, setCustomOrs] = useState('');

  // Step 4: Dispatch & Forwarding
  const [forwardedTo, setForwardedTo] = useState('Accounting');
  const [forwardedDate, setForwardedDate] = useState('');
  const [forwardedTime, setForwardedTime] = useState('');
  const [remarks, setRemarks] = useState('');
  const [currentChecklist, setCurrentChecklist] = useState<ChecklistItem[]>([]);

  // Selected document instance
  const selectedDoc = documents.find(d => d.id === selectedDocId);

  // Sync state whenever a new document is selected from the active queue
  React.useEffect(() => {
    if (selectedDoc) {
      setDocsRefNo(selectedDoc.docsRefNo || selectedDoc.id || '');
      setSerialNo(selectedDoc.serialNo || '');
      setReceivedDocsForObligation(selectedDoc.receivedDocsForObligation ?? true);
      setReceivedDate(selectedDoc.receivedDate || selectedDoc.dateCreated || '');
      setReceivedTime(selectedDoc.receivedTime || '11:29 AM');
      setAllotmentClass(selectedDoc.allotmentClass || 'MOOE');
      setPrNo(selectedDoc.prNo || '');
      setPoNo(selectedDoc.poNo || '');
      setPayeeName(selectedDoc.payeeName || selectedDoc.supplier || '');
      setParticulars(selectedDoc.particulars || selectedDoc.title || '');
      setResponsibilityCenter(selectedDoc.responsibilityCenter || 'FAS');
      setExpenseObjectCode(selectedDoc.expenseObjectCode || '5-02-03-010');
      setAmountValue(selectedDoc.amount.toString());
      setForwardedTo(selectedDoc.forwardedTo || 'Accounting');
      setForwardedDate(selectedDoc.forwardedDate || '');
      setForwardedTime(selectedDoc.forwardedTime || '');
      setCustomOrs(selectedDoc.orsNumber || '');
      setRemarks(selectedDoc.budgetRemarks || '');
      setCurrentChecklist(selectedDoc.budgetChecklist ? selectedDoc.budgetChecklist.map(c => ({ ...c })) : []);
      setCurrentStep(1); // Start back at Step 1 for fresh document focus
    }
  }, [selectedDocId]);

  // Stamp current date & time helpers
  const stampCurrentReceived = () => {
    const d = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    
    setReceivedDate(formattedDate);
    setReceivedTime(formattedTime);
  };

  const stampCurrentForwarded = () => {
    const d = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    
    setForwardedDate(formattedDate);
    setForwardedTime(formattedTime);
  };

  // Systematic ORS Code Generator
  const generateOrsCode = () => {
    if (!selectedDoc) return;
    const yearMonth = new Date().toISOString().substring(0, 7).replace('-', '-');
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    setCustomOrs(`ORS-${yearMonth}-${randomSeq}`);
  };

  // Toggle checklist items
  const handleToggleChecklist = (id: string) => {
    setCurrentChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  // Handle Draft Save progress (keeps document inside Budget queue, does not dispatch)
  const handleSaveDraft = () => {
    if (!selectedDoc) return;

    approveBudget(selectedDoc.id, {
      orsNumber: customOrs,
      remarks,
      checklist: currentChecklist,
      docsRefNo,
      serialNo,
      receivedDocsForObligation,
      receivedDate,
      receivedTime,
      allotmentClass,
      prNo,
      poNo,
      payeeName,
      particulars,
      responsibilityCenter,
      expenseObjectCode,
      forwardedTo: 'DRAFT', // Internal context flag for draft saving
      forwardedDate,
      forwardedTime
    });

    alert(`Progress Draft Saved: Intermediate data registered on ledger for ${selectedDoc.id}.`);
  };

  // Handle Intake Registration Submit
  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSupplier || !newAmount) {
      alert("Please fill all required fields to register the intake.");
      return;
    }

    createDocument({
      title: newTitle,
      type: newType,
      supplier: newSupplier,
      amount: parseFloat(newAmount),
      attachments: intakeAttachments
    });

    // Reset Form
    setNewTitle('');
    setNewSupplier('');
    setNewAmount('');
    setIntakeAttachments([]);
    setShowIntakeForm(false);
    
    // Auto-select latest
    setTimeout(() => {
      const budgetLatest = documents.filter(d => d.currentSection === 'BUDGET');
      if (budgetLatest.length > 0) {
        setSelectedDocId(documents[0].id); // First in index is latest added
      }
    }, 100);
  };

  // Validation before launching digital signature signing modal
  const handleTriggerDispatchSign = () => {
    if (!selectedDoc) return;
    if (!customOrs) {
      alert("Routing Prevented: Manual workflow requires a valid Obligation Request and Status (ORS) code mapping before dispatching.");
      return;
    }
    if (!docsRefNo || !serialNo) {
      alert("Routing Prevented: Please fill in Document Reference Number and Serial Number on Step 1.");
      return;
    }
    if (!payeeName || !particulars) {
      alert("Routing Prevented: Please fill in Payee Name and Particulars of Expense on Step 2.");
      return;
    }

    // Auto-fill forwarded date/time if not entered yet
    if (!forwardedDate || !forwardedTime) {
      stampCurrentForwarded();
    }

    // Reset password verification dialog
    setSignaturePasswordInput('');
    setShowSignaturePasswordMask(false);
    setSignatureError(null);
    setShowSignatureModal(true);
  };

  const handleVerifySignatureAndForward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    // Retrieve valid credentials
    const standardPasswords: Record<string, string> = {
      'maria.santos@region5.dost.gov.ph': 'budget123',
      'loislainalcantara@gmail.com': 'admin123'
    };

    let correctPassword = 'budget123'; 
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
          }
        } catch {
          // ignore
        }
      }
    }

    if (signaturePasswordInput !== correctPassword && signaturePasswordInput !== 'budget123') {
      setSignatureError("Verification Failed: Secure administrative signature key is incorrect.");
      return;
    }

    // Execute state changes and forward
    approveBudget(selectedDoc.id, {
      orsNumber: customOrs,
      remarks: remarks || 'Funds obligated. Digital signature verified and document forwarded.',
      checklist: currentChecklist,
      docsRefNo,
      serialNo,
      receivedDocsForObligation,
      receivedDate,
      receivedTime,
      allotmentClass,
      prNo,
      poNo,
      payeeName,
      particulars,
      responsibilityCenter,
      expenseObjectCode,
      forwardedTo,
      forwardedDate: forwardedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      forwardedTime: forwardedTime || '12:00 PM'
    });

    alert(`Obligation Certified & Forwarded!\nDocument ${selectedDoc.id} has been dispatched to: ${forwardedTo}`);
    setShowSignatureModal(false);
    
    // Select next queue item
    const remaining = documents.filter(d => d.currentSection === 'BUDGET' && d.id !== selectedDoc.id);
    if (remaining.length > 0) {
      setSelectedDocId(remaining[0].id);
    } else {
      setSelectedDocId(null);
    }
  };

  const activeBudgetQueue = documents.filter(d => d.currentSection === 'BUDGET');
  const isChecklistComplete = currentChecklist.length > 0 && currentChecklist.every(i => i.checked);

  // Allotment classes requested
  const allotmentClasses = [
    { code: 'MOOE', title: 'Maintenance & Other Operating Expenses' },
    { code: 'SETUP', title: 'Small Enterprise Tech Upgrading' },
    { code: 'PMB', title: 'Project Management Board' },
    { code: 'SAA-SARAI', title: 'Sub-Allotment - SARAI Project' },
    { code: 'LGIA', title: 'Local Gov Initiatives & Assistance' },
    { code: 'PS', title: 'Personnel Services Allocation' },
    { code: 'CEST', title: 'Community Empowerment Science & Tech' },
    { code: 'SAA-TechGrow', title: 'Sub-Allotment - TechGrow' },
    { code: 'SSC PMB', title: 'SSC Project Management Board' },
    { code: 'Others', title: 'Other Special Allotments' }
  ];

  return (
    <RoleBasedAccess allowedRoles={['Budget Officer']}>
      <div className="space-y-6">
        
        {/* Upper Title Hub */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-tech-accent font-bold text-xs uppercase font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-tech-accent animate-ping" />
              DOST Regional Office - Budget Section
            </div>
            <h1 className="font-sans font-black text-xl text-slate-800 tracking-tight mt-1">
              Obligation & Request Processor
            </h1>
            <p className="text-xs text-slate-400">Match manual paperwork encoding workflows: Receive Document → Encode Details → Classify Allotment → Dispatch to accounting</p>
          </div>

          <button
            id="open_intake_drawer_btn"
            onClick={() => setShowIntakeForm(!showIntakeForm)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow"
          >
            <Plus className="w-4 h-4" />
            {showIntakeForm ? 'View Processing Desk' : 'Register New Intake'}
          </button>
        </div>

        {/* Intake Document Form Toggle Module */}
        {showIntakeForm && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-tech-accent" />
              Office Document Intake & Registration
            </h3>
            
            <form onSubmit={handleIntakeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
              <div className="space-y-1.5">
                <label className="text-xs uppercase">Document Name / Brief Particulars</label>
                <input
                  id="intake_title_input"
                  type="text"
                  placeholder="e.g. Catering Services for Seminar / Supplies procurement"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-tech-accent focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase">Intake Category Type</label>
                <select
                  id="intake_type_select"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer font-bold text-slate-700"
                >
                  <option value="PR">PR (Purchase Request)</option>
                  <option value="DV">DV (Disbursement Voucher)</option>
                  <option value="PO">PO (Purchase Order)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase">Supplier / Payee Name</label>
                <input
                  id="intake_supplier_input"
                  type="text"
                  placeholder="e.g. Savory Spoon Catering Co."
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-tech-accent focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs uppercase">Total Request Amount (PHP)</label>
                <input
                  id="intake_amount_input"
                  type="number"
                  placeholder="e.g. 32400"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-tech-accent focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="md:col-span-2 border-t border-slate-100 pt-3">
                <label className="text-xs uppercase block mb-1.5 font-bold text-slate-400">Attach initial compliance papers</label>
                <FileUploadAttachment
                  attachments={intakeAttachments}
                  onAddAttachment={(name, size) => {
                    setIntakeAttachments(prev => [...prev, { name, size, dateAdded: 'Today' }]);
                  }}
                  onRemoveAttachment={(name) => {
                    setIntakeAttachments(prev => prev.filter(a => a.name !== name));
                  }}
                />
              </div>

              <div className="md:col-span-2 pt-3 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowIntakeForm(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-tech-accent text-white font-bold rounded-lg hover:bg-opacity-90 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Authenticate & File Entry
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Workspace Splitted Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Queue Index list */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h4 className="font-sans font-bold text-slate-700 text-xs uppercase flex items-center gap-1.5">
                  <FolderOpen className="w-4 h-4 text-tech-accent" />
                  Budget Desk Queue ({activeBudgetQueue.length})
                </h4>
                <span className="text-[10px] px-2 py-0.5 bg-slate-200/60 font-black rounded-full font-mono text-slate-600">
                  PENDING
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {activeBudgetQueue.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <p className="font-semibold">Desk queue is clear!</p>
                    <p className="text-[10px] mt-1">All processed documents have been obligated and forwarded.</p>
                  </div>
                ) : (
                  activeBudgetQueue.map((doc) => {
                    const isSelected = doc.id === selectedDocId;
                    const isReturned = doc.status === 'ACCOUNTING_RETURNED';

                    return (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`w-full p-4 flex flex-col gap-1 text-left transition select-none ${
                          isSelected ? 'bg-blue-50/60 border-l-4 border-tech-accent' : 'hover:bg-slate-50/40 border-l-4 border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-mono font-bold text-xs text-tech-accent truncate w-24">
                            {doc.id}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-tight uppercase ${
                            isReturned ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {isReturned ? 'Returned' : doc.type}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-800 line-clamp-1">{doc.title}</h5>
                        <p className="text-[10px] text-slate-400 line-clamp-1">Payee: {doc.supplier}</p>
                        
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-mono text-slate-600 font-bold text-xs">₱{doc.amount.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400">{doc.dateCreated}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Context manual help cheat-sheet */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-tech-accent" />
                Staff Manual Quick Guide
              </h5>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                As per standard operations guidelines, all incoming <strong>Obligation & Request</strong> documents must be registered, details encoded, allotment classifications identified, and checklists certified before secure forward. Use the 4-step wizard to encode data methodically.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Step-by-Step Processing Board */}
          <div className="lg:col-span-8">
            {selectedDoc ? (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
                
                {/* Header Information and Title */}
                <div className="border-b border-blue-50 pb-4 flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div>
                    <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 rounded px-1.5 py-0.5 uppercase tracking-wide font-mono">
                      Category: {selectedDoc.type} Desk Review
                    </span>
                    <h2 className="font-sans font-black text-lg text-slate-800 tracking-tight mt-1">{selectedDoc.title}</h2>
                    <p className="text-xs text-slate-400">Supplier/Payee: <span className="font-semibold text-slate-600">{selectedDoc.supplier}</span> • Est. Cost: <span className="font-mono font-black text-slate-700">₱{selectedDoc.amount.toLocaleString()}</span></p>
                  </div>
                  <div>
                    <span className="p-1 px-2.5 bg-blue-50 border border-blue-150 rounded-lg text-xs font-bold font-mono text-tech-accent">
                      ID: {selectedDoc.id}
                    </span>
                  </div>
                </div>

                {/* Returned Alert display */}
                {selectedDoc.status === 'ACCOUNTING_RETURNED' && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg text-xs flex gap-2">
                    <AlertCircle className="w-4.5 h-4.5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Returned by Audit Accountant:</p>
                      <p className="text-rose-700 font-medium italic mt-0.5">"{selectedDoc.accountingRemarks}"</p>
                    </div>
                  </div>
                )}

                {/* Progress Visual Timeline Tracker */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Process Step Progress Status</h4>
                  <DocumentStatusTracker document={selectedDoc} />
                </div>

                {/* WORKFLOW ROADMAP WIZARD BAR */}
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { step: 1, title: '1. Receiving', desc: 'Ref & Receiving' },
                      { step: 2, title: '2. Encoding', desc: 'Payee & Particulars' },
                      { step: 3, title: '3. Classify', desc: 'Allotments & ORS' },
                      { step: 4, title: '4. Dispatch', desc: 'Checklist & Route' }
                    ].map((s) => {
                      const isActive = currentStep === s.step;
                      const isPast = currentStep > s.step;
                      return (
                        <button
                          key={s.step}
                          onClick={() => setCurrentStep(s.step)}
                          className={`p-2 rounded-lg text-center transition flex flex-col items-center justify-center space-y-0.5 ${
                            isActive 
                              ? 'bg-tech-accent text-white shadow-sm ring-1 ring-tech-accent' 
                              : isPast 
                                ? 'bg-blue-50 text-tech-accent border border-blue-100 hover:bg-blue-100/50' 
                                : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {isPast && <Check className="w-3 h-3" />}
                            <span className="text-[10px] font-black tracking-tight uppercase">{s.title}</span>
                          </div>
                          <span className="hidden sm:inline text-[8px] font-medium opacity-80">{s.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* STEP CONTENTS DISPLAY CONTAINER */}
                <div className="bg-slate-50/40 p-5 rounded-xl border border-slate-200/80 space-y-5">
                  
                  {/* STEP 1: DOCUMENT REFERENCE INFORMATION & RECEIVING DETAILS */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-200/60 pb-2">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Milestone className="w-4 h-4 text-tech-accent" />
                          Step 1: Document Reference & Receiving Registry
                        </h3>
                        <p className="text-[10px] text-slate-400">Record incoming municipal/regional tracking serials and certify document acquisition details.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Docs Reference No.</label>
                          <input
                            type="text"
                            placeholder="e.g. DOC-2026-0001"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-tech-accent"
                            value={docsRefNo}
                            onChange={(e) => setDocsRefNo(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Serial No.</label>
                          <input
                            type="text"
                            placeholder="e.g. SN-9821-B01"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-tech-accent"
                            value={serialNo}
                            onChange={(e) => setSerialNo(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Receiving Status Check</h4>
                            <p className="text-[10px] text-slate-400">Certify that the physical document stack for obligation was successfully received.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={receivedDocsForObligation} 
                              onChange={(e) => setReceivedDocsForObligation(e.target.checked)} 
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            <span className="ml-2 text-xs font-bold text-slate-700">{receivedDocsForObligation ? 'Received' : 'Pending'}</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Date Received</label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Calendar className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder="e.g. 15-Jan-2026"
                                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold focus:outline-none"
                                  value={receivedDate}
                                  onChange={(e) => setReceivedDate(e.target.value)}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={stampCurrentReceived}
                                className="px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-250 transition"
                              >
                                Stamp Current
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Time Received</label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Clock className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder="e.g. 11:29 AM"
                                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold focus:outline-none"
                                  value={receivedTime}
                                  onChange={(e) => setReceivedTime(e.target.value)}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={stampCurrentReceived}
                                className="px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-250 transition"
                              >
                                Stamp Current
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: CREDITOR, PAYEE, PROCUREMENT & EXPENSE PARTICULARS */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-200/60 pb-2">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckSquare className="w-4 h-4 text-tech-accent" />
                          Step 2: Payee, Procurement References & Particulars
                        </h3>
                        <p className="text-[10px] text-slate-400">Encode standard administrative metadata including procurement references and total value.</p>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payee Name</label>
                          <input
                            type="text"
                            placeholder="Enter suppliers / individual claimant payee name"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-tech-accent"
                            value={payeeName}
                            onChange={(e) => setPayeeName(e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Purchase Request (PR) No.</label>
                            <input
                              type="text"
                              placeholder="e.g. PR-2026-03-0102"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-tech-accent"
                              value={prNo}
                              onChange={(e) => setPrNo(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Purchase Order (PO) No.</label>
                            <input
                              type="text"
                              placeholder="e.g. PO-2026-03-0095"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-tech-accent"
                              value={poNo}
                              onChange={(e) => setPoNo(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Particulars / Description of Expense</label>
                          <textarea
                            placeholder="Describe full detail of expense program, seminaries or procurement deliverables..."
                            className="w-full h-16 p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-tech-accent transition"
                            value={particulars}
                            onChange={(e) => setParticulars(e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Responsibility Center / End Users</label>
                            <input
                              type="text"
                              placeholder="e.g. Human Resource / SETUP unit"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-tech-accent"
                              value={responsibilityCenter}
                              onChange={(e) => setResponsibilityCenter(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transaction Amount Value (PHP)</label>
                            <input
                              type="number"
                              placeholder="Amount PHP"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-tech-accent text-slate-800"
                              value={amountValue}
                              onChange={(e) => setAmountValue(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: FINANCIAL CLASSIFICATION (ALLOTMENT CLASS Selection, Codes, and ORS registry) */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-200/60 pb-2">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-tech-accent" />
                          Step 3: Allotment Class & ORS Code Registry
                        </h3>
                        <p className="text-[10px] text-slate-400">Classify structural financial allotments and generate obligation registration index cards.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Allotment Class Selection</label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                          {allotmentClasses.map((item) => {
                            const isSelected = allotmentClass === item.code;
                            return (
                              <button
                                key={item.code}
                                type="button"
                                title={item.title}
                                onClick={() => setAllotmentClass(item.code)}
                                className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center justify-center space-y-1 select-none ${
                                  isSelected 
                                    ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-sm' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <span className="text-[10px] font-black tracking-tight">{item.code}</span>
                                <span className="text-[7px] text-slate-400 font-medium truncate w-full max-w-[80px] block">{item.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Expense / Object Code</label>
                          <input
                            type="text"
                            placeholder="e.g. 5-02-03-010"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-tech-accent"
                            value={expenseObjectCode}
                            onChange={(e) => setExpenseObjectCode(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ORS Number Registry</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="e.g. ORS-2026-06-0382"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-tech-accent"
                              value={customOrs}
                              onChange={(e) => setCustomOrs(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={generateOrsCode}
                              className="px-3 py-2 bg-blue-50 border border-blue-150 text-tech-accent rounded-lg text-[10px] font-extrabold transition hover:bg-blue-100/50 flex-shrink-0 flex items-center gap-1"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Auto Code
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: COMPLIANCE CHECKLISTS, ROUTING & FORWARDING DISPATCH */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div className="border-b border-slate-200/60 pb-2">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <ClipboardCheck className="w-4 h-4 text-tech-accent" />
                          Step 4: Compliance Auditing & Dispatch Routing
                        </h3>
                        <p className="text-[10px] text-slate-400">Mark regulatory checkboxes and designate the recipient workflow path desk.</p>
                      </div>

                      {/* Checklist items list */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completeness Checklist Verification</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-600">
                          {currentChecklist.map((item) => (
                            <label 
                              key={item.id} 
                              className={`p-2 rounded-lg border transition flex items-start gap-2.5 cursor-pointer select-none ${
                                item.checked ? 'border-blue-100 bg-blue-50/20 text-blue-900' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => handleToggleChecklist(item.id)}
                                className="mt-0.5 w-3.5 h-3.5 text-tech-accent bg-slate-150 border-slate-300 rounded focus:ring-tech-accent focus:outline-none"
                              />
                              <span className="text-[10px]">{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Routing selection cards */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Forward Destination Section</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'Accounting', title: 'Accounting Section', desc: 'Pre-Audit & Certification' },
                            { value: 'Supply', title: 'Supply Section', desc: 'Inventory Check' },
                            { value: 'RPMO', title: 'RPMO Section', desc: 'Regional Projects Unit' }
                          ].map((item) => {
                            const isSel = forwardedTo === item.value;
                            return (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => setForwardedTo(item.value)}
                                className={`p-3 rounded-xl border text-left transition select-none flex flex-col justify-between ${
                                  isSel 
                                    ? 'bg-blue-50/60 border-tech-accent text-tech-accent shadow-sm' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <span className="text-[10px] font-black block">{item.title}</span>
                                <span className="text-[8px] text-slate-400 mt-0.5 font-medium block leading-tight">{item.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Forward Date & Time */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dispatch Date</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="e.g. 15-Jan-2026"
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold focus:outline-none"
                              value={forwardedDate}
                              onChange={(e) => setForwardedDate(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={stampCurrentForwarded}
                              className="px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-250 transition"
                            >
                              Stamp
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dispatch Time</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="e.g. 11:29 AM"
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold focus:outline-none"
                              value={forwardedTime}
                              onChange={(e) => setForwardedTime(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={stampCurrentForwarded}
                              className="px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-250 transition"
                            >
                              Stamp
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remarks Textarea */}
                      <div className="space-y-1 pt-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remarks / Special Processing Comments</label>
                        <textarea
                          placeholder="Add comments to guide the next reviewer..."
                          className="w-full h-14 p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-tech-accent transition"
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* NAVIGATION PANEL FOR STEPS */}
                  <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                    <div>
                      {currentStep > 1 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentStep(prev => prev - 1)}
                          className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition flex items-center gap-1"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          Back
                        </button>
                      ) : (
                        <div className="w-10" />
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition flex items-center gap-1.5 bg-white"
                      >
                        <Save className="w-3.5 h-3.5 text-slate-400" />
                        Save Draft
                      </button>

                      {currentStep < 4 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentStep(prev => prev + 1)}
                          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-black transition flex items-center gap-1"
                        >
                          Next Step
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleTriggerDispatchSign}
                          className={`px-4.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 shadow ${
                            isChecklistComplete && customOrs
                              ? 'bg-tech-accent hover:bg-opacity-90 text-white cursor-pointer'
                              : 'bg-slate-150 text-slate-400 cursor-not-allowed border border-slate-200'
                          }`}
                        >
                          Sign & Forward
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>

                {/* File Attachment addition center */}
                <div className="border border-slate-150 p-4 rounded-xl space-y-2 bg-slate-50/10">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supporting Proof Documentation</h4>
                  <FileUploadAttachment
                    attachments={selectedDoc.attachments}
                    onAddAttachment={(name, size) => addAttachment(selectedDoc.id, name, size)}
                  />
                </div>

                {/* Bottom routing summary status indicator */}
                <div className="pt-4 border-t border-slate-150 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-left">
                    <p className="text-[9px] text-slate-400 uppercase font-mono tracking-wide font-black">Routing Audit Checkpoint</p>
                    <p className="text-xs text-slate-500">
                      {isChecklistComplete ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-4 h-4" /> Ready to dispatch (Compliance checklist fully certified)
                        </span>
                      ) : (
                        <span className="text-amber-500 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Complete compliance checklist on Step 4 before signing
                        </span>
                      )}
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm text-slate-400">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-sans font-bold text-base text-slate-800 tracking-tight">Select Intake Document to Process</h3>
                <p className="text-xs max-w-sm mx-auto mt-1">
                  Please pick any pending document from the Budget Desk Queue list on the left to initiate the 4-step allocation and obligation manual workflow desk.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Digital Signature Verification Modal popup */}
        {showSignatureModal && (
          <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 ring-1 ring-black/5 space-y-4 text-left">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="p-2.5 bg-sky-50 text-[#0c4a6e] border border-sky-100 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans font-black text-slate-800 tracking-tight uppercase text-xs">Verify Digital Signature</h4>
                  <p className="text-[10px] text-slate-400">Authenticating authorization clearance</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Applying digital signature certification to transfer <span className="font-semibold text-slate-700">{selectedDoc?.id}</span> to the <span className="font-bold text-slate-700">{forwardedTo}</span> section desk. Please verify your workspace password.
              </p>

              <form onSubmit={handleVerifySignatureAndForward} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                    <span>Administrative Signature Key</span>
                    <span className="text-[#0c4a6e] font-mono px-1.5 py-0.5 bg-slate-100 rounded text-[9px]">
                      Key: budget123
                    </span>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      autoFocus
                      type={showSignaturePasswordMask ? "text" : "password"}
                      placeholder="Enter administrative clearance password..."
                      className="w-full pl-9 pr-12 h-10 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-[#0c4a6e] focus:border-[#0c4a6e] focus:outline-none"
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
                    className="px-4 py-1.5 bg-[#0c4a6e] hover:bg-[#083550] text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5 font-sans cursor-pointer"
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
