import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';

interface SearchBarProps {
  keyword: string;
  onKeywordChange: (val: string) => void;
  selectedType: string;
  onTypeChange: (val: string) => void;
  selectedSection: string;
  onSectionChange: (val: string) => void;
  onReset: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  keyword,
  onKeywordChange,
  selectedType,
  onTypeChange,
  selectedSection,
  onSectionChange,
  onReset
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3 font-inter">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="search_input_field"
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="Search by ID (DOC, ORS, DV, JEV), Supplier, or Document Title..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0c4a6e] focus:border-[#0c4a6e] focus:bg-white transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Document Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="type_filter_select"
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL">All Types</option>
              <option value="PR">PR (Purchase Request)</option>
              <option value="DV">DV (Disbursement Voucher)</option>
              <option value="PO">PO (Purchase Order)</option>
            </select>
          </div>

          {/* Section Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="section_filter_select"
              value={selectedSection}
              onChange={(e) => onSectionChange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL">All Departments/Desks</option>
              <option value="BUDGET">Budget Section</option>
              <option value="ACCOUNTING">Accounting Desk</option>
              <option value="CASHIER">Cashier Desk</option>
              <option value="COMPLETED">Completed / Paid</option>
            </select>
          </div>

          {/* Reset button */}
          {(keyword || selectedType !== 'ALL' || selectedSection !== 'ALL') && (
            <button
              id="reset_filters_btn"
              onClick={onReset}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
