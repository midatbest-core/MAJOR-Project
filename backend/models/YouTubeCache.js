const mongoose = require('mongoose');

const YouTubeCacheSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true, index: true },
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
  }
}, { timestamps: true });

module.exports = mongoose.model('YouTubeCache', YouTubeCacheSchema);
