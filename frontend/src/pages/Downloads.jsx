import React from 'react';
import { Download, FileText, Subtitles, CheckCircle2, ShieldAlert } from 'lucide-react';

const Downloads = () => {
  const exportItems = [
    {
      title: 'Subtitles & Captions',
      format: '.SRT / .VTT',
      description: 'Standard timed subtitle file for YouTube Studio upload.',
      actionText: 'Export SRT File'
    },
    {
      title: 'Full Video Transcript',
      format: '.TXT / .JSON',
      description: 'Clean formatted raw text transcript for blog post repurposing.',
      actionText: 'Export Text File'
    },
    {
      title: 'Extractive NLP Analytics Report',
      format: '.JSON',
      description: 'Structured sentiment scores, WPM pacing, and extracted keywords.',
      actionText: 'Export JSON Analytics'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Download & Export Center</h1>
        <p className="text-slate-400 text-sm mt-1">Export transcripts, SRT captions, and structured metadata JSON files.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exportItems.map((item) => (
          <div key={item.title} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-brand-400 border border-slate-700">
                {item.format}
              </span>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
            </div>
            <button
              onClick={() => alert(`Exporting ${item.title}...`)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{item.actionText}</span>
            </button>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-slate-200">Automatic Cleanup Notice</p>
          <p className="text-slate-400 leading-relaxed">
            All original video files (`.mp4`, `.mov`) and extracted audio (`.wav`) are automatically deleted from server memory after processing to ensure zero persistent storage overhead.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Downloads;
