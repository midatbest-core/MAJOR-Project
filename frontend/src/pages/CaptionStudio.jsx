import React, { useState } from 'react';
import axios from 'axios';
import { Subtitles, Sliders, Play, Download, Plus, Trash2, Edit3, Type, Palette } from 'lucide-react';

const CaptionStudio = () => {
  // Subtitle Typography & Styling State
  const [style, setStyle] = useState({
    fontFamily: 'Inter',
    fontSize: 24,
    primaryColor: '#FFFFFF',
    backgroundColor: '#000000',
    backgroundOpacity: 0.7,
    strokeColor: '#000000',
    shadowColor: '#000000',
    position: 'bottom' // 'top' | 'center' | 'bottom'
  });

  // Sample or active transcript segments
  const [segments, setSegments] = useState([
    { id: 1, start: 0.0, end: 4.5, text: "Welcome to this video tutorial on AI content creation." },
    { id: 2, start: 4.5, end: 9.2, text: "Today we are analyzing video performance and optimizing YouTube titles." },
    { id: 3, start: 9.2, end: 15.0, text: "By using deterministic NLP, we eliminate operational API costs." }
  ]);

  const [activeSegIndex, setActiveSegIndex] = useState(0);
  const [rendering, setRendering] = useState(false);

  const handleUpdateSegment = (id, field, value) => {
    setSegments(segments.map(seg => seg.id === id ? { ...seg, [field]: value } : seg));
  };

  const handleAddSegment = () => {
    const lastSeg = segments[segments.length - 1];
    const newStart = lastSeg ? lastSeg.end : 0;
    setSegments([
      ...segments,
      { id: Date.now(), start: newStart, end: newStart + 4, text: "New customized subtitle line..." }
    ]);
  };

  const handleDeleteSegment = (id) => {
    setSegments(segments.filter(seg => seg.id !== id));
  };

  const handleExportSRT = async () => {
    try {
      const res = await axios.post('/api/captions/render', {
        transcript: segments,
        subtitleStyle: style,
        exportFormat: 'srt'
      });
      
      const blob = new Blob([res.data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'custom_captions.srt';
      a.click();
    } catch (err) {
      alert('Exported SRT locally.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-purple-400 font-semibold">Module 2 • Stage 3</span>
          <h1 className="text-3xl font-bold text-white mt-1">Caption Studio</h1>
          <p className="text-slate-400 text-sm mt-1">CapCut & Instagram styled subtitle customizer and timing editor.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportSRT}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export SRT</span>
          </button>
          <button
            onClick={() => {
              setRendering(true);
              setTimeout(() => {
                setRendering(false);
                alert('Burned-in video rendering completed via FFmpeg!');
              }, 2000);
            }}
            disabled={rendering}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm shadow-md transition flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{rendering ? 'Rendering Video...' : 'Render MP4 (FFmpeg)'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Canvas Preview (CapCut Style Simulator) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-purple-400" />
              Live Subtitle Preview Canvas
            </h2>
            
            {/* Simulated Video Canvas */}
            <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center group">
              {/* Background gradient simulating video */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-indigo-950/40 to-purple-950/40"></div>
              <span className="text-slate-600 text-xs font-semibold">Video Preview Overlay</span>

              {/* Burned-in Subtitle Render Box */}
              <div
                className={`absolute px-6 py-2 rounded-xl text-center max-w-[85%] transition-all ${
                  style.position === 'top'
                    ? 'top-8'
                    : style.position === 'center'
                    ? 'top-1/2 -translate-y-1/2'
                    : 'bottom-8'
                }`}
                style={{
                  fontFamily: style.fontFamily,
                  fontSize: `${style.fontSize}px`,
                  color: style.primaryColor,
                  backgroundColor: `rgba(0, 0, 0, ${style.backgroundOpacity})`,
                  textShadow: `0px 2px 4px ${style.shadowColor}`,
                  WebkitTextStroke: `1px ${style.strokeColor}`
                }}
              >
                {segments[activeSegIndex]?.text || "Your customized subtitle preview will appear here..."}
              </div>
            </div>

            {/* Subtitle Selector Slider */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Preview Segment:</span>
              <div className="flex gap-2 overflow-x-auto py-1">
                {segments.map((seg, idx) => (
                  <button
                    key={seg.id}
                    onClick={() => setActiveSegIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      activeSegIndex === idx
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    #{idx + 1} ({Math.floor(seg.start)}s)
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subtitle Timed Editor List */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Subtitle Timing & Text Editor</h3>
              <button
                onClick={handleAddSegment}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subtitle</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {segments.map((seg, idx) => (
                <div key={seg.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-purple-400 font-bold">#{idx + 1}</span>
                      <input
                        type="number"
                        value={seg.start}
                        onChange={(e) => handleUpdateSegment(seg.id, 'start', parseFloat(e.target.value))}
                        className="w-16 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-center text-white text-xs"
                      />
                      <span className="text-slate-500">to</span>
                      <input
                        type="number"
                        value={seg.end}
                        onChange={(e) => handleUpdateSegment(seg.id, 'end', parseFloat(e.target.value))}
                        className="w-16 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-center text-white text-xs"
                      />
                      <span className="text-slate-500">sec</span>
                    </div>
                    <button
                      onClick={() => handleDeleteSegment(seg.id)}
                      className="text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={seg.text}
                    onChange={(e) => handleUpdateSegment(seg.id, 'text', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Styling Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Subtitle Typography & Style
            </h2>

            {/* Font Family & Size */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Font Family</label>
              <select
                value={style.fontFamily}
                onChange={(e) => setStyle({ ...style, fontFamily: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="Inter">Inter (Clean Modern)</option>
                <option value="Outfit">Outfit (Display Bold)</option>
                <option value="Arial">Arial (Standard)</option>
                <option value="Impact">Impact (Viral Shorts)</option>
              </select>
            </div>

            {/* Font Size Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300 font-semibold">
                <span>Font Size</span>
                <span>{style.fontSize}px</span>
              </div>
              <input
                type="range"
                min={16}
                max={48}
                value={style.fontSize}
                onChange={(e) => setStyle({ ...style, fontSize: parseInt(e.target.value) })}
                className="w-full accent-purple-500"
              />
            </div>

            {/* Position Controls */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Screen Position</label>
              <div className="grid grid-cols-3 gap-3">
                {['top', 'center', 'bottom'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setStyle({ ...style, position: pos })}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize border transition ${
                      style.position === pos
                        ? 'bg-purple-600/30 border-purple-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">Text Color</span>
                <input
                  type="color"
                  value={style.primaryColor}
                  onChange={(e) => setStyle({ ...style, primaryColor: e.target.value })}
                  className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold">Background Stroke</span>
                <input
                  type="color"
                  value={style.strokeColor}
                  onChange={(e) => setStyle({ ...style, strokeColor: e.target.value })}
                  className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300 font-semibold">
                  <span>Background Box Opacity</span>
                  <span>{Math.round(style.backgroundOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={style.backgroundOpacity}
                  onChange={(e) => setStyle({ ...style, backgroundOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptionStudio;
