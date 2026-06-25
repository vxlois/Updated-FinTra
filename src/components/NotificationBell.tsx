import React, { useState } from 'react';
import { useWorkflow } from '../hooks/useWorkflow';
import { Bell, Trash2, CheckCircle2, AlertTriangle, Info, Check } from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const { notifications, markNotificationRead, clearNotifications } = useWorkflow();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />;
    }
  };

  return (
    <div className="relative">
      {/* Trigger Bell */}
      <button 
        id="notification_bell_btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 transition rounded-lg hover:bg-slate-100"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 flex items-center justify-center bg-rose-600 text-white text-[10px] font-bold rounded-full border-2 border-white animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-24px)] bg-white border border-slate-200 rounded-xl shadow-xl z-50 divide-y divide-slate-100">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
              <span className="font-sans font-bold text-sm text-slate-800">Operational Reminders</span>
              {notifications.length > 0 && (
                <button 
                  onClick={() => { clearNotifications(); setIsOpen(false); }}
                  className="text-xs text-rose-600 hover:text-rose-800 transition flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear all
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-400 text-xs">
                  No active system updates
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-4 flex gap-3 text-left transition hover:bg-slate-50/30 ${!notif.read ? 'bg-indigo-50/25 border-l-2 border-indigo-600' : ''}`}
                  >
                    <div className="mt-0.5">{getIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-sans font-bold text-xs text-slate-800 truncate">{notif.title}</h4>
                        <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 break-words">{notif.message}</p>
                      
                      {!notif.read && (
                        <button 
                          onClick={() => markNotificationRead(notif.id)}
                          className="mt-2 text-[10px] text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Ack / Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-3 text-center bg-slate-50/20 rounded-b-xl border-t border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                System-Wide Broadcast Feed
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
