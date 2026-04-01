import React from 'react';
import { motion } from 'framer-motion';

const tierColors = {
  Low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', bar: 'bg-emerald-500' },
  Medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', bar: 'bg-amber-500' },
  High: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', bar: 'bg-red-500' },
};

const CostEstimate = ({ costEstimate }) => {
  const { monthly, breakdown, tier } = costEstimate;
  const colors = tierColors[tier] || tierColors.Medium;
  const maxCost = Math.max(...breakdown.map((b) => b.cost));

  return (
    <div className="space-y-4">
      {/* Total cost header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-400 text-sm">Estimated Monthly Cost</p>
          <p className="text-2xl font-bold text-white">
            ${monthly.toLocaleString()}
            <span className="text-sm font-normal text-zinc-500">/mo</span>
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
          {tier} Cost
        </span>
      </div>

      {/* Breakdown */}
      <div className="space-y-2.5">
        {breakdown.map((item, index) => (
          <motion.div
            key={item.service}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group"
          >
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-zinc-300 group-hover:text-white transition-colors">
                {item.service}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-xs hidden sm:inline">{item.detail}</span>
                <span className="text-white font-medium">${item.cost}</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${colors.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${(item.cost / maxCost) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.05, ease: 'easeOut' }}
                style={{ opacity: 0.7 + (item.cost / maxCost) * 0.3 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CostEstimate;
