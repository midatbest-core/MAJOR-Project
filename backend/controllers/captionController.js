const Project = require('../models/Project');
const { generateSRT } = require('../utils/ffmpegHelper');
const { removeTempFile } = require('../services/storageCleanup');

/**
 * POST /api/captions/render
 * Exports SRT subtitle format or triggers FFmpeg video render
 */
const renderCaptions = async (req, res) => {
  try {
    const { projectId, transcript, subtitleStyle, exportFormat } = req.body;
    let targetTranscript = transcript;

    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        if (!targetTranscript || targetTranscript.length === 0) {
          targetTranscript = project.transcript;
        }
        if (subtitleStyle) {
          project.subtitleStyle = subtitleStyle;
          await project.save();
        }
      }
    }

    if (!targetTranscript || targetTranscript.length === 0) {
      return res.status(400).json({ success: false, error: 'No transcript segments available to render' });
    }

    const srtContent = generateSRT(targetTranscript);

    if (exportFormat === 'srt') {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="captions.srt"');
      return res.send(srtContent);
    }

    // Default response returning customized subtitle data & SRT string
    res.json({
      success: true,
      srtContent,
      style: subtitleStyle || {
        fontFamily: 'Inter',
        fontSize: 24,
        primaryColor: '#FFFFFF',
        position: 'bottom'
      },
      message: 'Captions generated successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  renderCaptions
};
