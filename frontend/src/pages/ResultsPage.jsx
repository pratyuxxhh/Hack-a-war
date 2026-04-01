import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, MessageSquare, Sparkles } from 'lucide-react';
import ArchitectureCard from '../components/results/ArchitectureCard';

const archFilters = [
  { id: 'cost-optimized', label: '💰 Cost-Optimized', short: '💰 Cost' },
  { id: 'balanced',       label: '⚖️  Balanced',       short: '⚖️ Balanced' },
  { id: 'scalable',       label: '📈 Scalable',        short: '📈 Scale' },
];

const ResultsPage = ({ results, onRefine }) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('balanced');

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark">
        <div className="text-center space-y-4">
          <p className="text-zinc-400">No results yet. Generate an architecture first.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const activeArch = results.architectures.find((a) => a.id === activeFilter);
  const otherArchs  = results.architectures.filter((a) => a.id !== activeFilter);

  return (
    <div className="w-full min-h-screen bg-bg-dark">
      {/* Bulletproof centering wrapper */}
      <div
        className="max-w-5xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-10 sm:space-y-12"
        style={{ marginLeft: 'auto', marginRight: 'auto' }}
      >

        {/* ── Back button ── */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
        >
          <button
            onClick={() => onRefine ? onRefine() : navigate('/')}
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-violet-300 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to prompt
          </button>
        </motion.div>

        {/* ── Hero header (fully centered) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="flex flex-col items-center text-center gap-5"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Architecture Results
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
            Your Architecture{' '}
            <span className="gradient-text">Options</span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-xl leading-relaxed">
            We generated three tailored architectures based on your requirements. Pick the one that fits best.
          </p>
        </motion.div>

        {/* ── Requirement pill ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/70 backdrop-blur-sm"
        >
          <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-violet-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-zinc-600 uppercase tracking-widest font-semibold mb-1">Your Requirement</p>
            <p className="text-zinc-200 text-sm leading-relaxed break-words">{results.prompt}</p>
          </div>
        </motion.div>

        {/* ── Filter tabs (centered pill group) ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/70 shadow-inner">
            {archFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeFilter === filter.id
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <span className="hidden sm:inline">{filter.label}</span>
                <span className="sm:hidden">{filter.short}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Active (primary) architecture card ── */}
        {activeArch && (
          <ArchitectureCard
            architecture={activeArch}
            isActive={true}
            index={0}
          />
        )}

        {/* ── Divider + Other Options ── */}
        {otherArchs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-zinc-800/70" />
              <span className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest whitespace-nowrap">
                Other Options
              </span>
              <div className="flex-1 h-px bg-zinc-800/70" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {otherArchs.map((arch, i) => (
                <ArchitectureCard
                  key={arch.id}
                  architecture={arch}
                  isActive={false}
                  index={i + 1}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Refine CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.75 }}
          className="flex justify-center pt-2 pb-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 px-8 py-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 shadow-lg shadow-black/20">
            <p className="text-zinc-400 text-sm">Need something different?</p>
            <button
              onClick={() => onRefine ? onRefine() : navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 cursor-pointer shadow-lg shadow-violet-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              Refine Requirements
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default ResultsPage;