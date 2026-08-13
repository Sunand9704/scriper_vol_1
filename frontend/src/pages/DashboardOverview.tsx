import React, { useEffect, useState } from 'react';
import { scraperApi, DashboardStats, ScrapeJob } from '../api/scraperApi';
import { Database, Phone, Globe, Play, Sparkles, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react';

interface DashboardOverviewProps {
  onNavigateToSearch: () => void;
  onNavigateToLeads: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigateToSearch, onNavigateToLeads }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<ScrapeJob[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, jRes] = await Promise.all([
        scraperApi.getStats(),
        scraperApi.getJobs()
      ]);
      if (sRes.success) setStats(sRes.data);
      if (jRes.success) setRecentJobs(jRes.data.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative rounded-3xl p-8 bg-gradient-to-r from-cyan-900/40 via-blue-950/40 to-slate-900 border border-cyan-500/20 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Playwright Powered Web Scraper</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            Scrape & Extract High-Value Business Data In Seconds
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            Extract verified business contacts, phone numbers, websites, ratings, and locations directly from Google Maps and JustDial into a structured dashboard.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={onNavigateToSearch}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch Scraper Task</span>
            </button>
            <button
              onClick={onNavigateToLeads}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-200 text-xs font-bold border border-gray-700 transition cursor-pointer"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Explore Scraped Leads</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Scraped Leads</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {loading ? '...' : stats?.totalLeads || 0}
          </div>
          <p className="text-xs text-gray-400 font-medium">Extracted records in store</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Numbers</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Phone className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {loading ? '...' : stats?.withPhoneCount || 0}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stats?.phonePercentage || 0}% Coverage Rate</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Websites Discovered</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {loading ? '...' : stats?.withWebsiteCount || 0}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stats?.websitePercentage || 0}% Coverage Rate</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed Jobs</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {loading ? '...' : stats?.completedJobs || 0}
          </div>
          <p className="text-xs text-gray-400 font-medium">Out of {stats?.totalJobs || 0} total missions</p>
        </div>
      </div>

      {/* Recent Missions Table */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Recent Scrape Missions</h2>
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-400 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {recentJobs.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            No scrape missions run yet. Click "Launch Scraper Task" to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Mission Name</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4 text-right">Extracted Leads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {recentJobs.map((j) => (
                  <tr key={j.jobId} className="hover:bg-gray-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-white">{j.name}</td>
                    <td className="py-3 px-4 text-gray-400 font-mono">{j.source}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                        j.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        j.status === 'running' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        'bg-gray-800 text-gray-400'
                      }`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-400">{j.progress}%</td>
                    <td className="py-3 px-4 text-right font-bold text-white">{j.resultCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
