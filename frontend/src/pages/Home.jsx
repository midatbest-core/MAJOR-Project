import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Subtitles, Sparkles, ArrowRight, ShieldCheck, Zap, DollarSign } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Text Studio',
      stage: 'Create & Analyze',
      description: 'Upload video, audio, or scripts for zero-cost local Whisper transcription and spaCy deterministic NLP profiling.',
      icon: FileText,
      path: '/text-studio',
      color: 'from-blue-500/20 to-indigo-500/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      badge: 'Module 1'
    },
    {
      title: 'Caption Studio',
      stage: 'Optimize',
      description: 'Customize subtitle typography, adjust timings, split/merge segments, and preview live burned-in subtitles.',
      icon: Subtitles,
      path: '/caption-studio',
      color: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
      badge: 'Module 2'
    },
    {
      title: 'Creator Intelligence',
      stage: 'Publish & Strategy',
      description: 'Analyze successful YouTube competitors, extract comment sentiment & trending topics, and get AI blueprints.',
      icon: Sparkles,
      path: '/creator-intelligence',
      color: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400',
      badge: 'Module 3'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-10 border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Cost-Optimized Architecture (0 API Overhead)</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            AI Creator <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            Analyze videos, generate transcripts with local Whisper, run deterministic spaCy NLP, customize subtitles, and uncover YouTube competitor insights.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/text-studio')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/30 transition flex items-center gap-2"
            >
              <span>Start New Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/creator-intelligence')}
              className="px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-sm border border-slate-700 transition"
            >
              Analyze Competitor Video
            </button>
          </div>
        </div>
      </div>

      {/* Core Workflow Modules */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Core Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                onClick={() => navigate(mod.path)}
                className={`glass-card p-6 rounded-2xl cursor-pointer border ${mod.borderColor} bg-gradient-to-b ${mod.color} space-y-4 relative group`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-slate-900/80 border border-slate-800 ${mod.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-300 border border-slate-700">
                    {mod.badge}
                  </span>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">{mod.stage}</span>
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-300 transition">{mod.title}</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{mod.description}</p>
                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-brand-400 group-hover:translate-x-1 transition-transform">
                  <span>Open Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Budget-Friendly</h4>
            <p className="text-slate-400 text-xs mt-1">Open-source NLP, Whisper, and FFmpeg execute locally to eliminate cloud fees.</p>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Transient Storage</h4>
            <p className="text-slate-400 text-xs mt-1">Video files are automatically purged after processing to keep storage lightweight.</p>
          </div>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Targeted Generative AI</h4>
            <p className="text-slate-400 text-xs mt-1">LLMs are used only for creative title, description, and hook generation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
