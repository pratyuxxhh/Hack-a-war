import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const maxChars = 1000;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim().length === 0) return;
    if (onSubmit) {
      onSubmit(prompt.trim());
    }
  };

  const handleExampleClick = (example) => {
    setPrompt(example);
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
              rows={5}
              className="w-full bg-transparent text-white placeholder-zinc-500 text-lg p-5 pb-2 resize-none focus:outline-none leading-relaxed"
            />

            {/* Bottom bar inside textarea box */}
            <div className="flex items-center justify-between px-5 py-3">
              <span className={`text-xs font-mono ${prompt.length > maxChars * 0.9 ? 'text-red-400' : 'text-zinc-500'}`}>
                {prompt.length}/{maxChars}
              </span>
              <button
                type="submit"
                disabled={prompt.trim().length === 0}
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
