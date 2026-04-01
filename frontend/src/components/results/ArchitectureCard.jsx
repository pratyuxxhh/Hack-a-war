import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import ServiceBadge from './ServiceBadge';
import CostEstimate from './CostEstimate';
import ArchitectureDiagram from './ArchitectureDiagram';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'services', label: 'Services' },
  { id: 'cost',     label: 'Cost'     },
  { id: 'diagram',  label: 'Diagram'  },
];

const ArchitectureCard = ({ architecture, index = 0, isActive = false }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.12 }}
      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
        isActive
          ? 'border-violet-500/35 bg-zinc-900/85 shadow-xl shadow-violet-500/8'
          : 'border-zinc-800/60 bg-zinc-900/50 hover:border-zinc-700/70 hover:bg-zinc-900/70'
      }`}
    >
      {/* ── Card Header ── */}
      <div className="p-6 sm:p-7">
        {/* Top row: icon + name + badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
              isActive ? 'bg-violet-500/15 ring-1 ring-violet-500/20' : 'bg-zinc-800/70'
            }`}>
              {architecture.icon}
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-white leading-tight">
                {architecture.type}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5 leading-snug">
                {architecture.tagline}
              </p>
            </div>
          </div>

          {isActive && (
            <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/25">
              <Sparkles className="w-3 h-3" />
              Recommended
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-zinc-300 text-sm leading-6 sm:leading-7">
          {architecture.description}
        </p>
      </div>

      {/* ── Divider ── */}
      <div className="mx-6 sm:mx-7 h-px bg-zinc-800/60" />

      {/* ── Tab Navigation ── */}
      <div className="px-6 sm:px-7 py-3">
        <div className="w-full grid grid-cols-4 gap-1 p-1 rounded-xl bg-zinc-950/60 border border-zinc-800/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium text-center transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-violet-600/90 text-white shadow-md shadow-violet-500/20'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-2">
        <AnimatePresence mode="wait">

          {/* Overview */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-5"
            >
              {/* Services preview */}
              <div>
                <p className="text-[11px] text-zinc-600 uppercase tracking-widest font-semibold mb-3">
                  AWS Services Used
                </p>
                <div className="flex flex-wrap gap-2">
                  {architecture.services.slice(0, 5).map((service, i) => (
                    <ServiceBadge key={service.name} service={service} index={i} />
                  ))}
                  {architecture.services.length > 5 && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs text-zinc-500 bg-zinc-800/50 border border-zinc-700/30">
                      +{architecture.services.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Monthly cost row */}
              <div className="flex items-center justify-between py-3.5 px-5 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
                <span className="text-sm text-zinc-400">Est. Monthly Cost</span>
                <span className="text-lg font-bold text-white">
                  ${architecture.costEstimate.monthly.toLocaleString()}/mo
                </span>
              </div>

              {/* Why this? */}
              <div>
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                >
                  {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Why this architecture?
                </button>
                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-sm text-zinc-400 leading-relaxed p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
                        {architecture.explanation}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Services */}
          {activeTab === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              {architecture.services.map((service, i) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18, delay: i * 0.04 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-zinc-800/25 hover:bg-zinc-800/50 border border-zinc-800/40 transition-colors"
                >
                  <ServiceBadge service={service} index={i} />
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-xs text-zinc-500 font-medium">{service.category}</p>
                    <p className="text-sm text-zinc-300 mt-0.5 leading-snug">{service.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Cost */}
          {activeTab === 'cost' && (
            <motion.div
              key="cost"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <CostEstimate costEstimate={architecture.costEstimate} />
            </motion.div>
          )}

          {/* Diagram */}
          {activeTab === 'diagram' && (
            <motion.div
              key="diagram"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <ArchitectureDiagram diagram={architecture.diagram} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ArchitectureCard;