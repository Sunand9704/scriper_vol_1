import React, { useEffect, useState } from 'react';
import { scraperApi, ScrapeJob } from '../api/scraperApi';
import { History, Play, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ScrapeHistoryPageProps {
  onReRunJob: (job: ScrapeJob) => void;
}

export const ScrapeHistoryPage: React.FC<ScrapeHistoryPageProps> = ({ onReRunJob }) => {
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await scraperApi.getJobs();
      if (res.success) {
        setJobs(res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Scrape Mission History</h1>
          <p className="text-xs text-gray-400">
            Log of all executed web scraping tasks and results history.
          </p>
        </div>
        <button
          onClick={fetchJobs}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider bg-gray-900/50">
                <th className="py-3.5 px-4">Mission ID & Name</th>
                <th className="py-3.5 px-4">Source Provider</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Progress</th>
                <th className="py-3.5 px-4">Results Count</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Loading job history...
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No scrape jobs recorded yet.
                  </td>
                </tr>
              ) : (
                jobs.map((j) => (
                  <tr key={j.jobId} className="hover:bg-gray-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-white leading-tight">{j.name}</p>
                        <span className="text-[10px] font-mono text-cyan-400">{j.jobId}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20">
                        {j.source}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                        j.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        j.status === 'running' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        'bg-gray-800 text-gray-400'
                      }`}>
                        {j.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-cyan-400">
                      {j.progress}%
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white">
                      {j.resultCount || 0} leads
                    </td>

                    <td className="py-3.5 px-4 text-gray-400">
                      {j.createdAt ? new Date(j.createdAt).toLocaleString() : 'Recent'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onReRunJob(j)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold transition cursor-pointer ml-auto"
                      >
                        <Play className="w-3 h-3 fill-cyan-400" />
                        <span>Re-Run</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
