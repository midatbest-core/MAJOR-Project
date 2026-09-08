const { runPythonScript } = require('../pythonBridge');
const { analyzeSentimentWithGroq, generateSummaryWithGroq } = require('../groqService');

/**
 * Feature Module: NLP Engine
 * Delegates deterministic NLP analysis to Python (spaCy, scikit-learn, textstat)
 * and enhances with Groq LPU AI for ultra-accurate sentiment and summarization.
 */
class NlpEngine {
  /**
   * Run NLP analysis using Python bridge + Groq AI acceleration
   */
  static async analyzeText(text, audioDurationSeconds = null, options = {}) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('No text provided for NLP analysis');
    }

    try {
      const payload = {
        text: text.trim(),
        duration: audioDurationSeconds
      };

      // 1. Run Python NLP for core metrics (Readability, TF-IDF keywords, WPM, sentence counts)
      const result = await runPythonScript('nlp_analyzer.py', payload, 30000);

      if (result.error) {
        throw new Error(`Python NLP Error: ${result.error}`);
      }

      if (!result.analytics) {
        throw new Error('Invalid NLP response from Python engine');
      }

      let summary = result.analytics.summary || '';
      let sentiment = result.analytics.sentiment || {
        polarity: 0,
        label: 'Neutral',
        positive: 33,
        neutral: 34,
        negative: 33
      };

      // 2. Enhance with Groq AI for high-accuracy contextual sentiment & executive summary
      try {
        const [groqSentiment, groqSummary] = await Promise.all([
          analyzeSentimentWithGroq(text, options),
          generateSummaryWithGroq(text, options)
        ]);

        if (groqSentiment) {
          sentiment = groqSentiment;
        }
        if (groqSummary) {
          summary = groqSummary;
        }
      } catch (aiErr) {
        console.warn('[NLP Engine] Groq AI analysis notice:', aiErr.message);
      }

      return {
        summary,
        keywords: result.analytics.keywords || [],
        sentiment,
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
