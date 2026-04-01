import React from 'react';
import { motion } from 'framer-motion';

const categoryColors = {
  Ingestion: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  Processing: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  Compute: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  Storage: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  Analytics: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  Visualization: 'bg-pink-500/15 text-pink-300 border-pink-500/20',
  Monitoring: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  Streaming: 'bg-orange-500/15 text-orange-300 border-orange-500/20',
  Events: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
  Notifications: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
  API: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
  'Data Warehouse': 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  'Search & Analytics': 'bg-teal-500/15 text-teal-300 border-teal-500/20',
  Orchestration: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  Caching: 'bg-sky-500/15 text-sky-300 border-sky-500/20',
  Security: 'bg-red-500/15 text-red-300 border-red-500/20',
  DNS: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  Networking: 'bg-slate-500/15 text-slate-300 border-slate-500/20',
};

const ServiceBadge = ({ service, index = 0 }) => {
  const colorClass = categoryColors[service.category] || 'bg-zinc-500/15 text-zinc-300 border-zinc-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="group relative"
    >
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${colorClass} transition-all duration-200 hover:scale-105 cursor-default`}>
        <span>{service.name}</span>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-xl">
        <div className="font-semibold text-white mb-0.5">{service.name}</div>
        <div className="text-zinc-400">{service.description}</div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-zinc-800 border-r border-b border-zinc-700 rotate-45" />
      </div>
    </motion.div>
  );
};

export default ServiceBadge;
