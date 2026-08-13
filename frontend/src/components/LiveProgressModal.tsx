import React, { useEffect, useState } from 'react';
import { scraperApi, ScrapeJob } from '../api/scraperApi';
import { Loader2, Square, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface LiveProgressModalProps {
  jobId: string;
  onClose: () => void;
  onViewResults: () => void;
}

export const LiveProgressModal: React.FC<LiveProgressModalProps> = ({ jobId, onClose, onViewResults }) => {
  const [job, setJob] = useState<ScrapeJob | null>(null);

  useEffect(() => {
    let interval: any;

    const fetchStatus = async () => {
      try {
        const res = await scraperApi.getStatus(jobId);
        if (res.success && res.data) {
          setJob(res.data);
          if (res.data.status === 'completed' || res.data.status === 'error' || res.data.status === 'stopped') {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 1500);

    return () => clearInterval(interval);
  }, [jobId]);

  const handleStop = async () => {
    try {
      await scraperApi.stopJob(jobId);
    } catch (e) {
      console.error(e);
    }
  };

  if (!job) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6 text-center text-white">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-400">Connecting to live scraper engine...</p>
        </div>
      </div>
    );
  }

  const isRunning = job.status === 'running' || job.status === 'started';
  const isCompleted = job.status === 'completed';
  const isStopped = job.status === 'stopped';
  const isError = job.status === 'error';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f172a] border border-gray-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isRunning ? 'bg-cyan-500/20 text-cyan-400' : isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {isRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : isCompleted ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{job.name}</h3>
              <p className="text-xs text-gray-400">Job ID: <span className="font-mono text-cyan-400">{job.jobId}</span></p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-gray-300">{job.statusMessage || 'Processing...'}</span>
            <span className="text-cyan-400 font-mono">{job.progress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden p-0.5 border border-gray-700">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        </div>

        {/* Scraped Stats Badge */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-900/80 border border-gray-800">
          <div>
            <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Leads Extracted</span>
            <div className="text-2xl font-extrabold text-white mt-1">{job.resultCount || 0}</div>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Status</span>
            <div className="mt-1">
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                isRunning ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-300'
              }`}>
                {job.status}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {isRunning && (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold transition cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Stop Job</span>
            </button>
          )}

          {!isRunning && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
          )}

          {job.resultCount && job.resultCount > 0 ? (
            <button
              onClick={onViewResults}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>View Scraped Data</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
