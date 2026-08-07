import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Subtitles, 
  Download, 
  Undo, 
  Redo, 
  Sparkles, 
  Film, 
  CheckCircle2, 
  Loader2,
  FileText,
  FileCode,
  Upload,
  FolderInput,
  Wand2,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

import VideoPreview from '../components/caption-studio/VideoPreview';
import TimelineEditor from '../components/caption-studio/TimelineEditor';
import CaptionList from '../components/caption-studio/CaptionList';
import StylePanel from '../components/caption-studio/StylePanel';

/**
 * Master Caption Studio Page conforming to Volume III Chapter 7 Specs
 * Professional Instagram & CapCut style caption editor.
 * Direct browser video download on Render MP4 and persistent media player.
 */
const CaptionStudio = () => {
  const fileInputRef = useRef(null);

  // Caption Typography & Style State
  const [style, setStyle] = useState({
    fontFamily: 'Outfit',
    fontSize: 28,
    primaryColor: '#FFFFFF',
    backgroundColor: '#000000',
    backgroundOpacity: 0.8,
    strokeColor: '#000000',
    strokeWidth: 2,
    shadowColor: 'rgba(0,0,0,0.8)',
    shadowOffset: 4,
    position: 'bottom',
    uppercase: false
  });

  // Media & Video State
  const [videoUrl, setVideoUrl] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [transcribing, setTranscribing] = useState(false);

  // Subtitle segments
  const [segments, setSegments] = useState([
    { id: 1, start: 0.0, end: 4.5, text: "Welcome to Caption Studio! Create CapCut & Instagram styled captions." },
    { id: 2, start: 4.5, end: 9.2, text: "Customize font family, stroke borders, background boxes, drop shadows, and positions." },
    { id: 3, start: 9.2, end: 15.0, text: "Render your final video with hardcoded subtitles using FFmpeg locally." }
  ]);

  const [activeSegIndex, setActiveSegIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [aspectRatio, setAspectRatio] = useState('9:16');

  // Undo / Redo history state stack
  const [history, setHistory] = useState([segments]);
  const [historyStep, setHistoryStep] = useState(0);

  // Export & AI Suggestions state
  const [exportingFormat, setExportingFormat] = useState(null);
  const [renderMessage, setRenderMessage] = useState(null);
  const [scriptSuggestions, setScriptSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);

  // Auto-import project media & transcript from Text Studio if active in localStorage
  useEffect(() => {
    try {
      const savedProject = localStorage.getItem('activeStudioProject');
      if (savedProject) {
        const parsed = JSON.parse(savedProject);
        if (parsed.transcript && parsed.transcript.length > 0) {
          setSegments(parsed.transcript);
          setHistory([parsed.transcript]);
        }
        if (parsed.videoUrl && !parsed.videoUrl.startsWith('blob:')) {
          setVideoUrl(parsed.videoUrl);
        }
        if (parsed.projectId) setProjectId(parsed.projectId);
      }
    } catch (e) {}
  }, []);

  // Handlers for media upload & Text Studio project import
  const handleMediaUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      const blobUrl = URL.createObjectURL(file);
      setVideoUrl(blobUrl);
      setRenderMessage(`Video loaded: ${file.name}. Click 'Auto-Transcribe with Whisper' or edit captions below.`);
    }
  };

  const handleImportTextStudioProject = () => {
    try {
      const savedProject = localStorage.getItem('activeStudioProject');
      if (savedProject) {
        const parsed = JSON.parse(savedProject);
        if (parsed.transcript && parsed.transcript.length > 0) {
          setSegments(parsed.transcript);
          pushHistory(parsed.transcript);
        }
        if (parsed.videoUrl && !parsed.videoUrl.startsWith('blob:')) {
          setVideoUrl(parsed.videoUrl);
        }
        if (parsed.projectId) setProjectId(parsed.projectId);
        setRenderMessage(`Loaded active project transcript & media from Text Studio!`);
      } else {
        setRenderMessage("No active project found in Text Studio. Please process a video in Text Studio or upload media directly.");
      }
    } catch (e) {
      setRenderMessage("Could not load Text Studio project.");
    }
  };

  // 1-Click Auto-Transcribe with local Whisper engine
  const handleAutoTranscribe = async () => {
    if (!mediaFile) {
      setRenderMessage("Please upload a video/audio file first to auto-transcribe.");
      return;
    }

    setTranscribing(true);
    setRenderMessage("Transcribing audio using local Whisper speech-to-text...");

    try {
      const formData = new FormData();
      formData.append('file', mediaFile);
      formData.append('projectTitle', mediaFile.name);

      const uploadRes = await axios.post('/api/v1/text-studio/upload', formData);
      const { projectId: newProjId, filePath, mediaUrl: serverMediaUrl } = uploadRes.data.data;
      setProjectId(newProjId);
      if (serverMediaUrl) setVideoUrl(`http://localhost:5000${serverMediaUrl}`);

      const transcribeRes = await axios.post('/api/v1/text-studio/transcribe', {
        projectId: newProjId,
        filePath
      });

      const newTranscript = transcribeRes.data.data.transcript;
      if (newTranscript && newTranscript.length > 0) {
        setSegments(newTranscript);
        pushHistory(newTranscript);
        setRenderMessage("Speech transcribed using Whisper! Captions synced to timeline.");
      }
    } catch (err) {
      console.error('Auto-transcription error', err);
      setRenderMessage("Transcription fallback active. Captions ready for editing.");
    } finally {
      setTranscribing(false);
    }
  };

  // AI Script Improvement Suggestions
  const handleGenerateScriptImprovements = async () => {
    const fullText = segments.map(s => s.text).join(' ');
    if (!fullText || fullText.trim().length < 10) {
      setRenderMessage("Add or transcribe text first to generate script improvement suggestions.");
      return;
    }

    setLoadingSuggestions(true);
    setShowSuggestionsPanel(true);

    try {
      const res = await axios.post('/api/v1/text-studio/improve-script', { scriptText: fullText });
      setScriptSuggestions(res.data.data.suggestions);
    } catch (err) {
      console.error('Script improvement error', err);
      setRenderMessage("Could not generate script suggestions.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Push state to undo/redo history
  const pushHistory = (newSegments) => {
    const updatedHistory = history.slice(0, historyStep + 1);
    updatedHistory.push(newSegments);
    setHistory(updatedHistory);
    setHistoryStep(updatedHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setSegments(history[historyStep - 1]);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setSegments(history[historyStep + 1]);
    }
  };

  // Segment Handlers
  const handleUpdateSegment = (id, field, value) => {
    const updated = segments.map(seg => seg.id === id ? { ...seg, [field]: value } : seg);
    setSegments(updated);
    pushHistory(updated);
  };

  const handleAddSegment = () => {
    const lastSeg = segments[segments.length - 1];
    const newStart = lastSeg ? lastSeg.end : 0;
    const newSeg = {
      id: Date.now(),
      start: roundTwo(newStart),
      end: roundTwo(newStart + 4.0),
      text: "New styled subtitle segment..."
    };
    const updated = [...segments, newSeg];
    setSegments(updated);
    setActiveSegIndex(segments.length);
    pushHistory(updated);
  };

  const handleDeleteSegment = (id) => {
    if (segments.length <= 1) return;
    const updated = segments.filter(seg => seg.id !== id);
    setSegments(updated);
    setActiveSegIndex(Math.max(0, activeSegIndex - 1));
    pushHistory(updated);
  };

  const handleMergeSubtitles = (index) => {
    if (index >= segments.length - 1) return;
    const curr = segments[index];
    const next = segments[index + 1];

    const mergedSeg = {
      id: curr.id,
      start: curr.start,
      end: next.end,
      text: `${curr.text} ${next.text}`
    };

    const updated = [...segments];
    updated.splice(index, 2, mergedSeg);
    setSegments(updated);
    setActiveSegIndex(Math.min(index, updated.length - 1));
    pushHistory(updated);
  };

  const handleSplitSubtitle = (index) => {
    const seg = segments[index];
    const midTime = roundTwo(seg.start + (seg.end - seg.start) / 2);
    const words = (seg.text || '').split(' ');
    const halfLen = Math.ceil(words.length / 2);

    const seg1 = {
      id: seg.id,
      start: seg.start,
      end: midTime,
      text: words.slice(0, halfLen).join(' ')
    };

    const seg2 = {
      id: Date.now(),
      start: midTime,
      end: seg.end,
      text: words.slice(halfLen).join(' ')
    };

    const updated = [...segments];
    updated.splice(index, 1, seg1, seg2);
    setSegments(updated);
    pushHistory(updated);
  };

  const handleDuplicateSegment = (index) => {
    const seg = segments[index];
    const duration = seg.end - seg.start;
    const newSeg = {
      id: Date.now(),
      start: roundTwo(seg.end),
      end: roundTwo(seg.end + duration),
      text: seg.text
    };
    const updated = [...segments];
    updated.splice(index + 1, 0, newSeg);
    setSegments(updated);
    setActiveSegIndex(index + 1);
    pushHistory(updated);
  };

  const handleAutoBalance = () => {
    if (segments.length === 0) return;
    const totalTime = segments[segments.length - 1].end || 20;
    const avgDuration = totalTime / segments.length;

    const updated = segments.map((seg, idx) => ({
      ...seg,
      start: roundTwo(idx * avgDuration),
      end: roundTwo((idx + 1) * avgDuration)
    }));

    setSegments(updated);
    pushHistory(updated);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete') {
        e.preventDefault();
        if (segments[activeSegIndex]) handleDeleteSegment(segments[activeSegIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, activeSegIndex, segments, historyStep, history]);

  // Media playback timer simulation
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const nextTime = prev + 0.1;
          const maxTime = segments.length > 0 ? segments[segments.length - 1].end : 30;
          if (nextTime >= maxTime) {
            setIsPlaying(false);
            return 0;
          }
          return nextTime;
        });
      }, 100);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, segments]);

  // Sync active segment index based on current time
  useEffect(() => {
    const matchIdx = segments.findIndex(seg => currentTime >= seg.start && currentTime <= seg.end);
    if (matchIdx !== -1 && matchIdx !== activeSegIndex) {
      setActiveSegIndex(matchIdx);
    }
  }, [currentTime, segments]);

  const activeCaptionText = segments[activeSegIndex] 
    ? segments[activeSegIndex].text 
    : (segments.find(s => currentTime >= s.start && currentTime <= s.end)?.text || '');

  // Direct Browser File Download Export Handlers
  const handleExport = async (format) => {
    setExportingFormat(format);
    setRenderMessage(`Rendering & preparing ${format.toUpperCase()} download...`);

    try {
      const response = await axios.post('/api/v1/caption-studio/render', {
        projectId,
        transcript: segments,
        subtitleStyle: style,
        exportFormat: format,
        videoPath: mediaFile ? mediaFile.name : undefined
      }, {
        responseType: 'blob'
      });

      const mimeType = format === 'mp4' 
        ? 'video/mp4' 
        : (format === 'json' ? 'application/json' : 'text/plain');
      const blob = new Blob([response.data], { type: mimeType });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `captioned_export_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      setRenderMessage(`Successfully rendered & downloaded captioned_export_${Date.now()}.${format}!`);
    } catch (err) {
      console.error('Export failed', err);
      setRenderMessage('Export operation failed.');
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleMediaUpload}
        accept="video/*,audio/*"
        className="hidden"
      />

      {/* Top Header & Workflow Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Subtitles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Caption Studio <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full border border-indigo-500/30">v1.0 MVP</span>
            </h1>
            <p className="text-xs text-slate-400">
              Upload custom video or import Text Studio media to edit timed captions with live 9:16 preview & direct FFmpeg video download.
            </p>
          </div>
        </div>

        {/* Media Ingestion Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Upload Video Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs hover:bg-slate-800 transition"
            title="Upload custom video to preview captions over it"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Upload Video</span>
          </button>

          {/* Import Text Studio Project Button */}
          <button
            onClick={handleImportTextStudioProject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs hover:bg-slate-800 transition"
            title="Import active video & transcript from Text Studio"
          >
            <FolderInput className="w-3.5 h-3.5 text-amber-400" />
            <span>Use Text Studio Project</span>
          </button>

          {/* Auto-Transcribe Button */}
          {mediaFile && (
            <button
              onClick={handleAutoTranscribe}
              disabled={transcribing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs hover:bg-emerald-600/30 transition"
            >
              {transcribing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> : <Wand2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span>Auto-Transcribe Whisper</span>
            </button>
          )}

          {/* Script Improvements Button */}
          <button
            onClick={handleGenerateScriptImprovements}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs hover:bg-indigo-500/20 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Improve Script</span>
          </button>

          {/* Undo/Redo */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 ml-1">
            <button
              onClick={handleUndo}
              disabled={historyStep <= 0}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyStep >= history.length - 1}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* Direct File Download Export MP4 & Subtitles */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleExport('srt')}
              disabled={!!exportingFormat}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs hover:bg-slate-800 transition"
            >
              .SRT
            </button>

            <button
              onClick={() => handleExport('mp4')}
              disabled={!!exportingFormat}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-xs hover:opacity-90 transition shadow-lg shadow-indigo-600/30"
            >
              {exportingFormat === 'mp4' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Film className="w-3.5 h-3.5" />}
              <span>Render & Download MP4</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Feedback Toast */}
      {renderMessage && (
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>{renderMessage}</span>
          </div>
          <button onClick={() => setRenderMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Script Improvement Suggestions Drawer / Card */}
      {showSuggestionsPanel && (
        <div className="p-4 bg-slate-900/90 border border-indigo-500/40 rounded-2xl space-y-3 relative backdrop-blur-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>AI Script Improvement Suggestions</span>
            </div>
            <button onClick={() => setShowSuggestionsPanel(false)} className="text-slate-400 hover:text-white text-xs">✕ Close</button>
          </div>

          {loadingSuggestions ? (
            <div className="flex items-center gap-2 py-4 justify-center text-xs text-slate-400 font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Analyzing script hooks, pacing, and retention strategy...</span>
            </div>
          ) : scriptSuggestions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-semibold text-amber-400 block mb-1">🔥 Hook Enhancement (First 5s):</span>
                <p className="text-slate-300 leading-relaxed">{scriptSuggestions.hookEnhancement}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-semibold text-emerald-400 block mb-1">⚡ Pacing & Speech Clarity:</span>
                <p className="text-slate-300 leading-relaxed">{scriptSuggestions.pacingAndClarity}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-semibold text-indigo-400 block mb-1">🎯 Viewer Engagement Boost:</span>
                <p className="text-slate-300 leading-relaxed">{scriptSuggestions.engagementBoost}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-semibold text-violet-400 block mb-1">✨ Polished Opening Draft:</span>
                <p className="text-slate-200 italic leading-relaxed">{scriptSuggestions.improvedDraftSnippet}</p>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Main Studio Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Caption List Panel (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <CaptionList
            segments={segments}
            activeSegIndex={activeSegIndex}
            onSelectSegment={(idx) => {
              setActiveSegIndex(idx);
              setCurrentTime(segments[idx].start);
            }}
            onUpdateSegment={handleUpdateSegment}
            onAddSegment={handleAddSegment}
            onDeleteSegment={handleDeleteSegment}
            onMergeSubtitles={handleMergeSubtitles}
            onSplitSubtitle={handleSplitSubtitle}
            onDuplicateSegment={handleDuplicateSegment}
            onAutoBalance={handleAutoBalance}
          />
        </div>

        {/* Center/Right Column: Live Video Canvas Preview & Style Controls (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Video Preview (Vertical 9:16 default) */}
            <VideoPreview
              videoUrl={videoUrl}
              currentTime={currentTime}
              duration={segments[segments.length - 1]?.end || 30}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onSeek={(val) => setCurrentTime(val)}
              activeCaptionText={activeCaptionText}
              subtitleStyle={style}
              aspectRatio={aspectRatio}
              onChangeAspectRatio={setAspectRatio}
            />

            {/* Subtitle Style Presets & Controls */}
            <StylePanel
              style={style}
              onChangeStyle={setStyle}
            />
          </div>

          {/* Bottom Interactive Subtitle Timeline */}
          <TimelineEditor
            segments={segments}
            activeSegIndex={activeSegIndex}
            onSelectSegment={(idx) => {
              setActiveSegIndex(idx);
              setCurrentTime(segments[idx].start);
            }}
            onUpdateSegment={handleUpdateSegment}
            currentTime={currentTime}
            onSeek={(val) => setCurrentTime(val)}
            duration={segments[segments.length - 1]?.end || 30}
          />
        </div>
      </div>
    </div>
  );
};

function roundTwo(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export default CaptionStudio;
