export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface TaxComputation {
  grossAmount: number;
  vatRate: number; // e.g. 5%
  withholdingRate: number; // e.g. 1% or 2%
  vatAmount: number;
  withholdingTax: number;
  netAmount: number;
  vatType: 'VAT' | 'NON-VAT';
}

export interface JournalEntry {
  accountCode: string;
  accountTitle: string;
  debit: number;
  credit: number;
}

export interface Document {
  id: string; // e.g., DOC-2026-0001
  title: string;
  type: 'PR' | 'DV' | 'PO'; // Purchase Request, Disbursement Voucher, Purchase Order
  supplier: string;
  amount: number;
  dateCreated: string;
  
  // Section Statuses
  status: 'BUDGET_PENDING' | 'BUDGET_APPROVED' | 'ACCOUNTING_PENDING' | 'ACCOUNTING_RETURNED' | 'ACCOUNTING_APPROVED' | 'CASHIER_PENDING' | 'CASHIER_PAID';
  currentSection: 'BUDGET' | 'ACCOUNTING' | 'CASHIER' | 'COMPLETED';
  
  // Budget Section Data
  orsNumber?: string; // Obligation Request and Status Number
  budgetRemarks?: string;
  budgetChecklist: ChecklistItem[];
  budgetApprovedBy?: string;
  budgetDateApproved?: string;

  // Budget Section Real-world manual workflow fields
  docsRefNo?: string;
  serialNo?: string;
  receivedDocsForObligation?: boolean;
  receivedDate?: string;
  receivedTime?: string;
  allotmentClass?: 'MOOE' | 'SETUP' | 'PMB' | 'SAA-SARAI' | 'LGIA' | 'PS' | 'CEST' | 'SAA-TechGrow' | 'SSC PMB' | 'Others' | string;
  prNo?: string;
  poNo?: string;
  payeeName?: string;
  particulars?: string;
  responsibilityCenter?: string;
  expenseObjectCode?: string;
  forwardedTo?: 'Accounting' | 'Supply' | 'RPMO' | string;
  forwardedDate?: string;
  forwardedTime?: string;
  
  // Accounting Section Data
  classification?: 'DV' | 'PO';
  accountingChecklist: ChecklistItem[];
  accountingRemarks?: string;
  accountingApprovedBy?: string;
  accountingDateApproved?: string;
  dvNumber?: string; // Disbursement Voucher Number (if classification is DV)
  jevNumber?: string; // Journal Entry Voucher Number
  poValidationStatus?: 'PENDING' | 'VALID' | 'INVALID';
  taxConfig?: TaxComputation;
  journalEntries?: JournalEntry[];
  
  // Cashier Section Data
  paymentMode?: 'EMDS' | 'LDDAP-ADA' | 'CHECK';
  emdsStatus?: 'INITIALIZED' | 'TRANSMITTED' | 'ACKNOWLEDGED';
  signatures?: {
    accountantSigned: boolean;
    ordSigned: boolean; // Office of the Regional Director
  };
  checkNumber?: string;
  checkDate?: string;
  cashierRemarks?: string;
  paymentReleasedDate?: string;
  attachments: { name: string; size: string; dateAdded: string }[];
}

export interface AuditLog {
  id: string;
  documentId: string;
  documentTitle: string;
  user: string;
  role: 'Budget Officer' | 'Chief Accountant' | 'Disbursing Cashier' | 'System';
  action: string;
  timestamp: string;
  remarks?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  documentId?: string;
}

export interface User {
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
}

export type Role = 'Budget Officer' | 'Chief Accountant' | 'Disbursing Cashier' | 'Administrator';
