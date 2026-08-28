const PipelineOrchestrator = require('../services/orchestrator');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Feature Module: Creator Intelligence
 * Standardized API v1 Controller conforming to Chapter 3 Contracts
 */

/**
 * POST /api/v1/creator-intelligence/analyze
 */
const analyzeYouTubeVideo = async (req, res) => {
  try {
    const { youtubeUrl, niche = 'Programming', topic = 'Machine Learning' } = req.body;
    const options = {
      geminiApiKey: req.headers['x-gemini-key'],
      youtubeApiKey: req.headers['x-youtube-key']
    };

    if (!youtubeUrl) {
      return sendError(res, 'YouTube URL is required', [{ field: 'youtubeUrl', code: 'REQUIRED', description: 'Reference YouTube URL is missing' }], 400);
    }

    const { source, data } = await PipelineOrchestrator.executeYouTubeAnalysisPipeline(youtubeUrl, niche, topic, options);

    return sendSuccess(res, { source, ...data }, 'YouTube video analysis completed successfully');
  } catch (err) {
    console.error('[CreatorIntelligenceController analyze Error]', err);
    return sendError(res, 'Failed to analyze YouTube video', err, 500);
  }
};

/**
 * POST /api/v1/creator-intelligence/inspire
 */
const generateInspiration = async (req, res) => {
  try {
    const { youtubeUrl, niche = 'Programming', topic = 'Machine Learning Roadmap' } = req.body;
    const options = {
      geminiApiKey: req.headers['x-gemini-key'],
      youtubeApiKey: req.headers['x-youtube-key']
    };

    const inspiration = await PipelineOrchestrator.executeCreatorInspirationPipeline(youtubeUrl, niche, topic, options);

    return sendSuccess(res, { inspiration }, 'Personalized inspiration generated successfully');
  } catch (err) {
    console.error('[CreatorIntelligenceController inspire Error]', err);
    return sendError(res, 'Failed to generate inspiration', err, 500);
  }
};

/**
 * DELETE /api/v1/creator-intelligence/cache/:videoId
 */
const clearCache = async (req, res) => {
  try {
    const { videoId } = req.params;
    if (videoId) {
      await require('../models/YouTubeCache').deleteOne({ videoId });
    }
    return sendSuccess(res, null, 'Cache cleared successfully');
  } catch (err) {
    console.error('[CreatorIntelligenceController clearCache Error]', err);
    return sendError(res, 'Failed to clear cache', err, 500);
  }
};

module.exports = {
  analyzeYouTubeVideo,
  generateInspiration,
  clearCache
};
