import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, ArrowLeft, FileText, AlertTriangle, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';

const dummyAnalysis = {
  score: 72,
  findings: [
    {
      type: 'warning',
      title: 'Over-engineered for current scale',
      description: 'Using Amazon MSK (Kafka) for 10K events/day is overkill. Consider Amazon Kinesis Data Streams or even SQS for this throughput.',
      impact: 'High',
      savings: '$650/mo',
    },
    {
      type: 'error',
      title: 'No caching layer detected',
      description: 'API responses hit the database directly. Adding ElastiCache or DAX could reduce latency by 80% and database costs by 40%.',
      impact: 'Medium',
      savings: '$200/mo',
    },
    {
      type: 'success',
      title: 'Good use of serverless compute',
      description: 'Lambda functions for event processing is cost-effective at your scale. This is well-architected.',
      impact: 'Positive',
      savings: null,
    },
    {
      type: 'warning',
      title: 'Single-AZ database deployment',
      description: 'Your RDS instance is in a single availability zone. For production workloads, enable Multi-AZ for high availability.',
      impact: 'High',
      savings: null,
    },
    {
      type: 'info',
      title: 'Consider Reserved Instances',
      description: 'Your EC2 and RDS instances have been running for 6+ months. Switching to 1-year reserved instances could save 30-40%.',
      impact: 'Medium',
      savings: '$380/mo',
    },
  ],
};

const typeStyles = {
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  info: { icon: Lightbulb, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
};

const AnalyzePage = () => {
  const navigate = useNavigate();
  const [designText, setDesignText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!designText.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysis(dummyAnalysis);
      setIsAnalyzing(false);
    }, 3000);
  };

  const totalSavings = analysis
    ? analysis.findings
        .filter((f) => f.savings)
        .reduce((sum, f) => sum + parseInt(f.savings.replace(/[^0-9]/g, '')), 0)
    : 0;

  return (
    <div className="min-h-screen bg-bg-dark pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-violet-300 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-6">
              <FileText className="w-4 h-4" />
              <span>Architecture Analysis</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Analyze Your <span className="gradient-text">Architecture</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Paste your existing architecture design and get AI-powered feedback on cost inefficiencies, over-engineering, and improvement suggestions.
            </p>
          </div>
        </motion.div>

        {/* Input Section */}
        {!analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="glass-strong rounded-2xl p-1.5 mb-4">
              <textarea
                id="analyze-input"
                value={designText}
                onChange={(e) => setDesignText(e.target.value)}
                placeholder={`Describe your current architecture, e.g.:\n\n- API Gateway → Lambda → DynamoDB\n- S3 for static assets with CloudFront CDN\n- MSK cluster for event streaming (10K events/day)\n- RDS PostgreSQL (single-AZ) for user data\n- EC2 instances for background processing`}
                rows={10}
                className="w-full bg-transparent text-white placeholder-zinc-500 text-base p-5 resize-none focus:outline-none leading-relaxed font-mono"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={!designText.trim() || isAnalyzing}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 disabled:from-zinc-700 disabled:to-zinc-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Analyze Architecture
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Results Section */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Score Card */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 glass-strong rounded-2xl p-6 text-center">
                <p className="text-zinc-400 text-sm mb-2">Architecture Score</p>
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-2">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 108 108">
                    <circle cx="54" cy="54" r="48" stroke="rgba(63,63,70,0.5)" strokeWidth="8" fill="none" />
                    <circle
                      cx="54" cy="54" r="48"
                      stroke={analysis.score >= 80 ? '#10B981' : analysis.score >= 60 ? '#F59E0B' : '#EF4444'}
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(analysis.score / 100) * 301.6} 301.6`}
                    />
                  </svg>
                  <span className="absolute text-2xl font-bold text-white">{analysis.score}</span>
                </div>
                <p className="text-zinc-500 text-xs">out of 100</p>
              </div>

              <div className="flex-1 glass-strong rounded-2xl p-6 text-center">
                <p className="text-zinc-400 text-sm mb-2">Potential Savings</p>
                <p className="text-3xl font-bold text-emerald-400">${totalSavings.toLocaleString()}</p>
                <p className="text-zinc-500 text-xs mt-1">per month</p>
              </div>

              <div className="flex-1 glass-strong rounded-2xl p-6 text-center">
                <p className="text-zinc-400 text-sm mb-2">Issues Found</p>
                <p className="text-3xl font-bold text-white">{analysis.findings.length}</p>
                <p className="text-zinc-500 text-xs mt-1">recommendations</p>
              </div>
            </div>

            {/* Findings */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Findings & Recommendations</h2>
              {analysis.findings.map((finding, index) => {
                const style = typeStyles[finding.type];
                const Icon = style.icon;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`p-4 rounded-xl ${style.bg} border ${style.border}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 ${style.color} mt-0.5 flex-shrink-0`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-white font-medium text-sm">{finding.title}</h3>
                          <div className="flex items-center gap-2">
                            {finding.savings && (
                              <span className="text-xs font-semibold text-emerald-400">
                                Save {finding.savings}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${style.bg} ${style.color}`}>
                              {finding.impact}
                            </span>
                          </div>
                        </div>
                        <p className="text-zinc-400 text-sm">{finding.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <button
                onClick={() => { setAnalysis(null); setDesignText(''); }}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors cursor-pointer"
              >
                Analyze Another
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors cursor-pointer"
              >
                Generate Optimized Architecture
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnalyzePage;
