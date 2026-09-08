const { generateLLMText } = require('../llmService');

/**
 * Feature Module: High-Accuracy Creator AI Engine
 * Generates dynamic Titles, Hooks, Descriptions, Hashtags, Video Ideas, SEO Suggestions, Content Blueprints
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
        outputs = Array.isArray(rawRes) ? rawRes : (rawRes.outputs || [rawRes]);
      }
    } catch (e) {
      console.warn(`[Creator AI Engine Warning] Task ${task} error: ${e.message}`);
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
   * Dynamic, high-accuracy fallback outputs derived from input context
   */
  static getFallbackAiOutputs(aiRequest) {
    const topic = (aiRequest.context.topic || 'Video Strategy').trim();
    const niche = (aiRequest.context.niche || 'Creator').trim();
    const cleanTag = topic.replace(/[^a-zA-Z0-9]/g, '');

    switch (aiRequest.task) {
      case 'generate_titles':
        return [
          `How to Master ${topic} in 2026 (Step-by-Step Blueprint)`,
          `The Zero-Cost ${niche} Setup Every Creator Needs (${topic})`,
          `Stop Making This Mistake With ${topic}`
        ];

      case 'generate_description':
        return [
          `🚀 Complete ${niche} Guide on ${topic}.\n\n📌 Timestamps:\n00:00 - Introduction & Hook\n02:15 - Core ${topic} Breakdown\n08:45 - Live Demo & Best Practices\n\n💡 Key Takeaways:\n- Learn high-efficiency ${niche} workflows\n- Maximize retention and audience CTR\n\n🔔 Subscribe for more updates!`
        ];

      case 'generate_hashtags':
        return [
          `#${cleanTag}`,
          `#${cleanTag}Tips`,
          `#${niche.replace(/\s+/g, '')}`,
          '#ContentCreator',
          '#YouTubeOptimization'
        ];

      default:
        return [`Optimized content output for ${topic}`];
    }
  }

  // Convenience wrapper functions
  static async generateTitles(topic, niche = 'General', count = 3) {
    const res = await this.executeAiTask('generate_titles', { topic, niche }, { count });
    if (Array.isArray(res.outputs)) {
      if (res.outputs.length === 1 && res.outputs[0] && Array.isArray(res.outputs[0].titles)) {
        return res.outputs[0].titles;
      }
      return res.outputs.map(item => (typeof item === 'string' ? item : (item.title || JSON.stringify(item))));
    }
    return [];
  }

  static async generateDescription(topic, niche = 'General') {
    const res = await this.executeAiTask('generate_description', { topic, niche });
    const output = res.outputs && res.outputs.length > 0 ? res.outputs[0] : '';
    if (typeof output === 'string') return output;
    if (output && typeof output.description === 'string') return output.description;
    if (output && typeof output.output === 'string') return output.output;
    if (output && Array.isArray(output.description)) return output.description.join('\n');
    return typeof output === 'object' ? Object.values(output).join('\n') : String(output || '');
  }

  static async generateHashtags(topic, niche = 'General') {
    const res = await this.executeAiTask('generate_hashtags', { topic, niche });
    if (Array.isArray(res.outputs)) {
      if (res.outputs.length === 1 && res.outputs[0] && Array.isArray(res.outputs[0].hashtags)) {
        return res.outputs[0].hashtags;
      }
      return res.outputs.flatMap(item => (typeof item === 'string' ? item : (item.hashtags || [JSON.stringify(item)])));
    }
    return [];
  }

  /**
   * Generates dynamic Personalized Inspiration & 5-Stage Blueprint
   */
  static async generateInspiration(youtubeUrl, niche = 'Programming', topic = 'Machine Learning Roadmap', options = {}) {
    const cleanTopic = (topic || 'Content Optimization').trim();
    const cleanNiche = (niche || 'Creator').trim();

    const prompt = `Act as an elite YouTube Content Strategist & Growth Engine.
Reference Video URL: "${youtubeUrl}"
Creator Niche: "${cleanNiche}"
Target Topic: "${cleanTopic}"

Generate personalized inspiration for a creator in the "${cleanNiche}" niche making a video about "${cleanTopic}".
Return a strict JSON object with this exact schema:
{
  "videoIdeas": [
    "Original Concept 1 tailored to ${cleanTopic}",
    "Original Concept 2 tailored to ${cleanTopic}",
    "Original Concept 3 tailored to ${cleanTopic}"
  ],
  "hookIdeas": [
    "Opening line 1 for ${cleanTopic}",
    "Opening line 2 for ${cleanTopic}",
    "Opening line 3 for ${cleanTopic}"
  ],
  "titleSuggestions": [
    "SEO Title 1 for ${cleanTopic}",
    "SEO Title 2 for ${cleanTopic}",
    "SEO Title 3 for ${cleanTopic}"
  ],
  "blueprint": {
    "hook": "Specific 0-10s hook instructions for ${cleanTopic}",
    "problem": "Clear problem statement framing for ${cleanTopic}",
    "solution": "Core solution presentation strategy for ${cleanTopic}",
    "demo": "Interactive live demo / proof points strategy for ${cleanTopic}",
    "cta": "Compelling call to action strategy"
  },
  "creatorRecommendations": [
    "Recommendation 1 specific to ${cleanNiche} creators",
    "Recommendation 2 specific to retention curve",
    "Recommendation 3 specific to call-to-action placement"
  ]
}`;

    let aiRes = null;
    try {
      aiRes = await generateLLMText(prompt, 'json', options);
    } catch (e) {
      console.warn('[Creator AI Engine] LLM failed for inspiration, falling back to local static generation:', e.message);
    }

    if (aiRes && aiRes.videoIdeas && aiRes.blueprint) {
      return aiRes;
    }

    // Dynamic, topic-tailored fallback if cloud LLM is rate-limited
    return {
      videoIdeas: [
        `Building a ${cleanTopic} System From Scratch in 2026`,
        `How to Master ${cleanTopic} for FREE (Zero Cost Workflow)`,
        `5 Critical ${cleanTopic} Mistakes Every Beginner Makes`
      ],
      hookIdeas: [
        `"90% of ${cleanNiche} creators make this exact mistake with ${cleanTopic}... Here is how to fix it in 5 minutes."`,
        `"I analyzed top viral videos on ${cleanTopic} and uncovered the exact 5-step blueprint."`,
        `"Stop spending money on expensive tools before watching this open-source ${cleanTopic} breakdown."`
      ],
      titleSuggestions: [
        `The Zero-Cost ${cleanTopic} Guide (2026 Edition)`,
        `I Built a Custom ${cleanTopic} Tool in 48 Hours`,
        `Stop Buying Subscriptions: Master ${cleanTopic} Easily`
      ],
      blueprint: {
        hook: `Hook the viewer within 5 seconds with a high-stakes question about saving time & money on ${cleanTopic}.`,
        problem: `Explain how traditional creator workflows require juggling separate complex tools for ${cleanTopic}.`,
        solution: `Introduce your streamlined, high-performance approach built specifically for ${cleanNiche} creators.`,
        demo: `Perform a crisp live walkthrough showing real input processing and instant analytics.`,
        cta: `Direct viewers to grab the resource links from the description or pinned comment.`
      },
      creatorRecommendations: [
        `Shorten intro talk to under 10 seconds to maximize viewer retention curve on ${cleanTopic}.`,
        `Include a visual step-by-step breakdown diagram for ${cleanTopic}.`,
        `Deliver your primary value proposition and demo before minute 2:00.`
      ]
    };
  }
}

module.exports = CreatorAiEngine;
