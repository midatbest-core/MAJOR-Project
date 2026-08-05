import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Youtube, Eye, ThumbsUp, MessageSquare, Clock, TrendingUp, HeartHandshake, Lightbulb, Target, CheckCircle2 } from 'lucide-react';

const CreatorIntelligence = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [niche, setNiche] = useState('Programming');
  const [topic, setTopic] = useState('Machine Learning Roadmap');

  const [loading, setLoading] = useState(false);
  const [analyzedData, setAnalyzedData] = useState(null);
  const [inspiration, setInspiration] = useState(null);

  const handleAnalyzeCompetitor = async () => {
    if (!youtubeUrl) return;
    setLoading(true);
    try {
      // Step 1: YouTube Metadata & Audience Sentiment NLP
      const ytRes = await axios.post('/api/youtube/analyze', {
        youtubeUrl,
        niche,
        topic
      });

      setAnalyzedData(ytRes.data.data);

      // Step 2: LLM Personalized Inspiration & Blueprint
      const inspRes = await axios.post('/api/creator/inspire', {
        youtubeUrl,
        niche,
        topic
      });

      setInspiration(inspRes.data.inspiration);
    } catch (err) {
      console.error('YouTube analysis error:', err);
      alert('Competitor analysis fallback active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">Module 3 • Stage 4</span>
        <h1 className="text-3xl font-bold text-white mt-1">Creator Intelligence</h1>
        <p className="text-slate-400 text-sm mt-1">Analyze successful YouTube videos, decode comment sentiment, and generate personalized video blueprints.</p>
      </div>

      {/* Input Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Reference YouTube URL</label>
            <div className="relative">
              <Youtube className="w-5 h-5 text-red-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Creator Niche</label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. Programming / Tech"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Target Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Machine Learning Roadmap"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
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
                <span>Extracting YouTube Insights...</span>
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
        <div className="space-y-6">
          {/* Video Overview & Metrics */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-xs text-amber-400 font-semibold">{analyzedData.metrics.channel}</span>
                <h2 className="text-xl font-bold text-white mt-0.5">{analyzedData.metrics.title}</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                Duration: {analyzedData.metrics.duration}
              </span>
            </div>

            {/* Derived Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>Total Views</span>
                </div>
                <p className="text-2xl font-extrabold text-white mt-1">{analyzedData.metrics.views.toLocaleString()}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <ThumbsUp className="w-4 h-4 text-emerald-400" />
                  <span>Likes</span>
                </div>
                <p className="text-2xl font-extrabold text-white mt-1">{analyzedData.metrics.likes.toLocaleString()}</p>
                <span className="text-[11px] text-emerald-400 font-medium">{analyzedData.metrics.likeViewRatio}% Like/View</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span>Comments</span>
                </div>
                <p className="text-2xl font-extrabold text-white mt-1">{analyzedData.metrics.commentsCount.toLocaleString()}</p>
                <span className="text-[11px] text-purple-400 font-medium">{analyzedData.metrics.commentViewRatio}% Comment/View</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>Engagement Rate</span>
                </div>
                <p className="text-2xl font-extrabold text-amber-400 mt-1">{analyzedData.metrics.engagementRate}%</p>
                <span className="text-[11px] text-slate-500">Industry Avg: 4.5%</span>
              </div>
            </div>
          </div>

          {/* Audience Intelligence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                What Audience Loved
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                {analyzedData.audienceIntelligence.lovedAspects.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Frequently Requested / Disliked
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                {analyzedData.audienceIntelligence.frequentlyRequested.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/10">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Personalized Inspiration & 5-Stage Blueprint */}
          {inspiration && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="border-b border-slate-800/80 pb-3">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Personalized 5-Stage Content Blueprint
                </h3>
                <p className="text-slate-400 text-xs mt-1">Generated specifically for {niche} creators targeting "{topic}".</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-brand-400">Stage 1</span>
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
                  <span className="text-[10px] uppercase font-bold text-amber-400">Stage 5</span>
                  <h4 className="font-bold text-white text-sm mt-1">Call to Action</h4>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">{inspiration.blueprint.cta}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreatorIntelligence;
