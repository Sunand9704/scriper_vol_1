import React from 'react';
import { User } from '../api/userApi';
import { LayoutDashboard, Search, Database, History, Users, UserCheck, Shield, CheckCircle2, Building2 } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser }) => {
  const isAdmin = currentUser.role === 'ADMIN';

  const adminMenuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'search', label: 'Launch Scraper', icon: Search },
    { id: 'leads', label: 'All Scraped Leads', icon: Database },
    { id: 'properties', label: 'Accommodation Properties', icon: Building2 },
    { id: 'team', label: 'Team Workload', icon: Users },
    { id: 'history', label: 'Jobs History', icon: History },
    { id: 'users', label: 'Manage Employees', icon: UserCheck },
  ] as const;

  const employeeMenuItems = [
    { id: 'workstation', label: 'My Assigned Leads', icon: CheckCircle2 },
    { id: 'properties', label: 'Accommodation Properties', icon: Building2 },
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  ] as const;

  const menuItems = isAdmin ? adminMenuItems : employeeMenuItems;

  return (
    <aside className="w-64 border-r border-gray-800 bg-[#0f172a]/60 backdrop-blur-xl flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="px-3 flex items-center justify-between text-[11px] font-bold tracking-wider text-gray-500 uppercase">
          <span>{isAdmin ? 'Admin Console' : 'Employee Workspace'}</span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
            isAdmin ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
          }`}>
            {currentUser.role}
          </span>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Role Based Control</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          {isAdmin
            ? 'Admins generate leads & assign them to sales representatives.'
            : 'Employees manage & convert their assigned business leads.'}
        </p>
      </div>
    </aside>
  );
};
