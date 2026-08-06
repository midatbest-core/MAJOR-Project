const { generateLLMText } = require('../llmService');

/**
 * Creator AI Engine
 * Enforces Shared AI Request Contract (Section 3.9) and AI Response Contract (Section 3.10).
 */
class CreatorAiEngine {
  /**
   * Universal AI Execution Wrapper
   */
  static async executeAiTask(task, context = {}, constraints = {}) {
    const aiRequest = {
      task,
      context,
      constraints: {
        language: constraints.language || 'English',
        count: constraints.count || 3,
        ...constraints
      }
    };

    let outputs = [];
    let usage = { tokens: 150 };

    try {
      const prompt = `Task: ${aiRequest.task}
Context: ${JSON.stringify(aiRequest.context)}
Constraints: ${JSON.stringify(aiRequest.constraints)}
Respond strictly in valid JSON format.`;

      const rawRes = await generateLLMText(prompt, 'json');
      if (rawRes) {
        outputs = Array.isArray(rawRes) ? rawRes : rawRes.outputs || [rawRes];
      }
    } catch (e) {
      console.warn(`[Creator AI Engine Warning] Fallback for task ${task}: ${e.message}`);
    }

    if (!outputs || outputs.length === 0) {
      outputs = this.getFallbackAiOutputs(aiRequest);
    }

    return {
      task: aiRequest.task,
      outputs,
      usage
    };
  }

  /**
   * Deterministic fallback outputs by task type
   */
  static getFallbackAiOutputs(aiRequest) {
    const topic = aiRequest.context.topic || 'Video Optimization';
    const niche = aiRequest.context.niche || 'General';

    switch (aiRequest.task) {
      case 'generate_titles':
        return [
          `How to Master ${niche} in 2026 (Step-by-Step Blueprint)`,
          `The Zero-Cost ${niche} Setup Every Creator Needs`,
          `Stop Juggling Tools: Build Your Own ${niche} Dashboard`
        ];

      case 'generate_description':
        return [
          `🚀 Complete ${niche} Guide for 2026.\n\n📌 Timestamps:\n00:00 - Introduction\n02:15 - Core Solution\n08:45 - Live Demo\n\n💡 Key Takeaways:\n- Learn zero-cost creator workflows\n\n🔔 Subscribe for more!`
        ];

      case 'generate_hashtags':
        return [
          `#${niche.replace(/\s+/g, '')}`,
          '#ContentCreator',
          '#YouTubeOptimization',
          '#AICreator',
          '#TechTools'
        ];

      default:
        return [`Optimized content output for ${topic}`];
    }
  }

  // Convenience wrapper functions
  static async generateTitles(topic, niche = 'General', count = 3) {
    const res = await this.executeAiTask('generate_titles', { topic, niche }, { count });
    return res.outputs;
  }

  static async generateDescription(topic, niche = 'General') {
    const res = await this.executeAiTask('generate_description', { topic, niche });
    return res.outputs[0] || '';
  }

  static async generateHashtags(topic, niche = 'General') {
    const res = await this.executeAiTask('generate_hashtags', { topic, niche });
    return res.outputs;
  }

  static async generateInspiration(youtubeUrl, niche = 'Programming', topic = 'Machine Learning Roadmap') {
    return {
      videoIdeas: [
        `Building a ${topic} from Scratch in 2026`,
        `How to Master ${niche} for FREE (Zero API Bills Workflow)`,
        `5 Critical ${niche} Mistakes Every Beginner Makes`
      ],
      hookIdeas: [
        `"90% of ${niche} creators make this exact mistake... Here is how to fix it in 5 minutes."`,
        `"I analyzed top viral videos on ${topic} and uncovered the exact 5-step blueprint."`,
        `"Stop spending money on expensive tools before watching this open-source breakdown."`
      ],
      titleSuggestions: [
        `The Zero-Cost ${topic} Guide (2026 Edition)`,
        `I Built a Custom ${niche} Intelligence Tool in 48 Hours`,
        `Stop Buying Subscriptions: Build Your Own ${topic} Dashboard`
      ],
      blueprint: {
        hook: `Hook the viewer within 5 seconds with a high-stakes question about saving time & money on ${topic}.`,
        problem: `Explain how traditional creator workflows require juggling 5 separate subscription tools.`,
        solution: `Introduce your unified, open-source stack built specifically for ${niche} creators.`,
        demo: `Perform a crisp live walkthrough showing transcript extraction and instant analytics.`,
        cta: `Direct viewers to grab the GitHub repository link from the description or pinned comment.`
      },
      creatorRecommendations: [
        `Shorten intro talk to under 10 seconds to maximize viewer retention curve.`,
        `Include a visual comparison matrix between local open-source models vs paid cloud services.`,
        `Mention your main value proposition (live demo) before minute 2:00.`
      ]
    };
  }
}

module.exports = CreatorAiEngine;
