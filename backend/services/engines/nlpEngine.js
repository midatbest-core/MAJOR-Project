const { runPythonScript } = require('../pythonBridge');

/**
 * Feature Module: NLP Engine
 * Delegates deterministic NLP analysis to Python, strictly adhering to the EDS (Chapter 10).
 * Uses spaCy, NLTK, scikit-learn, textstat, and vaderSentiment.
 */
class NlpEngine {
  /**
   * Run NLP analysis using the Python bridge
   */
  static async analyzeText(text, audioDurationSeconds = null) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('No text provided for NLP analysis');
    }

    try {
      const payload = {
        text: text.trim(),
        duration: audioDurationSeconds
      };

      const result = await runPythonScript('nlp_analyzer.py', payload, 30000);

      if (result.error) {
        throw new Error(`Python NLP Error: ${result.error}`);
      }

      if (!result.analytics) {
        throw new Error('Invalid NLP response from Python engine');
      }

      return {
        summary: result.analytics.summary || '',
        keywords: result.analytics.keywords || [],
        sentiment: result.analytics.sentiment || {
          polarity: 0,
          label: 'Neutral',
          positive: 33,
          neutral: 34,
          negative: 33
        },
        readability: {
          fleschReadingEase: result.analytics.readabilityScore || 0,
          gradeLevel: result.analytics.readabilityGrade || 'Unknown',
          wordCount: result.analytics.wordCount || text.split(/\s+/).filter(Boolean).length,
          sentenceCount: result.analytics.sentenceCount || text.split(/[.!?]+/).filter(Boolean).length || 1
        },
        speakingSpeedWpm: result.analytics.wpm || 145
      };
    } catch (e) {
      console.error('[NLP Engine] Error calling Python analyzer:', e.message);
      throw e; // Bubble up to controller to return 500
    }
  }
}

module.exports = NlpEngine;
