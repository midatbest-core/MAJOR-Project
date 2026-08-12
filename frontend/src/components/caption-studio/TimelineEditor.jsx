import React, { useState } from 'react';
import { ZoomIn, ZoomOut, AlertTriangle, Clock, Edit2 } from 'lucide-react';

/**
 * Interactive Subtitle Timeline Editor conforming to Chapter 7 Specs
 * Allows zooming, duration stretching/shrinking, inline text editing, and reading speed badges.
 */
const TimelineEditor = ({
  segments = [],
  activeSegIndex,
  onSelectSegment,
  onUpdateSegment,
  currentTime,
  onSeek,
  duration = 30
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const totalDuration = Math.max(duration, ...segments.map(s => s.end), 20);
  const pxPerSecond = 22 * zoomLevel;

  const getWpmInfo = (text, start, end) => {
    const wordCount = (text || '').trim().split(/\s+/).filter(Boolean).length;
    const durationSec = Math.max(0.5, end - start);
    const wpm = Math.round((wordCount / durationSec) * 60);

    if (wpm < 150) {
      return { label: 'Easy', wpm, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', badge: '🟢' };
    } else if (wpm <= 200) {
      return { label: 'Fast', wpm, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', badge: '🟡' };
    } else {
      return { label: 'Too Fast', wpm, color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', badge: '🔴' };
    }
  };

  const handleStartEdit = (seg) => {
    setEditingId(seg.id);
    setEditText(seg.text);
  };

  const handleSaveEdit = (id) => {
    onUpdateSegment(id, 'text', editText);
    setEditingId(null);
  };

  return (
    <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 backdrop-blur-md shadow-2xl flex flex-col gap-3">
      {/* Toolbar & Controls */}
      <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-200">Interactive Subtitle Timeline</span>
          <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-slate-500 border border-slate-800">
            {segments.length} Subtitles
          </span>
          <span className="text-[10px] text-slate-500 italic hidden sm:inline">
            (Double-click block to edit text • Drag edges to resize timing)
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
            <button
              onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))}
              className="text-slate-400 hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] w-8 text-center text-slate-300">
              {zoomLevel.toFixed(1)}x
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(5, zoomLevel + 0.5))}
              className="text-slate-400 hover:text-white"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Track Scroll Area */}
      <div className="overflow-x-auto relative bg-slate-900/60 rounded-xl border border-slate-800/80 p-3 min-h-[150px]">
        <div 
          className="relative min-h-[120px]"
          style={{ width: `${totalDuration * pxPerSecond}px` }}
        >
          {/* Time Ruler Ticks */}
          <div className="h-6 border-b border-slate-800 relative flex items-end font-mono text-[9px] text-slate-500 select-none">
            {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, sec) => (
              <div
                key={sec}
                className="absolute border-l border-slate-800 pl-1 pb-0.5"
                style={{ left: `${sec * pxPerSecond}px`, height: sec % 5 === 0 ? '100%' : '50%' }}
              >
                {sec % 5 === 0 ? `${sec}s` : ''}
              </div>
            ))}
          </div>

          {/* Current Time Scrubber Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none shadow-[0_0_10px_rgba(244,63,94,0.8)]"
            style={{ left: `${currentTime * pxPerSecond}px` }}
          >
            <div className="w-2.5 h-2.5 bg-rose-500 rounded-full -translate-x-[4px] -translate-y-1" />
          </div>

          {/* Subtitle Segment Blocks Track */}
          <div className="relative pt-3 pb-2">
            {segments.map((seg, idx) => {
              const left = seg.start * pxPerSecond;
              const width = Math.max(50, (seg.end - seg.start) * pxPerSecond);
              const isActive = idx === activeSegIndex;
              const wpmInfo = getWpmInfo(seg.text, seg.start, seg.end);
              const isEditing = editingId === seg.id;

              return (
                <div
                  key={seg.id || `timeline_seg_${idx}`}
                  onClick={() => onSelectSegment(idx)}
                  onDoubleClick={() => handleStartEdit(seg)}
                  className={`absolute rounded-xl border p-2 flex flex-col justify-between transition-all duration-150 shadow-md group ${
                    isActive 
                      ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/40 z-20' 
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 z-10'
                  }`}
                  style={{
                    left: `${left}px`,
                    width: `${width}px`,
                    height: '74px',
                    top: '28px'
                  }}
                >
                  {/* Segment Text or Inline Editor */}
                  {isEditing ? (
                    <input
                      type="text"
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => handleSaveEdit(seg.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(seg.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-slate-950 text-slate-100 text-[11px] px-1.5 py-0.5 rounded border border-indigo-500 focus:outline-none"
                    />
                  ) : (
                    <div className="text-[11px] font-medium text-slate-200 truncate leading-snug flex items-center justify-between">
                      <span className="truncate">{seg.text || <span className="italic text-slate-500">Empty caption...</span>}</span>
                      <Edit2 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 shrink-0 ml-1" />
                    </div>
                  )}

                  {/* Timing Badges */}
                  <div className="flex items-center justify-between text-[9px] font-mono mt-1 gap-1">
                    <span className="text-slate-400">
                      {seg.start.toFixed(1)}s - {seg.end.toFixed(1)}s
                    </span>

                    <span className={`px-1 rounded border text-[8px] font-sans ${wpmInfo.color}`}>
                      {wpmInfo.badge} {wpmInfo.wpm} WPM
                    </span>
                  </div>

                  {/* Visible Left Drag Handle (Start Time Adjust) */}
                  <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-indigo-500/30 hover:bg-indigo-500/80 rounded-l-xl cursor-col-resize flex items-center justify-center group-hover:opacity-100 transition">
                    <input
                      type="range"
                      min={0}
                      max={seg.end - 0.2}
                      step={0.1}
                      value={seg.start}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onUpdateSegment(seg.id, 'start', parseFloat(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-col-resize"
                      title="Drag to change start time"
                    />
                  </div>

                  {/* Visible Right Drag Handle (End Time Adjust) */}
                  <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-indigo-500/30 hover:bg-indigo-500/80 rounded-r-xl cursor-col-resize flex items-center justify-center group-hover:opacity-100 transition">
                    <input
                      type="range"
                      min={seg.start + 0.2}
                      max={totalDuration}
                      step={0.1}
                      value={seg.end}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onUpdateSegment(seg.id, 'end', parseFloat(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-col-resize"
                      title="Drag to change end time"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineEditor;
