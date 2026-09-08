const mongoose = require('mongoose');
const { generateAnalysisId } = require('../utils/idGenerator');

const CreatorAnalysisSchema = new mongoose.Schema({
  analysisId: { type: String, required: true, unique: true, default: generateAnalysisId },
  projectId: { type: String, required: true, index: true },
  
  transcript: { type: String, default: '' },
  summary: { type: String, default: '' },
  keywords: [{ type: String }],
  
  sentiment: {
    label: { type: String, default: 'Neutral' },
    score: { type: Number, default: 0.5 }
  },
  
  statistics: {
    wordCount: { type: Number, default: 0 },
    sentenceCount: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    speakingSpeed: { type: Number, default: 145 }
  },
  
  readability: {
    score: { type: Number, default: 72.4 },
    grade: { type: String, default: '8th Grade (Easy to Understand)' }
  },
  
  metadata: {
    language: { type: String, default: 'English' },
    createdAt: { type: Date, default: Date.now }
  },
  
  schemaVersion: { type: String, default: '1.0.0' }
}, { timestamps: true, collection: 'creator_analysis' });

module.exports = mongoose.model('CreatorAnalysis', CreatorAnalysisSchema);
