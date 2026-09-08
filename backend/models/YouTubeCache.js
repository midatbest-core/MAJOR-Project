const mongoose = require('mongoose');

const YouTubeAnalysisSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true, index: true },
  channel: { type: String },
  url: { type: String, required: true },
  niche: { type: String },
  topic: { type: String },

  metrics: {
    title: String,
    channel: String,
    views: Number,
    likes: Number,
    commentsCount: Number,
    duration: String,
    publishedDate: Date,
    engagementRate: Number,
    likeViewRatio: Number,
    commentViewRatio: Number
  },

  audienceIntelligence: {
    commentSentiment: {
      positive: Number,
      neutral: Number,
      negative: Number
    },
    lovedAspects: [String],
    dislikedAspects: [String],
    frequentlyRequested: [String],
    trendingTopics: [String]
  },

  successPatterns: {
    hookQuality: { score: Number, rating: String, recommendation: String },
    storytelling: { score: Number, rating: String, recommendation: String },
    pacing: { score: Number, rating: String, recommendation: String },
    keywordRichness: { score: Number, rating: String, recommendation: String },
    audienceEngagement: { score: Number, rating: String, recommendation: String }
  },

  inspiration: {
    videoIdeas: [String],
    hookIdeas: [String],
    titleSuggestions: [String],
    blueprint: {
      hook: String,
      problem: String,
      solution: String,
      demo: String,
      cta: String
    },
    creatorRecommendations: [String]
  },

  schemaVersion: { type: String, default: '1.0.0' }
}, { timestamps: true, collection: 'youtube_analysis' });

module.exports = mongoose.model('YouTubeCache', YouTubeAnalysisSchema);
