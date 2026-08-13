import React from 'react';
import { Property } from '../../api/propertyApi';
import { MapPin, Phone, User, Eye, Trash2, Home, Sparkles } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
  onDelete: (id: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onViewDetails, onDelete }) => {
  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'PG':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Hostel':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Dormitory':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Bachelor Room':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  const formattedRent = property.rent ? `₹${property.rent.toLocaleString()}` : 'Price on Call';

  return (
    <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between hover:border-cyan-500/40 transition group">
      {/* Image & Category Overlay */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-900">
        <img
          src={property.imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-black/40" />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold border backdrop-blur-md ${getCategoryBadgeClass(property.category)}`}>
            {property.category}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-gray-200 backdrop-blur-md">
            {property.stayType || 'Long Stay'}
          </span>
        </div>

        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-2xl bg-cyan-500/90 text-white text-sm font-extrabold shadow-lg backdrop-blur-md">
          {formattedRent} <span className="text-[10px] font-medium opacity-90">{property.stayType === 'Short Stay' ? '/ day' : '/ month'}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="text-base font-extrabold text-white group-hover:text-cyan-400 transition leading-snug line-clamp-1">
            {property.name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{property.place}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-300 pt-1">
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-gray-400" />
              {property.ownerName}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-cyan-400">
              <Phone className="w-3.5 h-3.5" />
              {property.ownerMobile}
            </span>
          </div>
        </div>

        {/* Amenities Pills */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-800/80">
            {property.amenities.slice(0, 4).map((amenity, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-gray-900/90 border border-gray-800 text-[10px] font-semibold text-gray-400">
                {amenity}
              </span>
            ))}
            {property.amenities.length > 4 && (
              <span className="px-2 py-0.5 rounded-md bg-gray-900/90 border border-gray-800 text-[10px] font-bold text-cyan-400">
                +{property.amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 flex items-center justify-between border-t border-gray-800">
          <button
            onClick={() => onDelete(property._id)}
            className="p-2 rounded-xl bg-gray-800/60 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition cursor-pointer"
            title="Delete Property"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onViewDetails(property)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30 transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Full Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
