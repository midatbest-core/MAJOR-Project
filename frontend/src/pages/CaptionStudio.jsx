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
  const srtFileInputRef = useRef(null);

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
    uppercase: false,
    animation: 'none',
    highlightColor: '#FFD700'
  });

  // Media & Video State
  const [videoUrl, setVideoUrl] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [serverVideoPath, setServerVideoPath] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [selectedGranularity, setSelectedGranularity] = useState('3-4');

  // Helper function to guarantee every segment has a unique, robust ID and clean numeric timestamps
  const normalizeSegments = (rawSegments) => {
    if (!Array.isArray(rawSegments)) return [];
    return rawSegments.map((seg, idx) => ({
      id: seg.id ? String(seg.id) : `seg_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
      start: typeof seg.start === 'number' ? roundTwo(seg.start) : (parseFloat(seg.start) || 0),
      end: typeof seg.end === 'number' ? roundTwo(seg.end) : (parseFloat(seg.end) || 4.0),
      text: seg.text || ''
    }));
  };

  // Subtitle segments (Fresh state on reload as requested by user)
  const [segments, setSegments] = useState(() => [
    { id: 'seg_1', start: 0.0, end: 4.5, text: "Welcome to Caption Studio! Create CapCut & Instagram styled captions." },
    { id: 'seg_2', start: 4.5, end: 9.2, text: "Customize font family, stroke borders, background boxes, drop shadows, and positions." },
    { id: 'seg_3', start: 9.2, end: 15.0, text: "Render your final video with hardcoded subtitles using FFmpeg locally." }
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

  // Auto-load active project from Text Studio on mount
  useEffect(() => {
    try {
      const savedProject = localStorage.getItem('activeStudioProject');
      if (savedProject) {
        const parsed = JSON.parse(savedProject);
        if (parsed.transcript && parsed.transcript.length > 0) {
          const normalized = normalizeSegments(parsed.transcript);
          setSegments(normalized);
          setHistory([normalized]);
          setHistoryStep(0);
        }
        if (parsed.videoUrl) {
          setVideoUrl(parsed.videoUrl);
        }
        if (parsed.projectId) setProjectId(parsed.projectId);
        setRenderMessage(`Loaded active project transcript & media from Text Studio!`);
      }
    } catch (e) {
      console.warn("Could not auto-load Text Studio project.", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Parse timed SRT or VTT files into subtitle segments
  const parseSrtOrVtt = (content) => {
    const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    const parsedSegments = [];
    let currentSeg = null;

    const timeRegex = /(?:(\d+):)?(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(?:(\d+):)?(\d{2}):(\d{2})[,.](\d{3})/;

    const parseTimeSeconds = (h, m, s, ms) => {
      const hours = parseInt(h || '0', 10);
      const minutes = parseInt(m || '0', 10);
      const seconds = parseInt(s || '0', 10);
      const milliseconds = parseInt(ms || '0', 10);
      return roundTwo(hours * 3600 + minutes * 60 + seconds + milliseconds / 1000);
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.toUpperCase().startsWith('WEBVTT')) continue;

      const match = line.match(timeRegex);
      if (match) {
        if (currentSeg && currentSeg.text) {
          parsedSegments.push(currentSeg);
        }
        const start = parseTimeSeconds(match[1], match[2], match[3], match[4]);
        const end = parseTimeSeconds(match[5], match[6], match[7], match[8]);
        currentSeg = {
          id: `srt_${Date.now()}_${parsedSegments.length}_${Math.random().toString(36).substr(2, 4)}`,
          start,
          end,
          text: ''
        };
      } else if (currentSeg && !/^\d+$/.test(line)) {
        currentSeg.text = currentSeg.text ? `${currentSeg.text} ${line}` : line;
      }
    }

    if (currentSeg && currentSeg.text) {
      parsedSegments.push(currentSeg);
    }

    return normalizeSegments(parsedSegments);
  };

  // Re-segment transcript based on chosen word length or sentence boundaries
  const handleBreakTranscript = (granularity, sourceSegments = null) => {
    const targetSegments = sourceSegments || segments;
    setSelectedGranularity(granularity);
    if (!targetSegments || targetSegments.length === 0) return;

    let resegmented = [];

    targetSegments.forEach(seg => {
      const text = seg.text || '';
      const start = seg.start || 0;
      const end = seg.end || (start + 2);
      const duration = Math.max(0.1, end - start);

      if (granularity === 'sentence') {
        const matches = text.match(/[^.!?]+[.!?]+/g) || [text];
        const chunks = matches.map(s => s.trim()).filter(Boolean);
        const totalWords = text.trim().split(/\s+/).filter(Boolean).length || 1;
        
        let currStart = start;
        chunks.forEach((chunk, idx) => {
          const wordCount = chunk.trim().split(/\s+/).filter(Boolean).length || 1;
          const chunkDur = (wordCount / totalWords) * duration;
          const chunkEnd = idx === chunks.length - 1 ? end : roundTwo(currStart + chunkDur);
          
          resegmented.push({
            id: `break_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            start: currStart,
            end: chunkEnd,
            text: chunk
          });
          currStart = chunkEnd;
        });
      } else {
        const words = text.trim().split(/\s+/).filter(Boolean);
        const chunkSize = granularity === '1-2' ? 2 : 4;
        
        const totalWords = words.length || 1;
        let currStart = start;
        
        for (let i = 0; i < words.length; i += chunkSize) {
          const chunkWords = words.slice(i, i + chunkSize);
          const chunkText = chunkWords.join(' ');
          const chunkDur = (chunkWords.length / totalWords) * duration;
          const chunkEnd = (i + chunkSize >= words.length) ? end : roundTwo(currStart + chunkDur);
          
          resegmented.push({
            id: `break_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            start: currStart,
            end: chunkEnd,
            text: chunkText
          });
          currStart = chunkEnd;
        }
      }
    });

    const normalized = normalizeSegments(resegmented);
    setSegments(normalized);
    pushHistory(normalized);
    setRenderMessage(`Captions re-segmented into ${granularity === 'sentence' ? 'full sentences' : granularity + ' words per subtitle'}!`);
  };

  // Handlers for direct media upload
  const handleMediaUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      const blobUrl = URL.createObjectURL(file);
      setVideoUrl(blobUrl);
      setRenderMessage(`Video selected: ${file.name}. Uploading media for live preview & transcription...`);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectTitle', file.name);

        const uploadRes = await axios.post('/api/v1/text-studio/upload', formData);
        const { projectId: newProjId, filePath, mediaUrl: serverMediaUrl } = uploadRes.data.data;
        setProjectId(newProjId);
        setServerVideoPath(filePath);
        if (serverMediaUrl) setVideoUrl(`http://localhost:5000${serverMediaUrl}`);
        setRenderMessage(`Video '${file.name}' ready! Click 'Quick Subtitles (Whisper)' to transcribe immediately.`);
      } catch (err) {
        console.warn('Direct upload fallback:', err.message);
        setRenderMessage(`Video loaded locally for preview. Click 'Quick Subtitles (Whisper)' to transcribe.`);
      }
    }
  };

  // Handle Timed SRT / VTT Subtitle File Import
  const handleSrtFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const content = event.target.result;
        const parsed = parseSrtOrVtt(content);
        if (parsed && parsed.length > 0) {
          setSegments(parsed);
          pushHistory(parsed);
          setActiveSegIndex(0);
          setCurrentTime(parsed[0].start);
          setRenderMessage(`Imported ${parsed.length} timed subtitles from ${file.name}!`);
        } else {
          setRenderMessage(`Could not parse timed subtitles from ${file.name}. Ensure valid SRT/VTT format.`);
        }
      };

      reader.readAsText(file);
    }
  };

  const handleImportTextStudioProject = () => {
    try {
      const savedProject = localStorage.getItem('activeStudioProject');
      if (savedProject) {
        const parsed = JSON.parse(savedProject);
        if (parsed.transcript && parsed.transcript.length > 0) {
          const normalized = normalizeSegments(parsed.transcript);
          setSegments(normalized);
          pushHistory(normalized);
        }
        if (parsed.videoUrl) {
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

  // 1-Click Auto-Transcribe with local Whisper engine (Quick Subtitles)
  const handleAutoTranscribe = async () => {
    if (!mediaFile && !serverVideoPath) {
      setRenderMessage("Please upload a video file first to auto-transcribe.");
      return;
    }

    setTranscribing(true);
    setRenderMessage("Generating quick subtitles using local Whisper engine...");

    try {
      let activePath = serverVideoPath;
      let activeProjId = projectId;

      if (!activePath && mediaFile) {
        const formData = new FormData();
        formData.append('file', mediaFile);
        formData.append('projectTitle', mediaFile.name);

        const uploadRes = await axios.post('/api/v1/text-studio/upload', formData);
        const data = uploadRes.data.data;
        activeProjId = data.projectId;
        activePath = data.filePath;
        setProjectId(activeProjId);
        setServerVideoPath(activePath);
        if (data.mediaUrl) setVideoUrl(`http://localhost:5000${data.mediaUrl}`);
      }

      const transcribeRes = await axios.post('/api/v1/text-studio/transcribe', {
        projectId: activeProjId,
        filePath: activePath
      });

      const newTranscript = transcribeRes.data.data.transcript;
      if (newTranscript && newTranscript.length > 0) {
        const normalized = normalizeSegments(newTranscript);
        if (selectedGranularity && selectedGranularity !== 'sentence') {
          handleBreakTranscript(selectedGranularity, normalized);
        } else {
          setSegments(normalized);
          pushHistory(normalized);
        }
        setRenderMessage("Quick subtitles generated! Synced to preview and timeline.");
      }
    } catch (err) {
      console.error('Auto-transcription error', err);
      setRenderMessage("Transcription fallback active. You can double click to edit captions manually.");
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
      const prevStep = historyStep - 1;
      setHistoryStep(prevStep);
      setSegments(history[prevStep]);
      setActiveSegIndex(prev => Math.min(prev, history[prevStep].length - 1));
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep);
      setSegments(history[nextStep]);
      setActiveSegIndex(prev => Math.min(prev, history[nextStep].length - 1));
    }
  };

  // Segment Handlers
  const handleUpdateSegment = (id, field, value) => {
    if (id === undefined || id === null) return;
    const targetId = String(id);
    const updated = segments.map(seg => {
      if (String(seg.id) === targetId) {
        let newValue = value;
        if (field === 'start') {
          newValue = parseFloat(value);
          if (isNaN(newValue)) newValue = 0;
          newValue = roundTwo(newValue);
          if (newValue >= seg.end) {
            newValue = roundTwo(Math.max(0, seg.end - 0.1));
          }
        } else if (field === 'end') {
          newValue = parseFloat(value);
          if (isNaN(newValue)) newValue = 0;
          newValue = roundTwo(newValue);
          if (newValue <= seg.start) {
            newValue = roundTwo(seg.start + 0.1);
          }
        }
        return { ...seg, [field]: newValue };
      }
      return seg;
    });
    setSegments(updated);
    pushHistory(updated);
  };

  const handleAddSegment = () => {
    let updated;
    let newIndex;

    if (segments.length === 0) {
      const newSeg = {
        id: `seg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        start: 0.0,
        end: 4.0,
        text: "New styled subtitle segment..."
      };
      updated = [newSeg];
      newIndex = 0;
    } else {
      const targetIdx = (activeSegIndex >= 0 && activeSegIndex < segments.length)
        ? activeSegIndex
        : segments.length - 1;

      const activeSeg = segments[targetIdx];
      const newStart = roundTwo(activeSeg.end);
      const nextSeg = segments[targetIdx + 1];
      let newEnd = roundTwo(newStart + 3.5);

      if (nextSeg && nextSeg.start > newStart) {
        newEnd = roundTwo(Math.min(newStart + 3.5, nextSeg.start));
        if (newEnd <= newStart) newEnd = roundTwo(newStart + 0.5);
      }

      const newSeg = {
        id: `seg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        start: newStart,
        end: newEnd,
        text: "New styled subtitle segment..."
      };

      updated = [...segments.slice(0, targetIdx + 1), newSeg, ...segments.slice(targetIdx + 1)];
      newIndex = targetIdx + 1;
    }

    setSegments(updated);
    setActiveSegIndex(newIndex);
    if (updated[newIndex]) {
      setCurrentTime(updated[newIndex].start);
    }
    pushHistory(updated);
  };

  const handleDeleteSegment = (id) => {
    if (segments.length <= 1) return;
    const targetId = String(id);
    const updated = segments.filter(seg => String(seg.id) !== targetId);
    setSegments(updated);
    const newActiveIndex = Math.min(activeSegIndex, updated.length - 1);
    setActiveSegIndex(Math.max(0, newActiveIndex));
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
      text: `${curr.text} ${next.text}`.trim()
    };

    const updated = [...segments];
    updated.splice(index, 2, mergedSeg);
    setSegments(updated);
    setActiveSegIndex(Math.min(index, updated.length - 1));
    pushHistory(updated);
  };

  const handleSplitSubtitle = (index) => {
    const seg = segments[index];
    if (!seg) return;
    const midTime = roundTwo(seg.start + (seg.end - seg.start) / 2);
    const words = (seg.text || '').trim().split(/\s+/).filter(Boolean);
    const halfLen = Math.max(1, Math.ceil(words.length / 2));

    const seg1 = {
      id: seg.id,
      start: seg.start,
      end: midTime,
      text: words.slice(0, halfLen).join(' ')
    };

    const seg2 = {
      id: `seg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      start: midTime,
      end: seg.end,
      text: words.slice(halfLen).join(' ')
    };

    const updated = [...segments];
    updated.splice(index, 1, seg1, seg2);
    setSegments(updated);
    setActiveSegIndex(index + 1);
    pushHistory(updated);
  };

  const handleDuplicateSegment = (index) => {
    const seg = segments[index];
    if (!seg) return;
    const duration = Math.max(1, seg.end - seg.start);
    const newSeg = {
      id: `seg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
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
    if (isPlaying && !videoUrl) {
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
  }, [isPlaying, segments, videoUrl]);

  // Sync active segment index based on current time
  useEffect(() => {
    const matchIdx = segments.findIndex(seg => currentTime >= seg.start && currentTime <= seg.end);
    if (matchIdx !== -1 && matchIdx !== activeSegIndex) {
      setActiveSegIndex(matchIdx);
    }
  }, [currentTime, segments]);

  const activeSegment = segments.find(s => currentTime >= s.start && currentTime <= s.end) || null;
  const activeCaptionText = activeSegment?.text || '';

  // Direct Browser File Download Export Handlers
  const handleExport = async (format) => {
    setExportingFormat(format);
    setRenderMessage(`Preparing ${format.toUpperCase()} export download...`);

    try {
      const response = await axios.post('/api/v1/caption-studio/render', {
        projectId,
        transcript: segments,
        subtitleStyle: style,
        exportFormat: format,
        videoPath: serverVideoPath || (mediaFile ? mediaFile.name : undefined)
      }, {
        responseType: 'blob'
      });

      const mimeTypes = {
        mp4: 'video/mp4',
        srt: 'text/plain',
        vtt: 'text/vtt',
        txt: 'text/plain',
        json: 'application/json'
      };

      const blob = new Blob([response.data], { type: mimeTypes[format] || 'text/plain' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const ext = format === 'mp4' ? 'mp4' : format;
      a.download = `caption_export_${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      setRenderMessage(`Successfully exported ${format.toUpperCase()} file! Check your browser downloads.`);
    } catch (err) {
      console.error('Export failed', err);
      setRenderMessage(`Export operation for ${format.toUpperCase()} failed. Ensure server connection is active.`);
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for video/audio media upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleMediaUpload}
        accept="video/*,audio/*"
        className="hidden"
      />

      {/* Hidden file input for timed SRT/VTT subtitle import */}
      <input
        type="file"
        ref={srtFileInputRef}
        onChange={handleSrtFileUpload}
        accept=".srt,.vtt,.txt"
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
              Caption Studio <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2.5 py-0.5 rounded-full border border-indigo-500/30">CapCut & Reels Editor</span>
            </h1>
            <p className="text-xs text-slate-400">
              Upload custom video/audio for quick Whisper subtitles, import timed SRT files, re-segment word lengths, and export hardcoded MP4 & SRT.
            </p>
          </div>
        </div>

        {/* Media & Subtitle Ingestion Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Upload Video Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-md shadow-indigo-600/30"
            title="Upload fresh video to preview subtitles & transcribe"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Video</span>
          </button>

          {/* Quick Subtitles (Whisper) Button */}
          <button
            onClick={handleAutoTranscribe}
            disabled={transcribing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs hover:bg-emerald-600/30 transition disabled:opacity-50"
            title="Generate quick subtitles directly with local Whisper"
          >
            {transcribing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> : <Wand2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>Quick Subtitles (Whisper)</span>
          </button>

          {/* Import Timed SRT / VTT Button */}
          <button
            onClick={() => srtFileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs hover:bg-slate-800 transition"
            title="Import an existing timed .SRT or .VTT file to read & modify"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>Import Timed SRT/VTT</span>
          </button>

          {/* Break Transcript Granularity Dropdown */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
            <span className="text-[10px] text-slate-400 font-semibold px-1">Break Captions:</span>
            <button
              onClick={() => handleBreakTranscript('1-2')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${selectedGranularity === '1-2' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Split into 1-2 snappy words per subtitle (TikTok style)"
            >
              1-2 Words
            </button>
            <button
              onClick={() => handleBreakTranscript('3-4')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${selectedGranularity === '3-4' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Split into 3-4 words per subtitle (CapCut style)"
            >
              3-4 Words
            </button>
            <button
              onClick={() => handleBreakTranscript('sentence')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${selectedGranularity === 'sentence' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Group into full sentences"
            >
              Sentence
            </button>
          </div>

          {/* Import Text Studio Project Option */}
          <button
            onClick={handleImportTextStudioProject}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs hover:bg-slate-800 hover:text-slate-200 transition"
            title="Import active video & transcript from Text Studio"
          >
            <FolderInput className="w-3.5 h-3.5 text-amber-400" />
            <span>Text Studio</span>
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

          {/* Export Suite */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleExport('srt')}
              disabled={!!exportingFormat}
              className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs hover:bg-slate-800 transition"
              title="Export timed SRT file"
            >
              .SRT
            </button>
            <button
              onClick={() => handleExport('vtt')}
              disabled={!!exportingFormat}
              className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs hover:bg-slate-800 transition"
              title="Export WebVTT file"
            >
              .VTT
            </button>
            <button
              onClick={() => handleExport('txt')}
              disabled={!!exportingFormat}
              className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs hover:bg-slate-800 transition"
              title="Export plain text transcript"
            >
              .TXT
            </button>

            <button
              onClick={() => handleExport('mp4')}
              disabled={!!exportingFormat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-xs hover:opacity-90 transition shadow-lg shadow-indigo-600/30 ml-1"
            >
              {exportingFormat === 'mp4' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Film className="w-3.5 h-3.5" />}
              <span>Burn to MP4 (1:1 Quality)</span>
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
              activeSegment={activeSegment}
              subtitleStyle={style}
              onChangeStyle={setStyle}
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
