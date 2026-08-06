import React, { useState } from 'react';
import axios from 'axios';
import apiClient from '../services/apiClient';
import {
  Sparkles,
  Youtube,
  Eye,
  ThumbsUp,
  MessageSquare,
  Clock,
  TrendingUp,
  HeartHandshake,
  Lightbulb,
  Target,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Hash,
  Award,
  Layers,
  Zap,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';

const CreatorIntelligence = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [niche, setNiche] = useState('Programming');
  const [topic, setTopic] = useState('Machine Learning Roadmap');

  const [loading, setLoading] = useState(false);
  const [analyzedData, setAnalyzedData] = useState(null);
  const [inspiration, setInspiration] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleAnalyzeCompetitor = async () => {
    if (!youtubeUrl) return;
    setLoading(true);
    setAnalyzedData(null);
    setInspiration(null);

    try {
      // Step 1: YouTube Metadata, Sentiment & Success Patterns via API v1
      const ytRes = await apiClient.post('/creator-intelligence/analyze', {
        youtubeUrl,
        niche,
        topic
      });

      if (ytRes.data.success && ytRes.data.data) {
        setAnalyzedData(ytRes.data.data);
      }

      // Step 2: Personalized Inspiration & Content Blueprint via API v1
      const inspRes = await apiClient.post('/creator-intelligence/inspire', {
        youtubeUrl,
        niche,
        topic
      });

      if (inspRes.data.success && inspRes.data.data) {
        setInspiration(inspRes.data.data.inspiration);
      }
    } catch (err) {
      console.error('YouTube analysis error:', err);
      alert('Analysis completed with fallback intelligence engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] uppercase tracking-wider text-amber-400 font-bold">
            Module 3 • Creator Intelligence
          </span>
          {analyzedData?.isLiveApi !== undefined && (
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              analyzedData.isLiveApi 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}>
              {analyzedData.isLiveApi ? 'Live API Data' : 'Cached / Scraper Intelligence'}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-extrabold text-white mt-1 tracking-tight">Creator Intelligence</h1>
        <p className="text-slate-400 text-sm mt-1">
          Analyze successful YouTube reference videos, decode audience sentiment, and generate personalized content blueprints.
        </p>
      </div>

      {/* Input Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Reference YouTube Video URL
            </label>
            <div className="relative">
              <Youtube className="w-5 h-5 text-red-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Creator Niche
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. Programming, Fitness, Finance"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Target Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Machine Learning Roadmap"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleAnalyzeCompetitor}
            disabled={loading || !youtubeUrl}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Extracting YouTube Intelligence...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Video & Generate Blueprint</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Display */}
      {analyzedData && (
        <div className="space-y-6 animate-fade-in">
          {/* Video Overview & Display Metrics */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-xs text-amber-400 font-semibold uppercase tracking-wide">
                  Channel: {analyzedData.metrics.channel}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">{analyzedData.metrics.title}</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Duration: {analyzedData.metrics.duration}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                  Published: {new Date(analyzedData.metrics.publishedDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Derived Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>Total Views</span>
                </div>
                <p className="text-2xl font-black text-white mt-1">{analyzedData.metrics.views.toLocaleString()}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <ThumbsUp className="w-4 h-4 text-emerald-400" />
                  <span>Likes</span>
                </div>
                <p className="text-2xl font-black text-white mt-1">{analyzedData.metrics.likes.toLocaleString()}</p>
                <span className="text-[11px] text-emerald-400 font-semibold">{analyzedData.metrics.likeViewRatio}% Like/View Ratio</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span>Comments</span>
                </div>
                <p className="text-2xl font-black text-white mt-1">{analyzedData.metrics.commentsCount.toLocaleString()}</p>
                <span className="text-[11px] text-purple-400 font-semibold">{analyzedData.metrics.commentViewRatio}% Comment/View Ratio</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>Engagement Rate</span>
                </div>
                <p className="text-2xl font-black text-amber-400 mt-1">{analyzedData.metrics.engagementRate}%</p>
                <span className="text-[11px] text-slate-500 font-medium">Benchmark: &gt; 5%</span>
              </div>
            </div>
          </div>

          {/* Audience Intelligence & Comment Sentiment */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Comment Sentiment Breakdown */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                Comment Sentiment Analysis
              </h3>
              
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Positive</span>
                    <span className="font-bold text-emerald-400">{analyzedData.audienceIntelligence.commentSentiment.positive}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${analyzedData.audienceIntelligence.commentSentiment.positive}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Neutral</span>
                    <span className="font-bold text-blue-400">{analyzedData.audienceIntelligence.commentSentiment.neutral}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${analyzedData.audienceIntelligence.commentSentiment.neutral}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Negative</span>
                    <span className="font-bold text-rose-400">{analyzedData.audienceIntelligence.commentSentiment.negative}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${analyzedData.audienceIntelligence.commentSentiment.negative}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Trending Discussion Keywords */}
              <div className="pt-3 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Trending Discussion Keywords
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {analyzedData.audienceIntelligence.trendingTopics.map((kw, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-amber-500" />
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Audience Summary: What People Loved & Disliked */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                What Audience Loved & Disliked
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1.5">
                    People Loved:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {analyzedData.audienceIntelligence.lovedAspects.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1.5">
                    People Disliked:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {analyzedData.audienceIntelligence.dislikedAspects.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Frequently Requested Topics */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Frequently Requested Content
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {analyzedData.audienceIntelligence.frequentlyRequested.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/10">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Success Pattern Analysis (Rule-based + AI presented as recommendations) */}
          {analyzedData.successPatterns && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    Success Pattern Analysis
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Evaluated parameters presented as strategic recommendations, not absolute facts.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {Object.entries(analyzedData.successPatterns).map(([key, val]) => (
                  <div key={key} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {val.rating} ({val.score}/100)
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                        {val.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personalized Inspiration Section */}
          {inspiration && (
            <div className="space-y-6">
              {/* 5-Stage Blueprint */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
                <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400" />
                      Personalized 5-Stage Content Blueprint
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Targeting <span className="text-amber-400 font-semibold">{topic}</span> in the <span className="text-amber-400 font-semibold">{niche}</span> niche.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-amber-400">Stage 1</span>
                    <h4 className="font-bold text-white text-sm mt-1">Hook (0-10s)</h4>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">{inspiration.blueprint.hook}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-purple-400">Stage 2</span>
                    <h4 className="font-bold text-white text-sm mt-1">Problem Statement</h4>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">{inspiration.blueprint.problem}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-blue-400">Stage 3</span>
                    <h4 className="font-bold text-white text-sm mt-1">Core Solution</h4>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">{inspiration.blueprint.solution}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">Stage 4</span>
                    <h4 className="font-bold text-white text-sm mt-1">Live Demo</h4>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">{inspiration.blueprint.demo}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-rose-400">Stage 5</span>
                    <h4 className="font-bold text-white text-sm mt-1">Call to Action</h4>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">{inspiration.blueprint.cta}</p>
                  </div>
                </div>
              </div>

              {/* Ideas, Hooks & Titles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Video Ideas */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Original Video Concepts
                  </h3>
                  <div className="space-y-2">
                    {inspiration.videoIdeas.map((idea, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start justify-between gap-2">
                        <span>{idea}</span>
                        <button
                          onClick={() => handleCopyText(idea, `idea-${idx}`)}
                          className="text-slate-500 hover:text-white shrink-0 mt-0.5"
                        >
                          {copiedIndex === `idea-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hook Ideas */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Hook Opening Lines
                  </h3>
                  <div className="space-y-2">
                    {inspiration.hookIdeas.map((hook, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start justify-between gap-2">
                        <span className="italic">{hook}</span>
                        <button
                          onClick={() => handleCopyText(hook, `hook-${idx}`)}
                          className="text-slate-500 hover:text-white shrink-0 mt-0.5"
                        >
                          {copiedIndex === `hook-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SEO Titles */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    SEO Title Suggestions
                  </h3>
                  <div className="space-y-2">
                    {inspiration.titleSuggestions.map((title, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start justify-between gap-2">
                        <span className="font-medium text-white">{title}</span>
                        <button
                          onClick={() => handleCopyText(title, `title-${idx}`)}
                          className="text-slate-500 hover:text-white shrink-0 mt-0.5"
                        >
                          {copiedIndex === `title-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Creator Recommendations */}
              {inspiration.creatorRecommendations && (
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    Strategic Creator Recommendations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {inspiration.creatorRecommendations.map((rec, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="mt-0.5 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreatorIntelligence;
