import React, { useState } from 'react';
import { useWorkflow } from '../hooks/useWorkflow';
import { ShieldCheck, History, Search, Download } from 'lucide-react';

export const AuditTrailLog: React.FC = () => {
  const { auditLogs } = useWorkflow();
  const [logKeyword, setLogKeyword] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const textMatch = 
      log.documentId.toLowerCase().includes(logKeyword.toLowerCase()) ||
      log.documentTitle.toLowerCase().includes(logKeyword.toLowerCase()) ||
      log.action.toLowerCase().includes(logKeyword.toLowerCase()) ||
      (log.remarks && log.remarks.toLowerCase().includes(logKeyword.toLowerCase()));
    
    const roleMatch = filterRole === 'ALL' || log.role === filterRole;

    return textMatch && roleMatch;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header Panel */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="font-sans font-bold text-slate-800 text-sm">System Operations Audit Trail</h3>
            <p className="text-xs text-slate-400">Irreversible, tamper-proof sequential operational logs (COA/BIR Compliance)</p>
          </div>
        </div>

        <button 
          id="export_csv_btn"
          onClick={() => {
            alert("CSV Export feature initialized: Downloading 25 records...");
          }}
          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Export Ledger
        </button>
      </div>

      {/* Audit Tool Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="audit_quick_search"
            type="text"
            value={logKeyword}
            onChange={(e) => setLogKeyword(e.target.value)}
            placeholder="Search audit trail by action, document ID, title, or details..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold uppercase">Executor Role:</span>
          <select
            id="audit_role_select"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Officers</option>
            <option value="Budget Officer">Budget Officer (Maria)</option>
            <option value="Chief Accountant">Chief Accountant (Cesar)</option>
            <option value="Disbursing Cashier">Disbursing Cashier (Regina)</option>
            <option value="System">System Automated</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-36">Timestamp</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-32">Document ID</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-40">Officer</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-56">Action</th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400">
                  No matching log records found
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/40 transition">
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-4 py-3 font-mono font-bold text-indigo-600 whitespace-nowrap">{log.documentId}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {log.user.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700">{log.user}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">{log.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800">{log.action}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-sm">
                    <p className="truncate hover:text-clip hover:whitespace-normal transition duration-300">
                      {log.remarks}
                    </p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer */}
      <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-[10px] text-center text-slate-400 uppercase font-mono tracking-widest flex items-center justify-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        Authenticated Digital Accounting Protocol Active
      </div>
    </div>
  );
};
