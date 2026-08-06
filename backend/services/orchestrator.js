const ProcessingEngine = require('./engines/processingEngine');
const NlpEngine = require('./engines/nlpEngine');
const CreatorAiEngine = require('./engines/creatorAiEngine');
const AnalyticsEngine = require('./engines/analyticsEngine');
const RenderingEngine = require('./engines/renderingEngine');

/**
 * Pipeline Orchestration Layer (Layer 3)
 * Coordinates workflows between Shared Engines (Processing, NLP, Creator AI, Analytics, Rendering).
 * Business controllers delegate pipeline operations to this orchestrator.
 */
class PipelineOrchestrator {
  /**
   * Pipeline 1: Text Studio Media Upload & Speech-to-Text Workflow
   */
  static async executeTextStudioPipeline(file, textInput) {
    let audioPath = null;
    let transcriptText = textInput || '';

    if (file) {
      ProcessingEngine.validateFile(file);
      audioPath = await ProcessingEngine.extractAudio(file.path);
    }

    // Run NLP Engine for transcript analysis
    const nlpData = await NlpEngine.analyzeText(transcriptText);

    // Clean up temporary audio file asynchronously
    if (audioPath && audioPath !== file?.path) {
      ProcessingEngine.cleanupFile(audioPath);
    }

    return {
      transcript: transcriptText,
      keywords: nlpData.keywords,
      summary: nlpData.summary,
      sentiment: nlpData.sentiment,
      readability: nlpData.readability,
      speakingSpeedWpm: nlpData.speakingSpeedWpm
    };
  }

  /**
   * Pipeline 2: Creator Intelligence YouTube Analysis & Inspiration Workflow
   */
  static async executeYouTubeAnalysisPipeline(youtubeUrl, niche, topic) {
    return await AnalyticsEngine.analyzeYouTubeVideo(youtubeUrl, niche, topic);
  }

  static async executeCreatorInspirationPipeline(youtubeUrl, niche, topic) {
    return await CreatorAiEngine.generateInspiration(youtubeUrl, niche, topic);
  }

  /**
   * Pipeline 3: Caption Studio Rendering Workflow
   */
  static async executeCaptionRenderPipeline(videoPath, subtitles, styleConfig) {
    return await RenderingEngine.renderBurnedVideo(videoPath, subtitles, styleConfig);
  }

  /**
   * Access to Shared Core Engines directly if needed
   */
  static engines() {
    return {
      ProcessingEngine,
      NlpEngine,
      CreatorAiEngine,
      AnalyticsEngine,
      RenderingEngine
    };
  }
}

module.exports = PipelineOrchestrator;
