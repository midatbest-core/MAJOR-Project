const mongoose = require('mongoose');
const { generateCaptionId } = require('../utils/idGenerator');

const SubtitleBlockSchema = new mongoose.Schema({
  text: { type: String, required: true },
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  styleId: { type: String, default: 'default_style' }
}, { _id: false });

const CaptionStyleSchema = new mongoose.Schema({
  font: { type: String, default: 'Inter' },
  size: { type: Number, default: 24 },
  color: { type: String, default: '#FFFFFF' },
  stroke: { type: String, default: '#000000' },
  shadow: { type: String, default: '#00000080' },
  alignment: { type: String, default: 'Bottom Center' }
}, { _id: false });

const CaptionProjectSchema = new mongoose.Schema({
  captionId: { type: String, required: true, unique: true, default: generateCaptionId },
  projectId: { type: String, required: true, index: true },
  
  subtitles: [SubtitleBlockSchema],
  style: { type: CaptionStyleSchema, default: () => ({}) },
  
  schemaVersion: { type: String, default: '1.0.0' }
}, { timestamps: true, collection: 'captions' });

module.exports = mongoose.model('CaptionProject', CaptionProjectSchema);
