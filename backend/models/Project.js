const mongoose = require('mongoose');

const SubtitleStyleSchema = new mongoose.Schema({
  fontFamily: { type: String, default: 'Inter' },
  fontSize: { type: Number, default: 24 },
  primaryColor: { type: String, default: '#FFFFFF' },
  backgroundColor: { type: String, default: '#00000080' },
  strokeColor: { type: String, default: '#000000' },
  shadowColor: { type: String, default: '#00000066' },
  position: { type: String, enum: ['top', 'center', 'bottom'], default: 'bottom' }
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true, default: 'Untitled Project' },
  inputType: { type: String, enum: ['video', 'audio', 'script'], default: 'video' },
  originalFileName: { type: String },
  fileSize: { type: Number },
  status: { type: String, enum: ['uploaded', 'transcribing', 'transcribed', 'analyzed', 'completed'], default: 'uploaded' },
  
  // Timed Transcript
  transcript: [{
    start: Number,
    end: Number,
    text: String
  }],
  fullText: { type: String, default: '' },
  
  // Deterministic NLP Analytics
  analytics: {
    summary: { type: String, default: '' },
    keywords: [{ type: String }],
    sentiment: {
      score: { type: Number, default: 0 },
      label: { type: String, default: 'Neutral' },
      positive: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      negative: { type: Number, default: 0 }
    },
    readabilityScore: { type: Number, default: 0 },
    wpm: { type: Number, default: 0 },
    wordCount: { type: Number, default: 0 }
  },
  
  // Subtitle Styling & Config
  subtitleStyle: { type: SubtitleStyleSchema, default: () => ({}) },
  
  // Optional Generative AI Outputs
  aiSuggestions: {
    titles: [{ type: String }],
    description: { type: String, default: '' },
    hashtags: [{ type: String }],
    hooks: [{ type: String }]
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
