import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, MessageSquare } from 'lucide-react';
import ArchitectureCard from '../components/results/ArchitectureCard';

const archFilters = [
  { id: 'cost-optimized', label: '💰 Cost-Optimized', short: '💰 Cost' },
  { id: 'balanced', label: '⚖️ Balanced', short: '⚖️ Balanced' },
  { id: 'scalable', label: '📈 Scalable', short: '📈 Scale' },
];

const ResultsPage = ({ results, onRefine }) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('balanced');

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">No results yet. Generate an architecture first.</p>
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
  const otherArchs = results.architectures.filter((a) => a.id !== activeFilter);

  return (
    <div className="min-h-screen bg-bg-dark py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center gap-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 w-full max-w-4xl"
        >
          {/* Back button */}
          <div className="flex items-center justify-between gap-4 mb-10">
            <button
              onClick={() => onRefine ? onRefine() : navigate('/')}
              className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-violet-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to prompt
            </button>
          </div>

          {/* Page title */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-6">
              <span>Architecture Results</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              Your Architecture <span className="gradient-text">Options</span>
            </h1>
          </div>

          {/* Requirement box */}
          <div className="mt-8">
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/60">
              <MessageSquare className="w-5 h-5 text-violet-400 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-semibold">Your Requirement</p>
                <p className="text-zinc-200 text-sm leading-relaxed break-words">{results.prompt}</p>
              </div>
            </div>
          </div>

          {/* Architecture type selector */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {archFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeFilter === filter.id
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-700/50'
                }`}
              >
                <span className="hidden sm:inline">{filter.label}</span>
                <span className="sm:hidden">{filter.short}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main active architecture */}
        {activeArch && (
          <div className="w-full max-w-4xl">
            <ArchitectureCard
              architecture={activeArch}
              isActive={true}
              index={0}
            />
          </div>
        )}

        {/* Other architectures */}
        {otherArchs.length > 0 && (
          <div className="w-full max-w-5xl">
            <h2 className="text-lg font-semibold text-zinc-300 mb-6 text-center">Other Options</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {otherArchs.map((arch, i) => (
                <ArchitectureCard
                  key={arch.id}
                  architecture={arch}
                  isActive={false}
                  index={i + 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Refine CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center w-full max-w-4xl"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/40">
            <p className="text-zinc-400 text-sm">Need something different?</p>
            <button
              onClick={() => onRefine ? onRefine() : navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Refine Requirements
            </button>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
