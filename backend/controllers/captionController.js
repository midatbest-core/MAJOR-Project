const Project = require('../models/Project');
const PipelineOrchestrator = require('../services/orchestrator');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * Feature Module: Caption Studio
 * Standardized API v1 Controller conforming to Chapter 3 Contracts
 */

/**
 * POST /api/v1/caption-studio/render
 */
const renderCaptions = async (req, res) => {
  try {
    const { projectId, transcript, subtitleStyle, exportFormat, videoPath } = req.body;
    let targetTranscript = transcript;

    if (projectId) {
      const project = await Project.findOne({ projectId });
      if (project) {
        if (!targetTranscript || targetTranscript.length === 0) {
          targetTranscript = project.transcript;
        }
      }
    }

    if (!targetTranscript || targetTranscript.length === 0) {
      targetTranscript = [
        { start: 0, end: 5, text: "Welcome to AI Creator Dashboard" },
        { start: 5, end: 10, text: "Automatic caption editing and rendering" }
      ];
    }

    const srtContent = PipelineOrchestrator.engines().RenderingEngine.generateSrtString(targetTranscript);

    if (exportFormat === 'srt') {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="captions.srt"');
      return res.send(srtContent);
    }

    if (exportFormat === 'mp4') {
      const renderRes = await PipelineOrchestrator.executeCaptionRenderPipeline(
        videoPath || 'sample_input.mp4',
        targetTranscript,
        subtitleStyle || {}
      );

      return sendSuccess(res, {
        srtContent,
        exportFormat: 'mp4',
        burnedVideoUrl: renderRes.videoUrl,
        isFallback: renderRes.isFallback
      }, 'FFmpeg subtitle burn-in processed successfully');
    }

    return sendSuccess(res, {
      srtContent,
      style: subtitleStyle || {
        font: 'Inter',
        size: 24,
        color: '#FFFFFF',
        alignment: 'Bottom Center'
      }
    }, 'Captions rendered successfully');
  } catch (err) {
    return sendError(res, 'Caption rendering failed', err, 500);
  }
};

module.exports = {
  renderCaptions
};
