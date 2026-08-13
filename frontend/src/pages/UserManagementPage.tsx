import React, { useState } from 'react';
import { User, userApi } from '../api/userApi';
import { UserCheck, Plus, ShieldCheck, Mail, User as UserIcon, RefreshCw, CheckCircle2 } from 'lucide-react';

interface UserManagementPageProps {
  usersList: User[];
  onUserCreated: () => void;
}

export const UserManagementPage: React.FC<UserManagementPageProps> = ({ usersList, onUserCreated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'EMPLOYEE'>('EMPLOYEE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please provide both name and email.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await userApi.createUser({
        name: name.trim(),
        email: email.trim(),
        role
      });

      if (res.success) {
        setSuccessMsg(`User "${name}" created successfully!`);
        setName('');
        setEmail('');
        onUserCreated();
      } else {
        setError('Failed to create user.');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-600 text-xs font-bold mb-2">
          <UserCheck className="w-3.5 h-3.5" />
          <span>User & Role Management</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Employee & Team Accounts</h1>
        <p className="text-xs text-slate-500">
          Create new sales representative accounts and manage roles across your team.
        </p>
      </div>

      {/* Create User Form */}
      <form onSubmit={handleCreateUser} className="glass-panel p-6 rounded-3xl space-y-5 shadow-2xl">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-cyan-600" />
          <span>Add New Employee / Team Member</span>
        </h2>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-500 transition"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Email Address *</label>
            <input
              type="email"
              placeholder="e.g. alex@scriper.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-500 transition"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Role</label>
            <select
              value={role}
              onChange={(e: any) => setRole(e.target.value)}
              className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
            >
              <option value="EMPLOYEE">👤 Employee (Sales Rep)</option>
              <option value="ADMIN">👑 Admin (Manager)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition cursor-pointer flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{loading ? 'Creating...' : 'Create Account'}</span>
        </button>
      </form>

      {/* Users List */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h2 className="text-base font-bold text-slate-900">Active System Accounts ({usersList.length})</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {usersList.map((u) => (
            <div key={u.userId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-xl object-cover border border-cyan-200" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{u.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">{u.email}</p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase ${
                u.role === 'ADMIN' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-cyan-50 text-cyan-600 border border-cyan-200'
              }`}>
                {u.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
