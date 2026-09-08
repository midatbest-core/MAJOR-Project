const mongoose = require('mongoose');
const { generateProjectId } = require('../utils/idGenerator');

const ProjectSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true, default: generateProjectId },
  projectName: { type: String, required: true, default: 'Untitled Project' },
  status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'FAILED', 'ARCHIVED'], default: 'ACTIVE' },
  processingState: {
    type: String,
    enum: ['UPLOADED', 'VALIDATING', 'EXTRACTING_AUDIO', 'TRANSCRIBING', 'ANALYZING', 'READY', 'FAILED'],
    default: 'UPLOADED'
  },
  mediaType: { type: String, enum: ['video', 'audio', 'script'], default: 'video' },
  originalFileName: { type: String },
  fileSize: { type: Number },

  analysisId: { type: String },
  captionId: { type: String },
  ideaId: { type: String },

  transcript: [{
    start: Number,
    end: Number,
    text: String
  }],
  fullText: { type: String, default: '' },

  schemaVersion: { type: String, default: '1.0.0' }
}, { timestamps: true, collection: 'projects' });

module.exports = mongoose.model('Project', ProjectSchema);
