import React, { useState } from 'react';
import { Send, Sparkles, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import UploadButton from './UploadButton';

const examplePrompts = [
  "Build a real-time analytics platform for 1M events/day",
  "E-commerce platform handling 10M users with global CDN",
  "IoT data pipeline with real-time processing and ML inference",
  "Serverless REST API with auth, caching, and CI/CD",
  "Video streaming platform with transcoding and CDN delivery",
  "Multi-tenant SaaS application with tenant isolation",
];

const PromptInput = ({ onSubmit }) => {
  const [prompt, setPrompt] = useState('');
  const [users, setUsers] = useState('');
  const [budget, setBudget] = useState('');
  const [features, setFeatures] = useState([
    'real-time collaboration',
    'user authentication',
    'project file storage',
  ]);
  const maxChars = 1000;
  const featureOptions = [
    'real-time collaboration',
    'user authentication',
    'project file storage',
    'code compilation in the background',
    'analytics dashboard',
    'api integration',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim().length === 0) return;
    if (onSubmit) {
      onSubmit({
        prompt: prompt.trim(),
        idea: prompt.trim(),
        users: users ? Number(users) : null,
        budget: budget.trim(),
        features,
      });
    }
  };

  const handleExampleClick = (example) => {
    setPrompt(example);
    setUsers('100000');
    setBudget('$3000/mo');
  };

  const handleFeatureChange = (feature) => {
    setFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  return (
    <section
      id="prompt-section"
      className="relative min-h-screen flex items-center justify-center px-4 py-20"
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true }}
        className="relative z-10 w-full max-w-3xl mx-auto"
      >
        {/* Section header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Describe your idea, we'll architect it</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            What do you want to <span className="gradient-text">build?</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Enter your business requirement and our AI will generate multiple AWS architecture options optimized for your needs.
          </p>
        </div>

        {/* Prompt form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="glass-strong rounded-2xl p-1.5 transition-all duration-300 hover:border-violet-500/30 focus-within:border-violet-500/40 focus-within:shadow-lg focus-within:shadow-violet-500/10">
            <textarea
              id="architecture-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, maxChars))}
              placeholder="e.g., Build a real-time analytics platform that processes 1 million events per day with dashboards and alerts..."
              rows={4}
              className="w-full bg-transparent text-white placeholder-zinc-500 text-lg p-5 pb-2 resize-none focus:outline-none leading-relaxed"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-5 pb-2">
              <input
                type="number"
                min="1"
                value={users}
                onChange={(e) => setUsers(e.target.value)}
                placeholder="Expected users (e.g. 100000)"
                className="w-full rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500/60"
              />
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Monthly budget (optional)"
                className="w-full rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500/60"
              />
            </div>

            <div className="px-5 pb-3">
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">Key features</p>
              <div className="flex flex-wrap gap-2">
                {featureOptions.map((feature) => {
                  const selected = features.includes(feature);
                  return (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => handleFeatureChange(feature)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-violet-500/20 border-violet-500/40 text-violet-200'
                          : 'bg-zinc-900/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      {feature}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom bar inside textarea box */}
            <div className="flex items-center justify-between px-5 py-3">
              <span className={`text-xs font-mono ${prompt.length > maxChars * 0.9 ? 'text-red-400' : 'text-zinc-500'}`}>
                {prompt.length}/{maxChars}
              </span>
              <button
                type="submit"
                disabled={prompt.trim().length === 0 || !users}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 disabled:from-zinc-700 disabled:to-zinc-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25 disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Generate Architecture
              </button>
            </div>
          </div>
        </form>

        {/* Example prompts */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4 text-zinc-500 text-sm">
            <Lightbulb className="w-4 h-4" />
            <span>Try an example</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                onClick={() => handleExampleClick(example)}
                className="px-4 py-2 rounded-xl text-sm text-zinc-300 bg-zinc-800/50 border border-zinc-700/50 hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-200 transition-all duration-200 cursor-pointer"
              >
                {example}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Upload existing architecture button */}
        <div className="mt-8 flex justify-center">
          <UploadButton />
        </div>
      </motion.div>
    </section>
  );
};

export default PromptInput;
