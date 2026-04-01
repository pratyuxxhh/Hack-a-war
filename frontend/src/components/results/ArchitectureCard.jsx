import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ServiceBadge from './ServiceBadge';
import CostEstimate from './CostEstimate';
import ArchitectureDiagram from './ArchitectureDiagram';

const ArchitectureCard = ({ architecture, index = 0, isActive = false }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'services', label: 'Services' },
    { id: 'cost', label: 'Cost' },
    { id: 'diagram', label: 'Diagram' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        isActive
          ? 'border-violet-500/40 bg-zinc-900/80 shadow-lg shadow-violet-500/10'
          : 'border-zinc-800/60 bg-zinc-900/40 hover:border-zinc-700/60'
      }`}
    >
      {/* Header */}
      <div className="p-6 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl">{architecture.icon}</span>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-white leading-snug">{architecture.type}</h3>
              <p className="text-sm text-zinc-400 leading-snug">{architecture.tagline}</p>
            </div>
          </div>
          {isActive && (
            <span className="self-start px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/20">
              Recommended
            </span>
          )}
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed">{architecture.description}</p>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 pb-2">
        <div className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-xl bg-zinc-950/30 border border-zinc-800/60">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-violet-500/15 text-violet-200 border border-violet-500/25'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/30 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Services preview */}
              <div className="mb-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3 font-semibold">AWS Services Used</p>
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

              {/* Quick cost */}
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
                <span className="text-sm text-zinc-400">Est. Monthly Cost</span>
                <span className="text-lg font-bold text-white">${architecture.costEstimate.monthly.toLocaleString()}/mo</span>
              </div>

              {/* Explanation toggle */}
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="mt-4 flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
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
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-3 text-sm text-zinc-400 leading-relaxed p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
                      {architecture.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {architecture.services.map((service, i) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/20 hover:bg-zinc-800/40 transition-colors"
                >
                  <ServiceBadge service={service} index={i} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-500">{service.category}</p>
                    <p className="text-sm text-zinc-300 mt-0.5">{service.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'cost' && (
            <motion.div
              key="cost"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CostEstimate costEstimate={architecture.costEstimate} />
            </motion.div>
          )}

          {activeTab === 'diagram' && (
            <motion.div
              key="diagram"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
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
