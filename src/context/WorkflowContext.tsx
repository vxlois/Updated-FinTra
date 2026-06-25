import React, { createContext, useContext, useState, useEffect } from 'react';
import { Document, AuditLog, Notification, Role, ChecklistItem, TaxComputation, JournalEntry, User } from '../types';

interface WorkflowContextType {
  documents: Document[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  activeRole: Role;
  currentPath: string;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  authLoading: boolean;
  authError: string | null;
  signInWithGoogle: (name: string, email: string, role: Role) => Promise<User>;
  signOut: () => Promise<void>;
  setActiveRole: (role: Role) => void;
  setCurrentPath: (path: string) => void;
  createDocument: (doc: { title: string; type: 'PR' | 'DV' | 'PO'; supplier: string; amount: number; attachments: { name: string; size: string; dateAdded: string }[] }) => void;
  approveBudget: (docId: string, data: {
    orsNumber: string;
    remarks: string;
    checklist: ChecklistItem[];
    docsRefNo?: string;
    serialNo?: string;
    receivedDocsForObligation?: boolean;
    receivedDate?: string;
    receivedTime?: string;
    allotmentClass?: string;
    prNo?: string;
    poNo?: string;
    payeeName?: string;
    particulars?: string;
    responsibilityCenter?: string;
    expenseObjectCode?: string;
    forwardedTo?: string;
    forwardedDate?: string;
    forwardedTime?: string;
  }) => void;
  returnToCompliance: (docId: string, remarks: string) => void;
  approveAccounting: (docId: string, data: {
    classification: 'DV' | 'PO';
    checklist: ChecklistItem[];
    remarks: string;
    dvNumber: string;
    jevNumber: string;
    poValidationStatus: 'VALID' | 'INVALID';
    taxConfig: TaxComputation;
    journalEntries: JournalEntry[];
  }) => void;
  processPayment: (docId: string, data: {
    paymentMode: 'EMDS' | 'LDDAP-ADA' | 'CHECK';
    emdsStatus?: 'INITIALIZED' | 'TRANSMITTED' | 'ACKNOWLEDGED';
    accountantSigned: boolean;
    ordSigned: boolean;
    checkNumber?: string;
    checkDate?: string;
    remarks: string;
  }) => void;
  addNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error', docId?: string) => void;
  clearNotifications: () => void;
  markNotificationRead: (id: string) => void;
  addAttachment: (docId: string, name: string, size: string) => void;
  deleteDocument: (docId: string) => void;
  updateUserProfile: (updatedUser: Partial<User>) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  systemStatus: 'online' | 'syncing' | 'offline' | 'maintenance';
  setSystemStatus: (status: 'online' | 'syncing' | 'offline' | 'maintenance') => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

// Initial Checklist Templates
const INITIAL_BUDGET_CHECKLIST: ChecklistItem[] = [
  { id: 'b1', label: 'Approved Budget Allocation available', checked: false },
  { id: 'b2', label: 'Activity Design & Authority to Travel attached', checked: false },
  { id: 'b3', label: 'Purchase Request (PR) signed by requesting unit', checked: false },
  { id: 'b4', label: 'Complete terms of reference / specifications list', checked: false },
];

const INITIAL_ACCOUNTING_CHECKLIST: ChecklistItem[] = [
  { id: 'a1', label: 'Obligation Request & Status (ORS) signed', checked: false },
  { id: 'a2', label: 'BAC Resolution & Notice of Award attached', checked: false },
  { id: 'a3', label: 'Sales Invoice / Delivery Receipt verified', checked: false },
  { id: 'a4', label: 'Prior Tax Return / BIR certification validated', checked: false },
];

// Helper to get formatted timestamps
const getTimestamp = () => {
  const date = new Date();
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const INITIAL_DOCUMENTS: Document[] = [
  {
    id: 'DOC-2026-0001',
    title: 'Procurement of Enterprise Server & Laptops',
    type: 'PO',
    supplier: 'NexTech Solutions Ltd.',
    amount: 148500,
    dateCreated: 'Jun 15, 2026',
    status: 'CASHIER_PENDING',
    currentSection: 'CASHIER',
    orsNumber: 'ORS-2026-06-0382',
    budgetRemarks: 'Funds obligated from the capital outlays. Verified all line items.',
    budgetChecklist: INITIAL_BUDGET_CHECKLIST.map(item => ({ ...item, checked: true })),
    budgetApprovedBy: 'Maria Santos (Budget Officer)',
    budgetDateApproved: 'Jun 16, 2026',
    
    // Real-world manual workflow fields
    docsRefNo: 'REF-2026-001A',
    serialNo: 'SN-2026-B001',
    receivedDocsForObligation: true,
    receivedDate: '15-Jun-2026',
    receivedTime: '10:15 AM',
    allotmentClass: 'SETUP',
    prNo: 'PR-2026-05-0041',
    poNo: 'PO-2026-05-0022',
    payeeName: 'NexTech Solutions Ltd.',
    particulars: 'Procurement of Enterprise Server & Laptops for SETUP project recipients',
    responsibilityCenter: 'SETUP Regional Office',
    expenseObjectCode: '5-02-03-010',
    forwardedTo: 'Accounting',
    forwardedDate: '16-Jun-2026',
    forwardedTime: '11:30 AM',

    classification: 'PO',
    accountingChecklist: INITIAL_ACCOUNTING_CHECKLIST.map(item => ({ ...item, checked: true })),
    accountingRemarks: 'Computation for 2% EWT and 5% VAT applied properly.',
    accountingApprovedBy: 'Cesar Aguinaldo (Chief Accountant)',
    accountingDateApproved: 'Jun 18, 2026',
    dvNumber: 'DV-2026-06-1182',
    jevNumber: 'JEV-2026-06-0041',
    poValidationStatus: 'VALID',
    taxConfig: {
      grossAmount: 148500,
      vatType: 'VAT',
      vatRate: 5,
      withholdingRate: 2,
      vatAmount: 7425,
      withholdingTax: 2970,
      netAmount: 138105
    },
    journalEntries: [
      { accountCode: '1-02-03-010', accountTitle: 'Office Equipment', debit: 148500, credit: 0 },
      { accountCode: '2-02-01-010', accountTitle: 'Due to BIR (VAT)', debit: 0, credit: 7425 },
      { accountCode: '2-02-01-020', accountTitle: 'Due to BIR (EWT)', debit: 0, credit: 2970 },
      { accountCode: '1-01-02-020', accountTitle: 'Cash - Local Currency', debit: 0, credit: 138105 }
    ],
    attachments: [
      { name: 'purchase_request_approved.pdf', size: '1.2 MB', dateAdded: 'Jun 15, 2026' },
      { name: 'bac_resolution_award.pdf', size: '2.4 MB', dateAdded: 'Jun 15, 2026' },
      { name: 'sales_invoice_nextech.pdf', size: '540 KB', dateAdded: 'Jun 17, 2026' }
    ]
  },
  {
    id: 'DOC-2026-0002',
    title: 'Catering Services for Mid-Year Performance Seminar',
    type: 'DV',
    supplier: 'Savory Spoon Catering Co.',
    amount: 32400,
    dateCreated: 'Jun 18, 2026',
    status: 'ACCOUNTING_PENDING',
    currentSection: 'ACCOUNTING',
    orsNumber: 'ORS-2026-06-0419',
    budgetRemarks: 'Charged under MOOE - Training Seminars. Approved program design attached.',
    budgetChecklist: INITIAL_BUDGET_CHECKLIST.map(item => ({ ...item, checked: true })),
    budgetApprovedBy: 'Maria Santos (Budget Officer)',
    budgetDateApproved: 'Jun 19, 2026',

    // Real-world manual workflow fields
    docsRefNo: 'REF-2026-002B',
    serialNo: 'SN-2026-B002',
    receivedDocsForObligation: true,
    receivedDate: '18-Jun-2026',
    receivedTime: '08:45 AM',
    allotmentClass: 'MOOE',
    prNo: 'PR-2026-06-0091',
    payeeName: 'Savory Spoon Catering Co.',
    particulars: 'Catering Services for Mid-Year Performance Seminar with regional personnel',
    responsibilityCenter: 'Finance and Administrative Services',
    expenseObjectCode: '5-02-02-010',
    forwardedTo: 'Accounting',
    forwardedDate: '19-Jun-2026',
    forwardedTime: '09:12 AM',

    attachments: [
      { name: 'activity_design_recreation.pdf', size: '980 KB', dateAdded: 'Jun 18, 2026' },
      { name: 'catering_quotation_menu.pdf', size: '420 KB', dateAdded: 'Jun 18, 2026' }
    ],
    accountingChecklist: INITIAL_ACCOUNTING_CHECKLIST.map(item => ({ ...item, checked: item.id === 'a1' }))
  },
  {
    id: 'DOC-2026-0003',
    title: 'Security Services Contract - Regional Depot',
    type: 'PO',
    supplier: 'ShieldGuard Protection Force',
    amount: 520000,
    dateCreated: 'Jun 20, 2026',
    status: 'BUDGET_PENDING',
    currentSection: 'BUDGET',
    budgetChecklist: INITIAL_BUDGET_CHECKLIST.map(item => ({ ...item, checked: item.id === 'b3' })),

    // Real-world manual workflow fields
    docsRefNo: 'REF-2026-003C',
    serialNo: 'SN-2026-B003',
    receivedDocsForObligation: true,
    receivedDate: '20-Jun-2026',
    receivedTime: '11:29 AM',
    allotmentClass: 'MOOE',
    prNo: 'PR-2026-05-0012',
    poNo: 'PO-2026-05-0010',
    payeeName: 'ShieldGuard Protection Force',
    particulars: 'Security services contract for the Regional Depot operations',
    responsibilityCenter: 'Supply and Property Unit',
    expenseObjectCode: '5-02-12-030',

    attachments: [
      { name: 'contract_draft_shieldguard.pdf', size: '3.8 MB', dateAdded: 'Jun 20, 2026' }
    ],
    accountingChecklist: INITIAL_ACCOUNTING_CHECKLIST
  },
  {
    id: 'DOC-2026-0004',
    title: 'Office Supplies Expansion (Rejection Demo)',
    type: 'PR',
    supplier: 'Prime Office Stationeries',
    amount: 12850,
    dateCreated: 'Jun 12, 2026',
    status: 'ACCOUNTING_RETURNED',
    currentSection: 'BUDGET', // Sent back to Budget section workflow due to non-compliance
    orsNumber: 'ORS-2026-06-0210',
    budgetRemarks: 'Obligated under office supplies expense account.',
    budgetChecklist: INITIAL_BUDGET_CHECKLIST.map(item => ({ ...item, checked: true })),
    budgetApprovedBy: 'Maria Santos (Budget Officer)',
    budgetDateApproved: 'Jun 13, 2026',

    // Real-world manual workflow fields
    docsRefNo: 'REF-2026-004D',
    serialNo: 'SN-2026-B004',
    receivedDocsForObligation: true,
    receivedDate: '12-Jun-2026',
    receivedTime: '09:00 AM',
    allotmentClass: 'MOOE',
    prNo: 'PR-2026-06-0011',
    payeeName: 'Prime Office Stationeries',
    particulars: 'Emergency purchase of high-priority office supplies',
    responsibilityCenter: 'Technical Services Division',
    expenseObjectCode: '5-02-03-010',
    forwardedTo: 'Accounting',
    forwardedDate: '13-Jun-2026',
    forwardedTime: '11:15 AM',

    accountingRemarks: 'RETURNED: Missing signature from the requisition unit manager on the local procurement form. Please re-attach and re-route.',
    accountingChecklist: INITIAL_ACCOUNTING_CHECKLIST.map(item => ({ ...item, checked: item.id === 'a1' || item.id === 'a3' })),
    attachments: [
      { name: 'office_supplies_requisition.pdf', size: '1.1 MB', dateAdded: 'Jun 12, 2026' }
    ]
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-001',
    documentId: 'DOC-2026-0001',
    documentTitle: 'Procurement of Enterprise Server & Laptops',
    user: 'Maria Santos',
    role: 'Budget Officer',
    action: 'Document Registered & ORS Generated',
    timestamp: 'Jun 16, 2026, 10:15 AM',
    remarks: 'Registered PR and generated ORS-2026-06-0382'
  },
  {
    id: 'aud-002',
    documentId: 'DOC-2026-0001',
    documentTitle: 'Procurement of Enterprise Server & Laptops',
    user: 'Maria Santos',
    role: 'Budget Officer',
    action: 'Forwarded to Accounting',
    timestamp: 'Jun 16, 2026, 11:30 AM',
    remarks: 'Approved budget eligibility and routed to chief accountant'
  },
  {
    id: 'aud-003',
    documentId: 'DOC-2026-0001',
    documentTitle: 'Procurement of Enterprise Server & Laptops',
    user: 'Cesar Aguinaldo',
    role: 'Chief Accountant',
    action: 'Accounting Review & Tax Computation Enacted',
    timestamp: 'Jun 18, 2026, 02:45 PM',
    remarks: 'Processed tax deductions. JEV and DV numbers generated.'
  },
  {
    id: 'aud-004',
    documentId: 'DOC-2026-0001',
    documentTitle: 'Procurement of Enterprise Server & Laptops',
    user: 'Cesar Aguinaldo',
    role: 'Chief Accountant',
    action: 'Forwarded to Cashier for Payment',
    timestamp: 'Jun 18, 2026, 04:00 PM',
    remarks: 'DV-2026-06-1182 approved and forwarded to Cashier Section.'
  },
  {
    id: 'aud-005',
    documentId: 'DOC-2026-0002',
    documentTitle: 'Catering Services for Mid-Year Performance Seminar',
    user: 'Maria Santos',
    role: 'Budget Officer',
    action: 'Budget Registration & Forwarded',
    timestamp: 'Jun 19, 2026, 09:12 AM',
    remarks: 'ORS generated and forwarded to Accounting Section.'
  },
  {
    id: 'aud-006',
    documentId: 'DOC-2026-0004',
    documentTitle: 'Office Supplies Expansion (Rejection Demo)',
    user: 'Cesar Aguinaldo',
    role: 'Chief Accountant',
    action: 'Returned for Compliance Check',
    timestamp: 'Jun 14, 2026, 11:15 AM',
    remarks: 'Returned because Requesting unit signature was missing.'
  }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'Document Returned',
    message: 'DOC-2026-0004 "Office Supplies Expansion" was returned to Budget Section for Compliance.',
    timestamp: 'Jun 14, 2026, 11:15 AM',
    read: false,
    type: 'warning',
    documentId: 'DOC-2026-0004'
  },
  {
    id: 'notif-2',
    title: 'New Document Registered',
    message: 'DOC-2026-0003 Security Services Contract is awaiting Budget Section review.',
    timestamp: 'Jun 20, 2026, 04:30 PM',
    read: false,
    type: 'info',
    documentId: 'DOC-2026-0003'
  }
];

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('financial_system_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('financial_system_audits');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('financial_system_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('financial_system_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeRole, setActiveRole] = useState<Role>(() => {
    const savedRole = localStorage.getItem('financial_system_role');
    const savedUser = localStorage.getItem('financial_system_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser) as User;
        return u.role;
      } catch (e) {}
    }
    return (savedRole as Role) || 'Administrator';
  });

  const [currentPath, setCurrentPath] = useState<string>(() => {
    // Dynamic SPA Router emulation
    const hash = window.location.hash;
    if (['#/budget', '#/accounting', '#/cashier', '#/dashboard', '#/audit'].includes(hash)) {
      return hash.substring(1);
    }
    return '/dashboard';
  });

  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [systemStatus, setSystemStatus] = useState<'online' | 'syncing' | 'offline' | 'maintenance'>('online');

  useEffect(() => {
    const handleOnline = () => {
      setSystemStatus('syncing');
      const timer = setTimeout(() => {
        setSystemStatus('online');
      }, 1500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setSystemStatus('offline');
    };

    if (!navigator.onLine) {
      setSystemStatus('offline');
    } else {
      setSystemStatus('syncing');
      const timer = setTimeout(() => {
        setSystemStatus('online');
      }, 1500);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const syncTimer = setInterval(() => {
      if (navigator.onLine) {
        setSystemStatus('syncing');
        const timer = setTimeout(() => {
          setSystemStatus('online');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }, 45000);

    return () => {
      clearInterval(syncTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('financial_system_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('financial_system_audits', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('financial_system_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('financial_system_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('financial_system_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('financial_system_user');
    }
  }, [user]);

  const login = (newUser: User) => {
    setUser(newUser);
    setActiveRole(newUser.role);
    localStorage.setItem('financial_system_user', JSON.stringify(newUser));
    localStorage.setItem('financial_system_role', newUser.role);
    addNotification('Google Sign-In Successful', `Welcome, ${newUser.name}. Authenticated as ${newUser.role} via ${newUser.email}.`, 'success');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('financial_system_user');
    addNotification('Session Disconnected', 'Successfully signed out from Google account.', 'info');
  };

  const signInWithGoogle = async (name: string, email: string, role: Role): Promise<User> => {
    setAuthLoading(true);
    setAuthError(null);
    return new Promise<User>((resolve, reject) => {
      setTimeout(() => {
        try {
          if (email.includes('@') && !email.endsWith('.dost.gov.ph') && !email.endsWith('@gmail.com')) {
            throw new Error("Access Restricted (403): Workplace domain is invalid or unrecognized.");
          }
          
          const newUser: User = {
            name,
            email,
            role,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=fff&bold=true`
          };
          
          setUser(newUser);
          setActiveRole(role);
          localStorage.setItem('financial_system_user', JSON.stringify(newUser));
          localStorage.setItem('financial_system_role', role);
          addNotification('Google Sign-In Successful', `Welcome, ${newUser.name}. Authenticated as ${newUser.role} via ${newUser.email}.`, 'success');
          resolve(newUser);
        } catch (err: any) {
          const msg = err.message || "Failed to authenticate with Google.";
          setAuthError(msg);
          addNotification('Authentication Failed', msg, 'error');
          reject(err);
        } finally {
          setAuthLoading(false);
        }
      }, 1000);
    });
  };

  const signOut = async (): Promise<void> => {
    setAuthLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setUser(null);
        localStorage.removeItem('financial_system_user');
        addNotification('Session Disconnected', 'Successfully signed out from Google account.', 'info');
        setAuthLoading(false);
        resolve();
      }, 600);
    });
  };

  // Handle browser routing simulation via Hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (['#/budget', '#/accounting', '#/cashier', '#/dashboard', '#/audit'].includes(hash)) {
        setCurrentPath(hash.substring(1));
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const changePath = (path: string) => {
    window.location.hash = '#' + path;
    setCurrentPath(path);
  };

  const addNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error', docId?: string) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: getTimestamp(),
      read: false,
      type,
      documentId: docId
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addAuditLog = (documentId: string, documentTitle: string, action: string, remarks?: string) => {
    const freshLog: AuditLog = {
      id: `aud-${Date.now()}`,
      documentId,
      documentTitle,
      user: user ? user.name : (activeRole === 'Budget Officer' ? 'Maria Santos' : activeRole === 'Chief Accountant' ? 'Cesar Aguinaldo' : activeRole === 'Disbursing Cashier' ? 'Regina Clave' : 'Super Admin'),
      role: activeRole === 'Administrator' ? 'System' : (activeRole as any),
      action,
      timestamp: getTimestamp(),
      remarks
    };
    setAuditLogs(prev => [freshLog, ...prev]);
  };

  // 1. Budget Section Form Submit
  const createDocument = (newDoc: { title: string; type: 'PR' | 'DV' | 'PO'; supplier: string; amount: number; attachments: { name: string; size: string; dateAdded: string }[] }) => {
    const id = `DOC-2201-${1000 + documents.length + 1}`;
    const freshDoc: Document = {
      id,
      title: newDoc.title,
      type: newDoc.type,
      supplier: newDoc.supplier,
      amount: newDoc.amount,
      dateCreated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'BUDGET_PENDING',
      currentSection: 'BUDGET',
      budgetChecklist: INITIAL_BUDGET_CHECKLIST.map(item => ({ ...item })),
      accountingChecklist: INITIAL_ACCOUNTING_CHECKLIST.map(item => ({ ...item })),
      attachments: newDoc.attachments
    };

    setDocuments(prev => [freshDoc, ...prev]);
    addAuditLog(id, freshDoc.title, 'Document Intake & Registered', `Created in intake form by ${activeRole}.`);
    addNotification('New Document Received', `${freshDoc.id} "${freshDoc.title}" registered under Budget section.`, 'info', id);
  };

  // 2. Budget Approval Workflow (Generate ORS & Send to Accounting)
  const approveBudget = (docId: string, data: {
    orsNumber: string;
    remarks: string;
    checklist: ChecklistItem[];
    docsRefNo?: string;
    serialNo?: string;
    receivedDocsForObligation?: boolean;
    receivedDate?: string;
    receivedTime?: string;
    allotmentClass?: string;
    prNo?: string;
    poNo?: string;
    payeeName?: string;
    particulars?: string;
    responsibilityCenter?: string;
    expenseObjectCode?: string;
    forwardedTo?: string;
    forwardedDate?: string;
    forwardedTime?: string;
  }) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        const isDraft = data.forwardedTo === 'DRAFT';
        const isForwardedToAcctg = data.forwardedTo === 'Accounting' || !data.forwardedTo;
        
        return {
          ...doc,
          orsNumber: data.orsNumber,
          budgetRemarks: data.remarks,
          budgetChecklist: data.checklist,
          budgetApprovedBy: isDraft ? doc.budgetApprovedBy : 'Maria Santos (Budget Officer)',
          budgetDateApproved: isDraft ? doc.budgetDateApproved : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: isDraft ? doc.status : (isForwardedToAcctg ? 'ACCOUNTING_PENDING' : 'BUDGET_APPROVED'),
          currentSection: isDraft ? doc.currentSection : (isForwardedToAcctg ? 'ACCOUNTING' : 'COMPLETED'),
          
          // Capture and save manual workflow fields
          docsRefNo: data.docsRefNo || doc.docsRefNo,
          serialNo: data.serialNo || doc.serialNo,
          receivedDocsForObligation: data.receivedDocsForObligation ?? doc.receivedDocsForObligation,
          receivedDate: data.receivedDate || doc.receivedDate,
          receivedTime: data.receivedTime || doc.receivedTime,
          allotmentClass: data.allotmentClass || doc.allotmentClass,
          prNo: data.prNo || doc.prNo,
          poNo: data.poNo || doc.poNo,
          payeeName: data.payeeName || doc.payeeName,
          particulars: data.particulars || doc.particulars,
          responsibilityCenter: data.responsibilityCenter || doc.responsibilityCenter,
          expenseObjectCode: data.expenseObjectCode || doc.expenseObjectCode,
          forwardedTo: isDraft ? doc.forwardedTo : data.forwardedTo,
          forwardedDate: isDraft ? doc.forwardedDate : data.forwardedDate,
          forwardedTime: isDraft ? doc.forwardedTime : data.forwardedTime
        };
      }
      return doc;
    }));

    const doc = documents.find(d => d.id === docId);
    if (doc) {
      if (data.forwardedTo === 'DRAFT') {
        addAuditLog(docId, doc.title, `Budget Draft Changes Saved`, `Saved intermediate manual workflow values.`);
      } else {
        const dest = data.forwardedTo || 'Accounting';
        addAuditLog(docId, doc.title, `Budget Approved & Obligated`, `Obligated under ORS ${data.orsNumber}. Forwarded to ${dest}.`);
        addNotification(`Forwarded to ${dest}`, `${docId} approved by Budget Section and routed to ${dest}.`, 'success', docId);
      }
    }
  };

  // 3. Return to budget for Compliance
  const returnToCompliance = (docId: string, remarks: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          status: 'ACCOUNTING_RETURNED',
          currentSection: 'BUDGET', // Return control to Budget section
          accountingRemarks: `COMPLIANCE FAILURE: ${remarks}`
        };
      }
      return doc;
    }));

    const doc = documents.find(d => d.id === docId);
    if (doc) {
      addAuditLog(docId, doc.title, 'Returned for Compliance Check', remarks);
      addNotification('Compliance Check Failed', `${docId} was marked non-compliant and returned to Budget section.`, 'warning', docId);
    }
  };

  // 4. Accounting Desk Approval
  const approveAccounting = (docId: string, data: {
    classification: 'DV' | 'PO';
    checklist: ChecklistItem[];
    remarks: string;
    dvNumber: string;
    jevNumber: string;
    poValidationStatus: 'VALID' | 'INVALID';
    taxConfig: TaxComputation;
    journalEntries: JournalEntry[];
  }) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          classification: data.classification,
          accountingRemarks: data.remarks,
          accountingChecklist: data.checklist,
          dvNumber: data.dvNumber,
          jevNumber: data.jevNumber,
          poValidationStatus: data.poValidationStatus,
          taxConfig: data.taxConfig,
          journalEntries: data.journalEntries,
          accountingApprovedBy: 'Cesar Aguinaldo (Chief Accountant)',
          accountingDateApproved: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'CASHIER_PENDING',
          currentSection: 'CASHIER'
        };
      }
      return doc;
    }));

    const doc = documents.find(d => d.id === docId);
    if (doc) {
      addAuditLog(docId, doc.title, 'Accounting Approved & JEV Encoded', `Tax audited. JEV ${data.jevNumber} / DV ${data.dvNumber} issued. Forwarded to Cashier.`);
      addNotification('DV/JEV Certified & Sent to Cashier', `${docId} certified by Chief Accountant and forwarded to Cashier.`, 'success', docId);
    }
  };

  // 5. Cashier Payment Release
  const processPayment = (docId: string, data: {
    paymentMode: 'EMDS' | 'LDDAP-ADA' | 'CHECK';
    emdsStatus?: 'INITIALIZED' | 'TRANSMITTED' | 'ACKNOWLEDGED';
    accountantSigned: boolean;
    ordSigned: boolean;
    checkNumber?: string;
    checkDate?: string;
    remarks: string;
  }) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          paymentMode: data.paymentMode,
          emdsStatus: data.emdsStatus,
          signatures: {
            accountantSigned: data.accountantSigned,
            ordSigned: data.ordSigned
          },
          checkNumber: data.checkNumber,
          checkDate: data.checkDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          cashierRemarks: data.remarks,
          paymentReleasedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'CASHIER_PAID',
          currentSection: 'COMPLETED'
        };
      }
      return doc;
    }));

    const doc = documents.find(d => d.id === docId);
    if (doc) {
      addAuditLog(docId, doc.title, 'Payment Released / Disbursed', `Payment finalized via ${data.paymentMode}. Complete transaction cycle logged.`);
      addNotification('Disbursement Released!', `Successfully processed payment for ${docId} via ${data.paymentMode}.`, 'success', docId);
    }
  };

  const addAttachment = (docId: string, name: string, size: string) => {
    setDocuments(prev => prev.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          attachments: [
            ...doc.attachments,
            { name, size, dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
          ]
        };
      }
      return doc;
    }));
  };

  const deleteDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    setDocuments(prev => prev.filter(d => d.id !== docId));
    if (doc) {
      addAuditLog(docId, doc.title, 'Document Deleted', 'Deleted from system record store');
    }
  };

  const updateUserProfile = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      localStorage.setItem('financial_system_user', JSON.stringify(newUser));
      if (updatedUser.role && updatedUser.role !== activeRole) {
        setActiveRole(updatedUser.role);
      }
    }
  };

  return (
    <WorkflowContext.Provider value={{
      documents,
      auditLogs,
      notifications,
      activeRole,
      currentPath,
      user,
      login,
      logout,
      authLoading,
      authError,
      signInWithGoogle,
      signOut,
      setActiveRole,
      setCurrentPath: changePath,
      createDocument,
      approveBudget,
      returnToCompliance,
      approveAccounting,
      processPayment,
      addNotification,
      clearNotifications,
      markNotificationRead,
      addAttachment,
      deleteDocument,
      updateUserProfile,
      globalSearchQuery,
      setGlobalSearchQuery,
      systemStatus,
      setSystemStatus
    }}>
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};

export const useAuth = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useAuth must be used within a WorkflowProvider');
  }
  return {
    user: context.user,
    loading: context.authLoading,
    error: context.authError,
    signInWithGoogle: context.signInWithGoogle,
    signOut: context.signOut,
    login: context.login,
    logout: context.logout
  };
};
