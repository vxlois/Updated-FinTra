import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'BUDGET_PENDING':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          label: 'Budget Review'
        };
      case 'BUDGET_APPROVED':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Budget Obligated'
        };
      case 'ACCOUNTING_PENDING':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'Acctg Desk Inbox'
        };
      case 'ACCOUNTING_RETURNED':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',
          label: 'Compliance Return'
        };
      case 'ACCOUNTING_APPROVED':
        return {
          bg: 'bg-teal-50 text-teal-700 border-teal-200',
          label: 'Acctg Certified'
        };
      case 'CASHIER_PENDING':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Cashier Release Pool'
        };
      case 'CASHIER_PAID':
        return {
          bg: 'bg-green-100 text-green-800 border-green-300',
          label: 'Disbursed / Done'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          label: status
        };
    }
  };

  const { bg, label } = getStyle();

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};
