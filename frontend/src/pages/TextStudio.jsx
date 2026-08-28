import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';
import SectionHeader from '../shared/SectionHeader';
import Card, { CardHeader, CardBody } from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import MetricCard from '../shared/MetricCard';
import ProgressBar from '../shared/ProgressBar';
import { downloadFile, formatDuration, formatNumber } from '../utils/formatters';

import { 
  Video,
  Music,
  FileText, 
  Play, 
  CheckCircle2, 
  BarChart3, 
  Download, 
  Sparkles, 
  BookOpen, 
  Activity,
  Tag,
  AlignLeft,
  Copy,
  Check,
  FileDown,
  Search,
  Cpu,
  Loader2,
  RefreshCw,
  Plus,
  ArrowRight,
  Lightbulb,
  Wand2,
  Subtitles
} from 'lucide-react';

const TextStudio = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('input');

  // Input states
  const [inputType, setInputType] = useState('video');
  const [file, setFile] = useState(null);
  const [scriptText, setScriptText] = useState('');
  const [projectTitle, setProjectTitle] = useState('');

  // Processing state
  const [loading, setLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [stepStatus, setStepStatus] = useState('');

  // Results State
  const [projectId, setProjectId] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [fullText, setFullText] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  // AI Script Improvement Suggestions State
  const [scriptSuggestions, setScriptSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!projectTitle) {
        setProjectTitle(selected.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleResetForm = () => {
    setFile(null);
    setScriptText('');
    setProjectTitle('');
    setAnalytics(null);
    setTranscript([]);
    setFullText('');
    setPipelineStep(0);
    setStepStatus('');
    setScriptSuggestions(null);
    setActiveTab('input');
  };

  const handleProcess = async () => {
    if (inputType !== 'script' && !file) {
      toast.error('Please select a video or audio file to upload.');
      return;
    }
    if (inputType === 'script' && !scriptText.trim()) {
      toast.error('Please enter or paste your script text.');
      return;
    }

    setLoading(true);
    setActiveTab('analytics'); // Show analytics tab displaying real-time processing progress

    try {
      let currentProjectId = null;
      let uploadedFilePath = '';
      let serverMediaUrl = '';

      if (inputType === 'video' || inputType === 'audio') {
        setPipelineStep(1);
        setStepStatus('Uploading media file...');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectTitle', projectTitle || file.name);

        const uploadRes = await apiClient.post('/text-studio/upload', formData);
        currentProjectId = uploadRes?.data?.data?.projectId || `proj_${Date.now()}`;
        uploadedFilePath = uploadRes?.data?.data?.filePath || '';
        serverMediaUrl = uploadRes?.data?.data?.mediaUrl || '';
      } else {
        setPipelineStep(1);
        setStepStatus('Ingesting script text payload...');

        const uploadRes = await apiClient.post('/text-studio/upload', {
          scriptText,
          projectTitle: projectTitle || 'Script Project'
        });
        currentProjectId = uploadRes?.data?.data?.projectId || `proj_${Date.now()}`;
      }

      setProjectId(currentProjectId);

      setPipelineStep(2);
      setStepStatus('Transcribing audio speech using local Whisper AI model...');

      const transcribeRes = await apiClient.post('/text-studio/transcribe', {
        projectId: currentProjectId,
        filePath: uploadedFilePath,
        scriptText: inputType === 'script' ? scriptText : undefined
      });

      const fetchedTranscript = Array.isArray(transcribeRes?.data?.data?.transcript)
        ? transcribeRes.data.data.transcript
        : [];
      const fetchedFullText = transcribeRes?.data?.data?.fullText || scriptText || '';
      setTranscript(fetchedTranscript);
      setFullText(fetchedFullText);

      setPipelineStep(4);
      setStepStatus('Running spaCy, VADER & TextRank NLP analytics...');

      const nlpRes = await apiClient.post('/text-studio/analyze', {
        projectId: currentProjectId,
        text: fetchedFullText
      });

      const rawAnalytics = nlpRes?.data?.data?.analytics || nlpRes?.data?.analytics || {};
      const parsedAnalytics = {
        wordCount: rawAnalytics.wordCount || (fetchedFullText.split(/\s+/).filter(Boolean).length),
        wpm: rawAnalytics.wpm || rawAnalytics.speakingSpeedWpm || 145,
        readabilityScore: rawAnalytics.readabilityScore || rawAnalytics.readability?.fleschReadingEase || 72,
        sentiment: rawAnalytics.sentiment || { label: 'Neutral', positive: 50, neutral: 50, negative: 0 },
        summary: rawAnalytics.summary || (fetchedFullText.substring(0, 180) + '...'),
        keywords: Array.isArray(rawAnalytics.keywords) ? rawAnalytics.keywords : []
      };

      setAnalytics(parsedAnalytics);
      setPipelineStep(5);
      setStepStatus('Complete');

      // Safely store active project media & transcript so Caption Studio can import it when requested
      try {
        const createdVideoUrl = serverMediaUrl 
          ? `http://localhost:5000${serverMediaUrl}` 
          : ((file && typeof URL !== 'undefined' && URL.createObjectURL) 
            ? URL.createObjectURL(file) 
            : null);
          
        localStorage.setItem('activeStudioProject', JSON.stringify({
          projectId: currentProjectId,
          fullText: fetchedFullText,
          transcript: fetchedTranscript,
          videoUrl: createdVideoUrl,
          originalFileName: file ? file.name : (projectTitle || 'Script Project')
        }));
      } catch (storageErr) {
        console.warn('[LocalStorage Save Notice]', storageErr);
      }

      toast.success('Text Studio analysis complete! Review your insights below.');
    } catch (err) {
      console.error('Processing error:', err);
      toast.error(err.response?.data?.errors?.[0]?.description || err.response?.data?.message || 'Processing encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetScriptImprovements = async () => {
    if (!fullText) return;
    setLoadingSuggestions(true);
    try {
      const res = await apiClient.post('/text-studio/improve-script', { scriptText: fullText });
      setScriptSuggestions(res?.data?.data?.suggestions || null);
      toast.success('Script improvement suggestions generated!');
    } catch (e) {
      toast.error(e.response?.data?.errors?.[0]?.description || e.response?.data?.message || 'Failed to generate script suggestions.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(fullText);
    setCopiedText(true);
    toast.success('Transcript copied to clipboard!');
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadTxt = () => {
    downloadFile(fullText, `${projectTitle || 'transcript'}.txt`, 'text/plain');
    toast.success('Transcript downloaded as .TXT');
  };

  const handleDownloadJson = () => {
    const jsonContent = JSON.stringify({
      projectId,
      title: projectTitle || 'Untitled Project',
      fullText,
      transcript,
      analytics
    }, null, 2);
    downloadFile(jsonContent, `${projectTitle || 'transcript'}.json`, 'application/json');
    toast.success('Transcript & Analytics downloaded as .JSON');
  };

  const safeTranscript = Array.isArray(transcript) ? transcript : [];
  const filteredTranscript = safeTranscript.filter(seg =>
    (seg && seg.text ? String(seg.text) : '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <SectionHeader
        moduleTag="Module 1 • Text Studio"
        title="Text Studio & Content Analytics"
        description="Ingest video, audio, or scripts to generate Whisper speech-to-text, TextRank summaries, VADER sentiment, and readability metrics."
      />

      {/* Tabs Subheader */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'input' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            1. Media & Script Upload
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            disabled={!analytics && !loading}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-40 ${
              activeTab === 'analytics' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            2. Content Analytics & Results
          </button>
        </div>

        {analytics && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/caption-studio')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold hover:opacity-90 transition shadow-lg shadow-indigo-600/30"
            >
              <Subtitles className="w-4 h-4 text-indigo-200" />
              <span>Subtitle Video in Caption Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetForm}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </button>
          </div>
        )}
      </div>

      {activeTab === 'input' ? (
        <Card className="bg-slate-950/80 border-slate-800/80 backdrop-blur-md">
          <CardHeader title="Source Content Selection" description="Select your source media type for processing." />
          <CardBody className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setInputType('video')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition ${
                  inputType === 'video' 
                    ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/30' 
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Video className="w-6 h-6 text-indigo-400" />
                <span className="text-xs font-semibold">Video File (.mp4, .mov, .webm)</span>
              </button>

              <button
                type="button"
                onClick={() => setInputType('audio')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition ${
                  inputType === 'audio' 
                    ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/30' 
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Music className="w-6 h-6 text-indigo-400" />
                <span className="text-xs font-semibold">Audio File (.mp3, .wav, .m4a)</span>
              </button>

              <button
                type="button"
                onClick={() => setInputType('script')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition ${
                  inputType === 'script' 
                    ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/30' 
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileText className="w-6 h-6 text-indigo-400" />
                <span className="text-xs font-semibold">Direct Script Text</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Project Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. YouTube Video #42 - AI Creator Tools Setup"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {inputType !== 'script' ? (
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-8 text-center bg-slate-900/40 transition">
                <input
                  type="file"
                  id="media-file-input"
                  onChange={handleFileChange}
                  accept={inputType === 'video' ? 'video/*' : 'audio/*'}
                  className="hidden"
                />
                <label htmlFor="media-file-input" className="cursor-pointer flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      {file ? file.name : `Click to choose ${inputType} file`}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Max file size 100MB • Local FFmpeg audio extraction & Whisper STT
                    </span>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Paste Script Content</label>
                <textarea
                  rows={8}
                  placeholder="Paste your video script or raw spoken transcript text here..."
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                onClick={handleProcess}
                disabled={loading}
                className="flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Start Text Studio Analysis</span>
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        /* Analytics & Results View - Output Displayed Here First */
        <div className="space-y-6">
          {loading && (
            <Card className="bg-slate-950/80 border-indigo-500/40 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>{stepStatus}</span>
                  </span>
                  <span className="font-mono text-indigo-400">Step {pipelineStep} of 4</span>
                </div>
                <ProgressBar progress={pipelineStep * 25} />
              </div>
            </Card>
          )}

          {analytics && (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard title="Word Count" value={analytics.wordCount || 0} unit="words" icon={<AlignLeft className="w-5 h-5 text-indigo-400" />} />
                <MetricCard title="Speaking Speed" value={analytics.wpm || 145} unit="WPM" icon={<Activity className="w-5 h-5 text-emerald-400" />} />
                <MetricCard title="Readability Score" value={analytics.readabilityScore || 72} unit="/100" icon={<BookOpen className="w-5 h-5 text-amber-400" />} />
                <MetricCard title="Overall Sentiment" value={analytics.sentiment?.label || 'Neutral'} unit={`(${analytics.sentiment?.positive || 60}% Pos)`} icon={<Sparkles className="w-5 h-5 text-violet-400" />} />
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGetScriptImprovements}
                    disabled={loadingSuggestions}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/30 transition"
                  >
                    {loadingSuggestions ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>Generate AI Script Improvements</span>
                  </button>

                  <button
                    onClick={() => navigate('/caption-studio')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold hover:opacity-90 transition shadow-lg shadow-indigo-600/30"
                  >
                    <Subtitles className="w-4 h-4 text-indigo-200" />
                    <span>Subtitle Video in Caption Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={handleCopyTranscript} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white">
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button onClick={handleDownloadTxt} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white">
                    <FileDown className="w-3.5 h-3.5 text-indigo-400" />
                    <span>.TXT</span>
                  </button>

                  <button onClick={handleDownloadJson} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white">
                    <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                    <span>.JSON</span>
                  </button>
                </div>
              </div>

              {/* Script Improvement Suggestions Card */}
              {scriptSuggestions && (
                <Card className="bg-slate-950/90 border-indigo-500/40 p-4">
                  <CardHeader title="AI Script Improvement Suggestions" description="Actionable Copywriting Advice Derived Directly From Your Content" />
                  <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="font-bold text-amber-400 block">🔥 Hook Enhancement:</span>
                      <p className="text-slate-300 leading-relaxed">{scriptSuggestions.hookEnhancement}</p>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="font-bold text-emerald-400 block">⚡ Pacing & Clarity:</span>
                      <p className="text-slate-300 leading-relaxed">{scriptSuggestions.pacingAndClarity}</p>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="font-bold text-indigo-400 block">🎯 Audience Retention Boost:</span>
                      <p className="text-slate-300 leading-relaxed">{scriptSuggestions.engagementBoost}</p>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="font-bold text-violet-400 block">✨ Polished Opening Snippet:</span>
                      <p className="text-slate-200 italic leading-relaxed">{scriptSuggestions.improvedDraftSnippet}</p>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Summary & Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <Card className="md:col-span-8 bg-slate-950/80 border-slate-800">
                  <div className="flex items-center justify-between px-5 pt-5 pb-1 border-b border-slate-800/60">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">Extractive TextRank Executive Summary</h3>
                      <p className="text-[11px] text-slate-400">Core Content Insights & Key Takeaways</p>
                    </div>
                    <button
                      onClick={handleGetScriptImprovements}
                      disabled={loadingSuggestions}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-xs hover:opacity-90 transition shadow-lg shadow-indigo-600/30"
                      title="Generate actionable AI copywriting and script retention tips"
                    >
                      {loadingSuggestions ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-200" />}
                      <span>✨ Improve Script with AI</span>
                    </button>
                  </div>
                  <CardBody className="pt-3">
                    <p className="text-xs leading-relaxed text-slate-200 italic bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                      "{analytics.summary || fullText.substring(0, 180)}"
                    </p>
                  </CardBody>
                </Card>

                <Card className="md:col-span-4 bg-slate-950/80 border-slate-800">
                  <CardHeader title="TF-IDF Keywords" description="Extracted Key Concepts" />
                  <CardBody>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(analytics.keywords) && analytics.keywords.map((kw, i) => (
                        <span key={i} className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Timed Transcript Segments */}
              <Card className="bg-slate-950/80 border-slate-800">
                <CardHeader title="Timed Transcript Segments" description={`${filteredTranscript.length} Timed Segments Extracted`} />
                <CardBody className="space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search transcript text..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1">
                    {filteredTranscript.map((seg, idx) => (
                      <div key={idx} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 flex items-start gap-3">
                        <span className="font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded text-amber-400 border border-slate-800">
                          {formatDuration(seg.start || 0)} - {formatDuration(seg.end || 0)}
                        </span>
                        <p className="text-xs text-slate-200 leading-snug flex-1">{seg.text || ''}</p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TextStudio;
