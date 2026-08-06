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

    if (!youtubeUrl) {
      return sendError(res, 'YouTube URL is required', [{ field: 'youtubeUrl', code: 'REQUIRED', description: 'Reference YouTube URL is missing' }], 400);
    }

    const { source, data } = await PipelineOrchestrator.executeYouTubeAnalysisPipeline(youtubeUrl, niche, topic);

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

    const inspiration = await PipelineOrchestrator.executeCreatorInspirationPipeline(youtubeUrl, niche, topic);

    return sendSuccess(res, { inspiration }, 'Personalized inspiration generated successfully');
  } catch (err) {
    console.error('[CreatorIntelligenceController inspire Error]', err);
    return sendError(res, 'Failed to generate inspiration', err, 500);
  }
};

module.exports = {
  analyzeYouTubeVideo,
  generateInspiration
};
