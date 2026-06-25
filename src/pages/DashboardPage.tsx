import React, { useState, useEffect } from 'react';
import { useWorkflow } from '../hooks/useWorkflow';
import { SearchBar } from '../components/SearchBar';
import { StatusBadge } from '../components/StatusBadge';
import { 
  Building, CheckCircle2, AlertTriangle, Clock, 
  ArrowRight, Landmark, Eye, Trash2, ArrowUpDown, ChevronRight, BarChart3, Receipt, ChevronDown
} from 'lucide-react';
import { Document } from '../types';

export const DashboardPage: React.FC = () => {
  const { documents, setCurrentPath, deleteDocument, setActiveRole, user, globalSearchQuery, setGlobalSearchQuery, systemStatus } = useWorkflow();
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // 1. Clock timer
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(clockTimer);
    };
  }, []);

  const hour = currentTime.getHours();
  let greetingText = '';
  if (hour >= 5 && hour < 12) {
    greetingText = 'Marhay na aldaw';
  } else if (hour >= 12 && hour < 18) {
    greetingText = 'Marhay na hapon';
  } else {
    greetingText = 'Marhay na banggi';
  }
  
  const firstName = user?.name ? user.name.trim().split(' ')[0] : 'Officer';
  
  // Search state
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');

  // Sorting
  const [sortBy, setSortBy] = useState<'ID' | 'AMOUNT' | 'DATE'>('ID');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Detailed Modal review state
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Filter documents
  const filteredDocs = documents.filter(doc => {
    const sWord = globalSearchQuery.toLowerCase();
    const matchKeyword = 
      doc.id.toLowerCase().includes(sWord) ||
      doc.title.toLowerCase().includes(sWord) ||
      doc.supplier.toLowerCase().includes(sWord) ||
      (doc.orsNumber && doc.orsNumber.toLowerCase().includes(sWord)) ||
      (doc.dvNumber && doc.dvNumber.toLowerCase().includes(sWord)) ||
      (doc.jevNumber && doc.jevNumber.toLowerCase().includes(sWord));

    const matchType = selectedType === 'ALL' || doc.type === selectedType;
    const matchSection = selectedSection === 'ALL' || doc.currentSection === selectedSection;

    return matchKeyword && matchType && matchSection;
  });

  // Apply sorting
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    let comp = 0;
    if (sortBy === 'ID') comp = a.id.localeCompare(b.id);
    else if (sortBy === 'AMOUNT') comp = a.amount - b.amount;
    else if (sortBy === 'DATE') comp = new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();

    return sortOrder === 'DESC' ? -comp : comp;
  });

  // Statistics Computations
  const totalReceived = documents.length;
  const totalDisbursed = documents.filter(d => d.status === 'CASHIER_PAID').reduce((acc, d) => acc + d.amount, 0);
  const budgetObligated = documents.filter(d => !!d.orsNumber).reduce((acc, d) => acc + d.amount, 0);
  const totalInAccounting = documents.filter(d => d.currentSection === 'ACCOUNTING').length;
  const returnedForCompliance = documents.filter(d => d.status === 'ACCOUNTING_RETURNED').length;

  const handleSort = (field: 'ID' | 'AMOUNT' | 'DATE') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
  };

  return (
    <div className="space-y-6 font-inter">
      {/* Dynamic Personnel Greeting Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Avatar and Greeting */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#0c4a6e]/10 border border-[#0c4a6e]/20 flex items-center justify-center font-sans font-black text-[#0c4a6e] text-lg shrink-0">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'DS'}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-sans ml-0 -mb-[3px] mr-0">
              {greetingText}, {firstName}!
            </h2>
          </div>
        </div>

        {/* Right Side: Date and Time on the right side using Poppins Regular */}
        <div className="flex flex-col items-start md:items-end text-xs text-slate-500 shrink-0 font-sans font-normal">
          <span className="text-slate-700 text-xs font-sans font-normal">
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span className="bg-slate-100/80 px-2 py-0.5 rounded-md text-slate-600 text-xs mt-1.5 inline-block font-sans font-normal">
            {currentTime.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Disbursed Funds */}
        <div className="bg-white border border-slate-205/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500 rounded-l-2xl"></div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-sans">Disbursed Funds</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight mt-1 ml-0.5 block font-sans">
              ₱{totalDisbursed.toLocaleString()}
            </span>
            <p className="text-[10px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
              Disbursed to Creditors
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl group-hover:scale-105 transition duration-200">
            <Landmark className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Budget Obligated */}
        <div className="bg-white border border-slate-205/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-l-2xl"></div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-sans">Budgets Obligated</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight mt-1 ml-0.5 block font-sans">
              ₱{budgetObligated.toLocaleString()}
            </span>
            <p className="text-[10px] text-blue-600 font-bold mt-1 inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-blue-500"></span>
              ORS Registered entries
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl group-hover:scale-105 transition duration-200">
            <Receipt className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Accounting Review Desk */}
        <div className="bg-white border border-slate-205/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute left-0 top-0 h-full w-1 bg-amber-500 rounded-l-2xl"></div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-sans">Audits Pending</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight mt-1 ml-0.5 block font-sans">
              {totalInAccounting} Documents
            </span>
            <p className="text-[10px] text-amber-600 font-bold mt-1 inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></span>
              In Compliance Check
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-655 border border-amber-100 rounded-2xl group-hover:scale-105 transition duration-200">
            <Clock className="w-5.5 h-5.5" />
          </div>
        </div>

        {/* Returns */}
        <div className="bg-white border border-slate-205/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute left-0 top-0 h-full w-1 bg-rose-500 rounded-l-2xl"></div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest font-sans">Compliance Holds</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight mt-1 ml-0.5 block font-sans">
              {returnedForCompliance} Items
            </span>
            <p className="text-[10px] text-rose-600 font-bold mt-1 inline-flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-rose-500"></span>
              Returned to source units
            </p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl group-hover:scale-105 transition duration-200">
            <AlertTriangle className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      {/* Quick Desk Navigation Router Shortcuts */}
      <div className="bg-[#0c4a6e] bg-radial from-[#0c4a6e] to-[#042f4c] text-white rounded-2xl p-6 shadow-md overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-12 -translate-y-12 select-none">
          <Building className="w-64 h-64" />
        </div>
        <div className="max-w-xl">
          <h3 className="font-sans font-black text-xl tracking-tight">Active Financial Processing Sections.</h3>
          <p className="text-xs text-slate-200 mt-1 leading-relaxed">
            Access and manage document workflows across Budget, Accounting, and Cashier operations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <button
            onClick={() => { setActiveRole('Budget Officer'); setCurrentPath('budget'); }}
            className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/15 hover:border-sky-305 text-left transition duration-200 group relative"
          >
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-sky-300 font-extrabold uppercase font-mono tracking-widest bg-sky-950/40 py-1 px-2.5 rounded-md">Step 1 • Budget</span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition duration-200" />
            </div>
            <h4 className="font-sans font-bold text-sm text-white mt-3">Budget Allocation Desk</h4>
            <p className="text-[11px] text-slate-200 mt-1 leading-snug">Registration, strict Checklist compliance auditing & legal Obligation allotments.</p>
          </button>

          <button
            onClick={() => { setActiveRole('Chief Accountant'); setCurrentPath('accounting'); }}
            className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/15 hover:border-sky-305 text-left transition duration-200 group relative"
          >
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-sky-300 font-extrabold uppercase font-mono tracking-widest bg-sky-950/40 py-1 px-2.5 rounded-md">Step 2 • Accounting</span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition duration-200" />
            </div>
            <h4 className="font-sans font-bold text-sm text-white mt-3">Chief Accountant Desk</h4>
            <p className="text-[11px] text-slate-200 mt-1 leading-snug">Double-entry tax computations, strict internal control check, JEV & DV setup.</p>
          </button>

          <button
            onClick={() => { setActiveRole('Disbursing Cashier'); setCurrentPath('cashier'); }}
            className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/15 hover:border-sky-305 text-left transition duration-200 group relative"
          >
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-sky-300 font-extrabold uppercase font-mono tracking-widest bg-sky-950/40 py-1 px-2.5 rounded-md">Step 3 • Cashier</span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition duration-200" />
            </div>
            <h4 className="font-sans font-bold text-sm text-white mt-3">Cashier Release Desk</h4>
            <p className="text-[11px] text-slate-200 mt-1 leading-snug">Authorized signature verifications, official check printing, and release transfers.</p>
          </button>
        </div>
      </div>

      {/* Main Search and Table Filter */}
      <div className="space-y-4">
        <SearchBar
          keyword={globalSearchQuery}
          onKeywordChange={setGlobalSearchQuery}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedSection={selectedSection}
          onSectionChange={setSelectedSection}
          onReset={() => { setGlobalSearchQuery(''); setSelectedType('ALL'); setSelectedSection('ALL'); }}
        />

        {/* Ledger table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="font-sans font-black text-slate-805 text-sm tracking-tight uppercase">Primary Accounting Intake Ledger</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Found {sortedDocs.length} administrative workflow records</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white py-1 px-3 border border-slate-200 rounded-lg shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="font-sans text-[11px]">Sorted by <span className="text-[#0c4a6e] font-bold">{sortBy} ({sortOrder})</span></span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-extrabold text-slate-450 uppercase tracking-wider font-sans">
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition" onClick={() => handleSort('ID')}>Document ID</th>
                  <th className="px-6 py-4">Intake Date</th>
                  <th className="px-6 py-4">Beneficiary / Supplier</th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition text-right" onClick={() => handleSort('AMOUNT')}>Registered Value</th>
                  <th className="px-6 py-4">Workflow Department</th>
                  <th className="px-6 py-4">Status Tracking Code</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-inter">
                {sortedDocs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-400 font-inter">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <span className="text-slate-350 text-2xl font-black">∅</span>
                        <p className="text-xs font-semibold">No documents match your query / filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/40 transition">
                      {/* Document ID with icon */}
                      <td className="px-6 py-4 font-mono font-bold text-[#0c4a6e] whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-[9px] font-black font-sans text-slate-500 uppercase tracking-wider">
                            {doc.type}
                          </span>
                          {doc.id}
                        </div>
                      </td>
                      
                      {/* Date */}
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{doc.dateCreated}</td>

                      {/* Supplier */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{doc.supplier}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]" title={doc.title}>
                          {doc.title}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 font-mono font-bold text-slate-750 text-right whitespace-nowrap">
                        ₱{doc.amount.toLocaleString()}
                      </td>

                      {/* Department Desk */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-tight uppercase ${
                          doc.currentSection === 'BUDGET' ? 'bg-blue-50 text-blue-700 border border-blue-105' :
                          doc.currentSection === 'ACCOUNTING' ? 'bg-indigo-50 text-indigo-705 border border-indigo-105' :
                          doc.currentSection === 'CASHIER' ? 'bg-amber-50 text-amber-700 border border-amber-105' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-105'
                        }`}>
                          {doc.currentSection}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={doc.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Review Details Button */}
                          <button
                            onClick={() => setSelectedDoc(doc)}
                            className="p-1 px-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-[#0c4a6e]/5 hover:text-[#0c4a6e] hover:border-[#0c4a6e]/20 transition flex items-center gap-1 font-bold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Auditing Details
                          </button>
                          
                          {/* Route to specific Desk based on current step */}
                          <button
                            onClick={() => {
                              const route = doc.currentSection.toLowerCase();
                              if (route === 'budget') {
                                setActiveRole('Budget Officer');
                                setCurrentPath('budget');
                              } else if (route === 'accounting') {
                                setActiveRole('Chief Accountant');
                                setCurrentPath('accounting');
                              } else if (route === 'cashier') {
                                setActiveRole('Disbursing Cashier');
                                setCurrentPath('cashier');
                              } else {
                                alert("Document is finalized and closed. Visit historical archives for audits.");
                              }
                            }}
                            className={`p-1.5 rounded-lg border transition ${
                              doc.currentSection === 'COMPLETED' ? 'text-slate-300 border-slate-150 cursor-not-allowed bg-slate-50' : 'text-[#0c4a6e] bg-white border-slate-200 hover:bg-slate-50 shadow-xs'
                            }`}
                            disabled={doc.currentSection === 'COMPLETED'}
                            title="Process on Desk"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete shortcut for ease of simulation */}
                          <button
                            onClick={() => {
                              if (confirm(`Remove records for ${doc.id}?`)) {
                                deleteDocument(doc.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Comprehensive Operational Auditing Details Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-slate-800 border border-slate-700 rounded text-xs font-black tracking-wide">
                  {selectedDoc.type} ID: {selectedDoc.id}
                </span>
                <h3 className="font-sans font-extrabold text-sm truncate max-w-sm sm:max-w-md md:max-w-lg">{selectedDoc.title}</h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Core Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50 p-4 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Creditor / Vendor</span>
                  <p className="font-extrabold text-slate-800 text-sm mt-0.5">{selectedDoc.supplier}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Original Obligated amount</span>
                  <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">₱{selectedDoc.amount.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">State Progress Status</span>
                  <div className="mt-1">
                    <StatusBadge status={selectedDoc.status} />
                  </div>
                </div>
              </div>

              {/* Centralized timeline track */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Workflow Status Checklist</h4>
                <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
                  {/* Progress Line components */}
                  <div className="space-y-6">
                    {/* Budget steps metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Budget */}
                      <div className="bg-white p-3 border border-slate-200 rounded-lg">
                        <span className="text-[9px] uppercase font-mono text-blue-500 font-bold block mb-1">1. Budget parameters</span>
                        {selectedDoc.orsNumber ? (
                          <div className="space-y-1.5 text-xs text-slate-600">
                            <p className="font-semibold text-slate-700">ORS Code Assigned</p>
                            <p className="font-mono text-xs bg-slate-100 p-1 rounded font-bold w-fit text-slate-800">{selectedDoc.orsNumber}</p>
                            <p className="text-[11px] text-slate-400 italic">Approved by {selectedDoc.budgetApprovedBy} on {selectedDoc.budgetDateApproved}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Review not initiated in Budget Desk</p>
                        )}
                      </div>

                      {/* Accounting */}
                      <div className="bg-white p-3 border border-slate-200 rounded-lg">
                        <span className="text-[9px] uppercase font-mono text-blue-600 font-bold block mb-1">2. Accounting audit</span>
                        {selectedDoc.jevNumber ? (
                          <div className="space-y-1.5 text-xs text-slate-600">
                            <p className="font-semibold text-slate-700">Audit Completed</p>
                            <p className="font-mono text-xs bg-slate-100 p-1 rounded font-bold w-fit text-slate-800 font-mono">JEV: {selectedDoc.jevNumber}</p>
                            {selectedDoc.dvNumber && <p className="font-mono text-xs text-tech-accent font-bold">DV: {selectedDoc.dvNumber}</p>}
                            <p className="text-[11px] text-slate-400 italic">Certified by Chief Accountant on {selectedDoc.accountingDateApproved}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Review pending on Accounting desk</p>
                        )}
                      </div>

                      {/* Cashier */}
                      <div className="bg-white p-3 border border-slate-200 rounded-lg">
                        <span className="text-[9px] uppercase font-mono text-emerald-500 font-bold block mb-1">3. Cashier release</span>
                        {selectedDoc.status === 'CASHIER_PAID' ? (
                          <div className="space-y-1.5 text-xs text-slate-600">
                            <p className="font-semibold text-green-700 font-bold">Paid & Disbursed</p>
                            <p className="text-xs font-mono">Mode: <span className="font-bold text-slate-700">{selectedDoc.paymentMode}</span></p>
                            {selectedDoc.checkNumber && <p className="text-xs font-mono">Check #: {selectedDoc.checkNumber}</p>}
                            <p className="text-[11px] text-slate-400 italic">Released on {selectedDoc.paymentReleasedDate}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Awaiting disbursement scheduling</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax configuration audit if present */}
              {selectedDoc.taxConfig && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Government Tax Deductions Summary</h4>
                  <div className="border border-slate-200 p-4 rounded-xl text-xs space-y-2">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-slate-400">Tax Type:</span>
                        <p className="font-bold text-slate-800 text-sm">{selectedDoc.taxConfig.vatType}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">VAT Deductions ({selectedDoc.taxConfig.vatRate}%):</span>
                        <p className="font-bold text-slate-800 text-sm">₱{selectedDoc.taxConfig.vatAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Withholding Tax ({selectedDoc.taxConfig.withholdingRate}%):</span>
                        <p className="font-bold text-slate-800 text-sm">₱{selectedDoc.taxConfig.withholdingTax.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Net supplier payout:</span>
                        <p className="font-extrabold text-emerald-600 text-sm">₱{selectedDoc.taxConfig.netAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Journal Entries details */}
              {selectedDoc.journalEntries && selectedDoc.journalEntries.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Double-Entry Ledger Postings (JEV postings)</h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 font-bold">
                        <tr>
                          <th className="px-4 py-2">Account Code</th>
                          <th className="px-4 py-2">Account Title</th>
                          <th className="px-4 py-2 text-right">Debit</th>
                          <th className="px-4 py-2 text-right">Credit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {selectedDoc.journalEntries.map((je, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 text-xs">
                            <td className="px-4 py-2 text-tech-accent font-bold">{je.accountCode}</td>
                            <td className="px-4 py-2 text-slate-705 font-sans">{je.accountTitle}</td>
                            <td className="px-4 py-2 text-right text-slate-800 font-bold">De ₱{je.debit.toLocaleString()}</td>
                            <td className="px-4 py-2 text-right text-slate-800 font-bold">Cr ₱{je.credit.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Attached file listings */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Legal Compliance attachments</h4>
                {selectedDoc.attachments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No attachments registered with this entry.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedDoc.attachments.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="p-1.5 bg-blue-50 border border-blue-150 rounded text-tech-accent">
                          📄
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-700 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400">{file.size} • Attached {file.dateAdded}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl flex justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-350 text-slate-750 rounded-lg transition"
              >
                Close Audit Page
              </button>
              {selectedDoc.currentSection !== 'COMPLETED' && (
                <button
                  onClick={() => {
                    const sectionStr = selectedDoc.currentSection.toLowerCase();
                    if (sectionStr === 'budget') {
                      setActiveRole('Budget Officer');
                      setCurrentPath('budget');
                    } else if (sectionStr === 'accounting') {
                      setActiveRole('Chief Accountant');
                      setCurrentPath('accounting');
                    } else if (sectionStr === 'cashier') {
                      setActiveRole('Disbursing Cashier');
                      setCurrentPath('cashier');
                    }
                    setSelectedDoc(null);
                  }}
                  className="px-4 py-2 bg-tech-accent hover:bg-tech-accent-hover text-white rounded-lg transition flex items-center gap-1"
                >
                  Assume Desk Office & Process
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
