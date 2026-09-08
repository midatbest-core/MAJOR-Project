import React from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const stages = [
    { id: 1, name: 'Create', path: '/text-studio', stepDesc: 'Ingest & Transcribe' },
    { id: 2, name: 'Analyze', path: '/text-studio', stepDesc: 'Deterministic NLP' },
    { id: 3, name: 'Optimize', path: '/caption-studio', stepDesc: 'Subtitles & AI Meta' },
    { id: 4, name: 'Publish', path: '/creator-intelligence', stepDesc: 'YouTube Intelligence' },
  ];

  // Map route path to active stage index
  const getActiveStageIndex = () => {
    switch (location.pathname) {
      case '/text-studio': return 1;
      case '/caption-studio': return 3;
      case '/creator-intelligence': return 4;
      default: return 0;
    }
  };

  const activeStage = getActiveStageIndex();

  return (
    <header className="h-16 glass-panel border-b border-slate-800/60 sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* 4-Stage Workflow Tracker */}
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mr-2">Workflow:</span>
        <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80">
          {stages.map((stage, idx) => {
            const isCurrent = activeStage === stage.id;
            const isCompleted = activeStage > stage.id;
            return (
              <React.Fragment key={stage.id}>
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    isCurrent
                      ? 'bg-brand-600/90 text-white shadow-sm'
                      : isCompleted
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      : 'text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]">
                      {stage.id}
                    </span>
                  )}
                  <span>{stage.name}</span>
                </div>
                {idx < stages.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* System Status Pill */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/50 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-slate-300 font-medium">Local Engine Ready</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
