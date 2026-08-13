import React from 'react';
import { ScrapedLead } from '../api/scraperApi';
import { X, Building2, Phone, Mail, Globe, MapPin, Star, Tag, Calendar, ShieldCheck } from 'lucide-react';

interface LeadDetailModalProps {
  lead: ScrapedLead;
  onClose: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f172a] border border-gray-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-6 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 pr-10">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{lead.businessName}</h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">
                {lead.source}
              </span>
              <span>•</span>
              <span>{lead.category || 'General Business'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Phone Number</span>
            </div>
            <p className="text-sm font-mono text-white font-medium">{lead.phone || 'Not Available'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Email Address</span>
            </div>
            <p className="text-sm font-mono text-white font-medium">{lead.email || 'Not Extracted'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Website</span>
            </div>
            {lead.website ? (
              <a
                href={lead.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 hover:underline truncate block font-mono"
              >
                {lead.website}
              </a>
            ) : (
              <p className="text-sm text-gray-500 font-medium">No Website Listed</p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Rating & Reviews</span>
            </div>
            <p className="text-sm text-white font-medium">
              {lead.rating ? `${lead.rating} ★ (${lead.reviewsCount || 0} reviews)` : 'No Ratings'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Address / Location</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{lead.address || lead.city || 'Location unavailable'}</p>
        </div>

        <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
          <span>Scraped Date: {lead.scrapedAt ? new Date(lead.scrapedAt).toLocaleString() : 'Recent'}</span>
          <span>Job ID: {lead.jobId}</span>
        </div>
      </div>
    </div>
  );
};
