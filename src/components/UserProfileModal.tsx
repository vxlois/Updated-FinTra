import React, { useState, useEffect } from 'react';
import { useWorkflow } from '../hooks/useWorkflow';
import { X, User as UserIcon, Mail, Shield, Check } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useWorkflow();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    
    updateUserProfile({
      name: name.trim(),
      email: email.trim()
    });
    
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
        <div className="bg-[#151619] px-6 py-4 flex items-center justify-between border-b border-white/10 text-white">
          <div className="flex items-center gap-2.5">
            <UserIcon className="w-5 h-5 text-tech-accent" />
            <h3 className="font-bold text-sm tracking-wide">USER PROFILE & CREDENTIALS</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-white font-mono font-bold text-lg flex items-center justify-center uppercase shadow-md">
              {name ? name.charAt(0) : user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{user.name}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 mt-1">
                <Shield className="w-3 h-3" />
                {user.role}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="profile_name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  id="profile_name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-tech-accent focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="profile_email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  id="profile_email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-tech-accent focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Security Clearance / Role
              </label>
              <input
                type="text"
                value={user.role}
                disabled
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 cursor-not-allowed select-none"
              />
              <p className="text-[10px] text-slate-400 mt-1 italic">Role clearance is managed strictly by System Administrators.</p>
            </div>
          </div>

          <div className="pt-2 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saved}
              className={`px-5 py-2.5 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer ${
                saved 
                  ? 'bg-green-600 text-white' 
                  : 'bg-tech-accent hover:bg-tech-accent-hover text-white'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" /> Updated
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
