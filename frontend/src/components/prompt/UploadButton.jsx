import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowRight } from 'lucide-react';

const UploadButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/analyze')}
      className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl border border-zinc-700/60 bg-zinc-900/50 hover:border-violet-500/40 hover:bg-violet-500/10 text-zinc-300 hover:text-violet-200 transition-all duration-300 cursor-pointer"
    >
      <Upload className="w-5 h-5 text-violet-400 group-hover:text-violet-300 transition-colors" />
      <span className="text-sm font-medium">Analyze Your Architecture</span>
      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
    </button>
  );
};

export default UploadButton;
