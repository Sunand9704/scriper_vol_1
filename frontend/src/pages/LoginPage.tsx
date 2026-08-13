import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Database, Lock, Mail, User as UserIcon, ShieldCheck, Sparkles, Loader2, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'EMPLOYEE'>('EMPLOYEE');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          setError('Please enter your name.');
          setLoading(false);
          return;
        }
        const res = await register(name.trim(), email.trim(), password, role);
        if (!res.success) setError(res.error || 'Registration failed.');
      } else {
        const res = await login(email.trim(), password);
        if (!res.success) setError(res.error || 'Invalid credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);

    const res = await login(demoEmail, demoPass);
    if (!res.success) setError(res.error || 'Demo login failed.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/25 border border-cyan-400/30">
            <Database className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Scriper Data Engine</h1>
          <p className="text-xs text-gray-400">Role-Based Web Scraping & Lead Management Portal</p>
        </div>

        {/* Glass Card */}
        <div className="glass-panel p-8 rounded-3xl border border-gray-800 shadow-2xl space-y-6">
          {/* Tab Switcher */}
          <div className="flex p-1 rounded-xl bg-gray-900/90 border border-gray-800">
            <button
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                !isRegister ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                isRegister ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Register Account
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/90 border border-gray-800 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Email Address *</span>
              </label>
              <input
                type="email"
                placeholder="e.g. user@scriper.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-900/90 border border-gray-800 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Password *</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-900/90 border border-gray-800 text-xs text-white focus:outline-none focus:border-cyan-500 transition font-mono"
                required
              />
            </div>

            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Select Account Role</span>
                </label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/90 border border-gray-800 text-xs text-white focus:outline-none focus:border-cyan-500 transition cursor-pointer"
                >
                  <option value="EMPLOYEE">👤 Employee (Sales Rep)</option>
                  <option value="ADMIN">👑 Admin (Manager)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-xl shadow-cyan-500/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>{isRegister ? 'Create Account & Access' : 'Sign In to Account'}</span>
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="pt-4 border-t border-gray-800 space-y-2 text-center">
            <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Quick Demo Login Presets</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@scriper.com', 'admin123')}
                className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[11px] font-bold transition cursor-pointer"
              >
                👑 Demo Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('john@scriper.com', 'employee123')}
                className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-[11px] font-bold transition cursor-pointer"
              >
                👤 Demo Employee John
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
