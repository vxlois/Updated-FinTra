import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useWorkflow } from '../hooks/useWorkflow';
import { NotificationBell } from '../components/NotificationBell';
import { AuditTrailLog } from '../components/AuditTrailLog';
import { DashboardPage } from '../pages/DashboardPage';
import { BudgetSectionPage } from '../pages/BudgetSectionPage';
import { AccountingSectionPage } from '../pages/AccountingSectionPage';
import { CashierSectionPage } from '../pages/CashierSectionPage';
import { ReportsPage } from '../pages/ReportsPage';
import { DostLogo } from '../components/DostLogo';
import { UserProfileModal } from '../components/UserProfileModal';
import { 
  LayoutDashboard, Receipt, BookOpen, 
  CreditCard, History, Menu, X, BarChart3, LogOut, PanelLeftClose, PanelLeft, Search
} from 'lucide-react';

export function ApplicationShell() {
  const { 
    currentPath, 
    setCurrentPath, 
    activeRole, 
    setActiveRole, 
    documents,
    user,
    logout,
    globalSearchQuery,
    setGlobalSearchQuery,
    systemStatus
  } = useWorkflow();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  // Calculate live desk queue indicators
  const budgetCount = documents.filter(d => d.currentSection === 'BUDGET').length;
  const acctgCount = documents.filter(d => d.currentSection === 'ACCOUNTING').length;
  const cashierCount = documents.filter(d => d.currentSection === 'CASHIER').length;

  // Gate app rendering on Google User Session
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render correct desk page - open system for all sections
  const renderActivePage = () => {
    switch (currentPath) {
      case 'budget':
        return <BudgetSectionPage />;
      case 'accounting':
        return <AccountingSectionPage />;
      case 'cashier':
        return <CashierSectionPage />;
      case 'reports':
        return <ReportsPage />;
      case 'audit':
        return (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-5 rounded-xl animate-fade-in shadow-xs">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">System Activity Log</h2>
              <p className="text-xs text-slate-400">View real-time, non-editable transaction audit points across all desks.</p>
            </div>
            <AuditTrailLog />
          </div>
        );
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  };

  const navGroups = [
    {
      title: 'General',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, count: 0, requiredRole: null },
      ]
    },
    {
      title: 'Financial Unit',
      items: [
        { id: 'budget', label: 'Budget Section', icon: Receipt, count: budgetCount, requiredRole: null },
        { id: 'accounting', label: 'Accounting Section', icon: BookOpen, count: acctgCount, requiredRole: null },
        { id: 'cashier', label: 'Cashier Section', icon: CreditCard, count: cashierCount, requiredRole: null },
      ]
    },
    {
      title: 'Analytics & Logs',
      items: [
        { id: 'reports', label: 'Reports', icon: BarChart3, count: 0, requiredRole: null },
        { id: 'audit', label: 'System Activity Log', icon: History, count: 0, requiredRole: null },
      ]
    }
  ];

  return (
    <div className="h-screen bg-tech-bg text-tech-text flex flex-row font-sans overflow-hidden">
      
      {/* Sidebar Nav (Desktop & mobile drawer as a pure overlay) */}
      <aside className={`
        fixed top-0 bottom-0 left-0 h-screen bg-gradient-to-b from-[#013c6e] via-[#025191] to-[#014073] text-white p-0 shrink-0 z-50 transition-all duration-300 flex flex-col justify-between border-r border-white/5 w-64
        ${(mobileMenuOpen || !sidebarHidden) ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}
      `}>
        <div className="flex flex-col h-full justify-between w-64">
          <div className="flex flex-col">
            
            {/* Desktop Technical Branding Header with Option to Hide */}
            <div className="px-4 py-5 flex items-center justify-between border-b border-white/10 shrink-0 select-none">
              <div className="flex items-center gap-2.5">
                <DostLogo className="w-10 h-10 shrink-0" />
                <div className="min-w-0">
                  <span className="font-sans font-extrabold tracking-tight text-lg text-white block leading-tight">FinTra</span>
                  <span className="font-inter text-[8px] font-bold text-white/75 tracking-wider block mt-0.5 leading-tight whitespace-nowrap">Finance and Administrative Services</span>
                </div>
              </div>
              
              {/* Button to collapse sidebar */}
              <button
                type="button"
                onClick={() => setSidebarHidden(true)}
                className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-150 cursor-pointer shrink-0 border border-transparent hover:border-white/10 focus:outline-none pl-0 -ml-[30px] -mt-[20px]"
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar Links */}
            <nav className="py-4 flex-1 space-y-4">
              {navGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-1">
                  <div className="px-6 py-1 text-[10px] uppercase tracking-widest text-white/40 font-bold font-sans">
                    {group.title}
                  </div>
                  
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isSelected = currentPath === item.id;
                      const isLocked = false;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setCurrentPath(item.id);
                            setMobileMenuOpen(false);
                            setSidebarHidden(true);
                          }}
                          className={`w-full px-6 py-2.5 flex items-center justify-between text-xs transition duration-150 select-none cursor-pointer ${
                            isSelected 
                              ? 'bg-white/10 border-l-4 border-white text-white font-bold' 
                              : 'text-white/60 hover:text-white hover:bg-white/5 hover:border-l-4 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 shrink-0 transition ${isLocked ? 'text-white/20' : 'text-white/60 group-hover:text-white'}`} />
                            <span className={isLocked ? 'text-white/35 font-medium italic' : undefined}>{item.label}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {item.count > 0 && (
                              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-md bg-tech-accent/20 text-blue-400 border border-tech-accent/30 animate-pulse">
                                {item.count}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

          </div>

          {/* Bottom identity panel aligned with theme with Sign Out option */}
          <div className="p-6 border-t border-white/10 shrink-0 bg-black/10">
            <div className="flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer hover:opacity-85 transition group focus:outline-none"
                title="View and Edit Profile"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-[10px] font-mono font-bold uppercase text-slate-300 shrink-0 group-hover:bg-slate-700 transition">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate leading-none group-hover:text-blue-200 transition">{user.name}</p>
                  <p className="text-[9px] text-white/40 font-mono tracking-wider truncate mt-1">{user.role}</p>
                </div>
              </button>
              <button
                type="button"
                onClick={logout}
                title="Sign out of FinTra Portal"
                className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/70 border border-white/10 hover:border-red-500/30 rounded-lg transition duration-150 cursor-pointer shrink-0 flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </aside>

      {/* Unified sidebar backdrop */}
      {(mobileMenuOpen || !sidebarHidden) && (
        <div 
          onClick={() => {
            setMobileMenuOpen(false);
            setSidebarHidden(true);
          }}
          className="fixed inset-0 bg-transparent z-45 cursor-pointer transition-all duration-200" 
        />
      )}

      {/* Right Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* 1. Header Navigation Bar (Clean Corporate Light Theme) */}
        <header className="sticky top-0 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 z-30 shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg lg:hidden text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop toggle button for showing / hiding the sidebar overlay */}
            <button
              onClick={() => setSidebarHidden(!sidebarHidden)}
              className="hidden lg:flex p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer border border-slate-200 shadow-2xs bg-slate-50 mr-2"
              title={sidebarHidden ? "Show Sidebar" : "Hide Sidebar"}
            >
              <PanelLeft className="w-4 h-4 text-slate-600" />
            </button>
            
            {/* Brand details shown on mobile header or when desktop sidebar is hidden */}
            <div className="flex items-center gap-2 select-none">
              <DostLogo className="w-8 h-8 shrink-0" />
              <div>
                <span 
                  className="font-sans font-extrabold tracking-tight block text-slate-800 leading-none"
                  style={{ fontSize: '20px', marginLeft: '0px', marginTop: '0px', marginRight: '0px', marginBottom: '-3px' }}
                >
                  FinTra
                </span>
              </div>
            </div>
          </div>

          {/* Right Section: System Status Badge, Functional Search Bar, and Notifications Bell */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            {/* Automatic System Status Badge */}
            <div className={`flex items-center gap-1.5 transition-all duration-200 py-1.5 px-3 border rounded-xl select-none text-[11px] font-sans font-normal shrink-0 ${
              systemStatus === 'online' ? 'text-emerald-700 bg-emerald-50/80 border-emerald-200' :
              systemStatus === 'syncing' ? 'text-amber-700 bg-amber-50/80 border-amber-200' :
              systemStatus === 'offline' ? 'text-rose-700 bg-rose-50/80 border-rose-200' :
              'text-blue-700 bg-blue-50/80 border-blue-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                systemStatus === 'online' ? 'bg-emerald-500 animate-pulse' :
                systemStatus === 'syncing' ? 'bg-amber-500 animate-bounce' :
                systemStatus === 'offline' ? 'bg-rose-500' :
                'bg-blue-500'
              }`}></span>
              <span className="capitalize">{systemStatus}</span>
            </div>

            {/* Functional Search Bar */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by ID, Supplier, Title..." 
                value={globalSearchQuery}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  if (currentPath !== 'dashboard') {
                    setCurrentPath('dashboard');
                  }
                }}
                className="w-40 sm:w-64 bg-slate-100 border border-slate-200/50 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-tech-accent text-slate-800 placeholder-slate-400 focus:outline-none transition-all focus:bg-white focus:border-slate-300 font-sans font-normal"
              />
            </div>

            {/* Notifications */}
            <NotificationBell />
          </div>
        </header>

        {/* Main Content Stage Viewport */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto overflow-x-hidden min-w-0">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActivePage()}
          </div>
        </main>

        <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      </div>
    </div>
  );
}
