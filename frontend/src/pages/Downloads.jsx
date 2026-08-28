import React, { useState, useEffect } from 'react';
import { Download, FileText, Subtitles, CheckCircle2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { downloadFile, formatDuration } from '../utils/formatters';

const Downloads = () => {
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('activeStudioProject');
      if (saved) {
        setActiveProject(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse active project', e);
    }
  }, []);

  const formatTimeSrt = (seconds) => {
    const date = new Date(seconds * 1000);
    const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mm = String(date.getUTCMinutes()).padStart(2, '0');
    const ss = String(date.getUTCSeconds()).padStart(2, '0');
    const ms = String(date.getUTCMilliseconds()).padStart(3, '0');
    return `${hh}:${mm}:${ss},${ms}`;
  };

  const handleDownloadSrt = () => {
    if (!activeProject || !activeProject.transcript) {
      return toast.error("No active project transcript found. Process a video in Text Studio first.");
    }
    const srtContent = activeProject.transcript.map((seg, idx) => {
      return `${idx + 1}\n${formatTimeSrt(seg.start)} --> ${formatTimeSrt(seg.end)}\n${seg.text}\n`;
    }).join('\n');
    downloadFile(srtContent, `${activeProject.originalFileName || 'project'}.srt`, 'text/plain');
    toast.success("SRT downloaded!");
  };

  const handleDownloadTxt = () => {
    if (!activeProject || !activeProject.fullText) {
      return toast.error("No active project text found. Process a video in Text Studio first.");
    }
    downloadFile(activeProject.fullText, `${activeProject.originalFileName || 'project'}.txt`, 'text/plain');
    toast.success("TXT downloaded!");
  };

  const handleDownloadJson = () => {
    if (!activeProject) {
      return toast.error("No active project found. Process a video in Text Studio first.");
    }
    downloadFile(JSON.stringify(activeProject, null, 2), `${activeProject.originalFileName || 'project'}_analytics.json`, 'application/json');
    toast.success("JSON downloaded!");
  };

  const exportItems = [
    {
      title: 'Subtitles & Captions',
      format: '.SRT / .VTT',
      description: 'Standard timed subtitle file for YouTube Studio upload.',
      actionText: 'Export SRT File',
      onDownload: handleDownloadSrt
    },
    {
      title: 'Full Video Transcript',
      format: '.TXT / .JSON',
      description: 'Clean formatted raw text transcript for blog post repurposing.',
      actionText: 'Export Text File',
      onDownload: handleDownloadTxt
    },
    {
      title: 'Extractive NLP Analytics Report',
      format: '.JSON',
      description: 'Structured sentiment scores, WPM pacing, and extracted keywords.',
      actionText: 'Export JSON Analytics',
      onDownload: handleDownloadJson
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Download & Export Center</h1>
        <p className="text-slate-400 text-sm mt-1">Export transcripts, SRT captions, and structured metadata JSON files.</p>
      </div>

      {!activeProject && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-300 text-sm flex items-center gap-2">
          <span>ℹ️</span>
          <span>No active project found. Process a video or script in Text Studio first to enable downloads.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exportItems.map((item) => (
          <div key={item.title} className={`glass-panel p-6 rounded-2xl border ${activeProject ? 'border-slate-800' : 'border-slate-800/50 opacity-60'} space-y-4 flex flex-col justify-between`}>
            <div className="space-y-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-brand-400 border border-slate-700">
                {item.format}
              </span>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
            </div>
            <button
              onClick={item.onDownload}
              disabled={!activeProject}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-2"
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
