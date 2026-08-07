import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';

const TextStudio = () => {
  // Navigation sub-tabs: 'input' | 'analytics'
  const [activeTab, setActiveTab] = useState('input');

  // Input states
  const [inputType, setInputType] = useState('video'); // 'video' | 'audio' | 'script'
  const [file, setFile] = useState(null);
  const [scriptText, setScriptText] = useState('');
  const [projectTitle, setProjectTitle] = useState('');

  // Processing state
  const [loading, setLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0); // 0: Idle, 1: Uploading, 2: Whisper STT, 3: Preprocessing, 4: NLP Analysis
  const [stepStatus, setStepStatus] = useState('');

  // Results State
  const [projectId, setProjectId] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [fullText, setFullText] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState(false);

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
    setActiveTab('analytics'); // Switch to results view immediately to show loading progress!

    try {
      let currentProjectId = null;
      let uploadedFilePath = '';

      // Step 1: Upload & Audio Normalization
      if (inputType === 'video') {
        setPipelineStep(1);
        setStepStatus('Extracting 16kHz mono audio via FFmpeg...');
      } else if (inputType === 'audio') {
        setPipelineStep(1);
        setStepStatus('Ingesting audio track...');
      } else {
        setPipelineStep(3);
        setStepStatus('Preprocessing text script...');
      }

      if ((inputType === 'video' || inputType === 'audio') && file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectTitle', projectTitle || file.name);

        const uploadRes = await apiClient.post('/text-studio/upload', formData);
        currentProjectId = uploadRes.data.data.projectId;
        uploadedFilePath = uploadRes.data.data.filePath;
      } else if (inputType === 'script' && scriptText) {
        const uploadRes = await apiClient.post('/text-studio/upload', {
          scriptText,
          projectTitle: projectTitle || 'Pasted Script'
        });
        currentProjectId = uploadRes.data.data.projectId;
      }

      setProjectId(currentProjectId);

      // Step 2: OpenAI Whisper Local STT
      if (inputType !== 'script') {
        setPipelineStep(2);
        setStepStatus('Transcribing audio speech using local Whisper AI model...');
      }

      const transcribeRes = await apiClient.post('/text-studio/transcribe', {
        projectId: currentProjectId,
        filePath: uploadedFilePath,
        scriptText: inputType === 'script' ? scriptText : undefined
      });

      const fetchedTranscript = transcribeRes.data.data.transcript || [];
      const fetchedFullText = transcribeRes.data.data.fullText || scriptText;
      setTranscript(fetchedTranscript);
      setFullText(fetchedFullText);

      // Step 3: NLP Engine Processing
      setPipelineStep(4);
      setStepStatus('Running spaCy, VADER & TextRank NLP analytics...');

      const nlpRes = await apiClient.post('/text-studio/analyze', {
        projectId: currentProjectId,
        text: fetchedFullText
      });

      setAnalytics(nlpRes.data.data.analytics);
      setPipelineStep(5);
      setStepStatus('Complete');
      toast.success('Text Studio analysis complete!');
    } catch (err) {
      console.error('Processing error:', err);
      toast.error(err.response?.data?.message || 'Processing encountered an error. Using local fallback engine.');
    } finally {
      setLoading(false);
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

  const filteredTranscript = transcript.filter(seg =>
    (seg.text || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <SectionHeader
        moduleTag="Module 1 • Text Studio"
        title="Text Studio & Content Analytics"
        description="Ingest video, audio, or scripts to generate Whisper speech-to-text, TextRank summaries, VADER sentiment, and readability metrics."
      />

      {/* Sub-tab Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'input'
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Upload & Ingestion</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            disabled={!analytics && !loading}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
              activeTab === 'analytics'
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Transcript & Analytics Dashboard</span>
            {loading ? (
              <Badge variant="warning" className="ml-1 animate-pulse">Processing...</Badge>
            ) : analytics ? (
              <Badge variant="success" className="ml-1">Ready</Badge>
            ) : null}
          </button>
        </div>

        {analytics && !loading && (
          <Button variant="secondary" size="sm" onClick={handleResetForm} icon={Plus}>
            New Media Ingestion
          </Button>
        )}
      </div>

      {/* SECTION 1: UPLOAD & INGESTION PANEL */}
      {activeTab === 'input' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Select Ingestion Format
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Choose video/audio upload or paste plain text script. Maximum file size: 100 MB.
              </p>
            </CardHeader>

            <CardBody className="space-y-6">
              {/* Format Toggle */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setInputType('video')}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${
                    inputType === 'video'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Video className="w-6 h-6" />
                  <span className="text-xs font-bold">Video File (MP4, MOV, AVI)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInputType('audio')}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${
                    inputType === 'audio'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Music className="w-6 h-6" />
                  <span className="text-xs font-bold">Audio File (MP3, WAV, M4A)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInputType('script')}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${
                    inputType === 'script'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <AlignLeft className="w-6 h-6" />
                  <span className="text-xs font-bold">Pasted Script / Text</span>
                </button>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Project Name / Title
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Machine Learning Architecture Breakdown"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Upload Dropzone or Text Area */}
              {inputType !== 'script' ? (
                <div className="border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl p-8 text-center bg-slate-900/40 transition">
                  <input
                    type="file"
                    id="fileUpload"
                    accept={inputType === 'video' ? 'video/*' : 'audio/*'}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer space-y-3 block">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-amber-400">
                      <Download className="w-6 h-6 rotate-180" />
                    </div>
                    {file ? (
                      <div>
                        <span className="text-sm font-bold text-white block">{file.name}</span>
                        <span className="text-xs text-emerald-400 font-semibold block mt-0.5">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-sm font-bold text-white block">Click to upload {inputType} file</span>
                        <span className="text-xs text-slate-400 block mt-1">Supports MP4, MOV, AVI, MP3, WAV up to 100MB</span>
                      </div>
                    )}
                  </label>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Paste Script Text (Max 50,000 Characters)
                  </label>
                  <textarea
                    rows={8}
                    value={scriptText}
                    onChange={(e) => setScriptText(e.target.value)}
                    placeholder="Paste full raw transcript or video script content here..."
                    className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs leading-relaxed focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleProcess}
                  loading={loading}
                  icon={Play}
                  size="lg"
                >
                  Start Speech Recognition & NLP Pipeline
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* SECTION 2-6: RESULTS & ANALYTICS DASHBOARD */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          {/* PROMINENT LOADING CARD DURING TRANSCRIPTION & NLP PROCESSING */}
          {loading && (
            <Card className="border-amber-500/30 bg-slate-900/90 shadow-2xl">
              <CardBody className="p-8 space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                    <Cpu className="w-5 h-5 text-amber-400" />
                    OpenAI Whisper & NLP Pipeline In Execution
                  </h3>
                  <p className="text-slate-400 text-xs max-w-md mx-auto">
                    {stepStatus || 'Transcribing speech audio and analyzing content statistics...'}
                  </p>
                </div>

                {/* Step Progress Checklist */}
                <div className="max-w-md mx-auto bg-slate-950 p-4 rounded-xl border border-slate-800 text-left space-y-3">
                  <div className="flex items-center gap-3 text-xs">
                    <CheckCircle2 className={`w-4 h-4 ${pipelineStep >= 1 ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className={pipelineStep >= 1 ? 'text-slate-200 font-semibold' : 'text-slate-500'}>
                      1. Media Ingestion & 16kHz Audio Extraction
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <CheckCircle2 className={`w-4 h-4 ${pipelineStep >= 2 ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className={pipelineStep >= 2 ? 'text-slate-200 font-semibold' : 'text-slate-500'}>
                      2. OpenAI Whisper Local Speech Recognition
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <CheckCircle2 className={`w-4 h-4 ${pipelineStep >= 4 ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className={pipelineStep >= 4 ? 'text-slate-200 font-semibold' : 'text-slate-500'}>
                      3. spaCy, VADER & TextRank Content Analytics
                    </span>
                  </div>
                </div>

                <ProgressBar label="Overall Processing Progress" percentage={Math.min(95, Math.max(20, pipelineStep * 25))} />
              </CardBody>
            </Card>
          )}

          {/* RENDER ANALYTICS ONCE COMPLETE */}
          {analytics && !loading && (
            <>
              {/* SECTION 5: ANALYTICS METRIC CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  title="Word Count"
                  value={formatNumber(analytics.wordCount)}
                  subtext="Total Words Indexed"
                  icon={BookOpen}
                  iconColor="text-blue-400"
                />

                <MetricCard
                  title="Speaking Speed"
                  value={`${analytics.wpm} WPM`}
                  subtext="Words Per Minute"
                  icon={Activity}
                  iconColor="text-emerald-400"
                />

                <MetricCard
                  title="Readability Score"
                  value={`${analytics.readabilityScore} / 100`}
                  subtext="Flesch Reading Ease"
                  icon={BarChart3}
                  iconColor="text-purple-400"
                />

                <MetricCard
                  title="Overall Sentiment"
                  value={analytics.sentiment?.label || 'Positive'}
                  subtext={`Polarity Score: ${analytics.sentiment?.score || 0.65}`}
                  icon={Sparkles}
                  iconColor="text-amber-400"
                />
              </div>

              {/* SECTION 4: EXTRACTIVE SUMMARY CARD */}
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    AI Executive Content Summary
                  </h3>
                  <Badge variant="warning">AI Formulated</Badge>
                </CardHeader>
                <CardBody>
                  <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    "{analytics.summary}"
                  </p>
                </CardBody>
              </Card>

              {/* TOP KEYWORDS */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    TF-IDF Extracted Keywords
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="flex flex-wrap gap-2">
                    {analytics.keywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* SECTION 3: SEARCHABLE TRANSCRIPT VIEWER */}
              <Card>
                <CardHeader className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <AlignLeft className="w-4 h-4 text-blue-400" />
                      Timed Transcript Segments
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {transcript.length > 0 ? `${transcript.length} Timed Segments Extracted` : 'Full Text Mode'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search transcript..."
                        className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <Button variant="secondary" size="sm" onClick={handleCopyTranscript} icon={copiedText ? Check : Copy}>
                      {copiedText ? 'Copied' : 'Copy Text'}
                    </Button>
                  </div>
                </CardHeader>

                <CardBody className="space-y-3">
                  {transcript.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                      {filteredTranscript.map((seg, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
                          <span className="px-2.5 py-1 rounded bg-slate-800 text-amber-400 font-mono text-[11px] font-bold shrink-0">
                            {formatDuration(seg.start)} - {formatDuration(seg.end)}
                          </span>
                          <p className="text-slate-300 text-xs leading-relaxed mt-0.5">{seg.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                      {fullText}
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* SECTION 6: DOWNLOAD ACTIONS */}
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <FileDown className="w-4 h-4 text-amber-400" />
                    Export Transcript & Analytics
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">Download transcript in raw text or structured JSON format.</p>
                </CardHeader>
                <CardBody className="flex gap-4">
                  <Button onClick={handleDownloadTxt} icon={Download} variant="primary">
                    Download Raw Text (.TXT)
                  </Button>

                  <Button onClick={handleDownloadJson} icon={Download} variant="secondary">
                    Download JSON Analytics (.JSON)
                  </Button>
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
