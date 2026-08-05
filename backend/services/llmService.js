const axios = require('axios');

/**
 * Service orchestrator for Generative AI tasks (Titles, Descriptions, Hashtags, Hooks).
 * Uses Google Gemini API (or configurable LLM) with zero-cost deterministic fallback.
 */

const generateTitles = async ({ topic, niche, keywords = [] }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const kwString = keywords.length > 0 ? keywords.join(', ') : topic;

  if (apiKey) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{
              text: `Generate 5 viral, high-CTR YouTube title suggestions for a video in the "${niche || 'General'}" niche about "${topic}". Keywords: ${kwString}. Output only a raw JSON array of string titles.`
            }]
          }]
        }
      );
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const match = text.match(/\[[\s\S]*\]/);
      if (match) return JSON.parse(match[0]);
    } catch (err) {
      console.warn('[LLM Service] Gemini API call failed, falling back to rule-based titles:', err.message);
    }
  }

  // Fallback high-converting YouTube Title Templates
  return [
    `How to Master ${topic} in 2026 (Step-by-Step Guide)`,
    `The Secret to ${topic} Nobody Talks About`,
    `Stop Making This Huge ${niche || 'Content'} Mistake (${topic})`,
    `${topic}: 5 Proven Strategies for Rapid Success`,
    `I Tried ${topic} for 30 Days — Here Is What Happened`
  ];
};

const generateDescription = async ({ topic, summary = '', niche }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{
              text: `Write an SEO-optimized YouTube description for a video about "${topic}". Context summary: "${summary}". Include timestamps placeholder, call to action, and relevant hashtags.`
            }]
          }]
        }
      );
      return response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (err) {
      console.warn('[LLM Service] Gemini API call failed for description fallback:', err.message);
    }
  }

  // Fallback description template
  return `📌 In this video, we dive deep into ${topic}.\n\n${summary ? 'Summary: ' + summary + '\n\n' : ''}⏱️ Timestamps:\n00:00 - Introduction\n01:30 - Core Concept & Breakdown\n05:00 - Step-by-Step Demonstration\n08:30 - Key Takeaways & Conclusion\n\n🔔 Don't forget to Like, Subscribe, and leave your thoughts in the comments below!`;
};

const generateHashtags = async ({ topic, keywords = [] }) => {
  const baseTags = [
    `#${topic.replace(/\s+/g, '')}`,
    `#${topic.split(' ')[0]}Tips`,
    '#ContentCreator',
    '#YouTubeStrategy',
    '#Tutorial'
  ];
  keywords.slice(0, 5).forEach(kw => {
    baseTags.push(`#${kw.replace(/[^a-zA-Z0-9]/g, '')}`);
  });
  return [...new Set(baseTags)];
};

module.exports = {
  generateTitles,
  generateDescription,
  generateHashtags
};
