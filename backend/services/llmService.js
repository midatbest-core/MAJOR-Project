const axios = require('axios');

/**
 * Service orchestrator for Generative AI tasks using Gemini API or dynamic NLP.
 */

const generateLLMText = async (prompt, format = 'text') => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];

  for (const model of models) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        },
        { timeout: 10000 }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;

      if (format === 'json') {
        const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (match) return JSON.parse(match[0]);
      }
      return text;
    } catch (err) {
      console.warn(`[LLM Service] Gemini ${model} error: ${err.message}`);
    }
  }
  return null;
};

const analyzeAudienceComments = async ({ title, comments = [], niche, topic }) => {
  const commentText = comments.length > 0 ? comments.slice(0, 15).join('\n') : `Video title: ${title}`;
  
  const prompt = `You are an AI Audience Intelligence Analyst for YouTube videos.
Video Title: "${title}"
Niche: "${niche}"
Topic: "${topic}"

Comments Sample:
${commentText}

Analyze this video's audience reaction and return a strict JSON object with these exact keys:
{
  "commentSentiment": { "positive": 75, "neutral": 15, "negative": 10 },
  "lovedAspects": ["Aspect 1", "Aspect 2", "Aspect 3"],
  "dislikedAspects": ["Critique 1", "Critique 2"],
  "frequentlyRequested": ["Request 1", "Request 2", "Request 3"],
  "trendingTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"]
}
Make positive + neutral + negative sum to 100%. Make lovedAspects, dislikedAspects, frequentlyRequested, and trendingTopics specific to "${title}" and the comments.`;

  const aiResult = await generateLLMText(prompt, 'json');
  if (aiResult && aiResult.commentSentiment && aiResult.lovedAspects) {
    return aiResult;
  }
  return null;
};

const generateTitles = async ({ topic, niche, keywords = [] }) => {
  const kwString = keywords.length > 0 ? keywords.join(', ') : topic;
  const prompt = `Generate 5 viral, high-CTR YouTube title suggestions for a video in the "${niche || 'General'}" niche about "${topic}". Keywords: ${kwString}. Output only a raw JSON array of string titles.`;
  
  const res = await generateLLMText(prompt, 'json');
  if (Array.isArray(res)) return res;

  return [
    `How to Master ${topic} in 2026 (Step-by-Step Guide)`,
    `The Secret to ${topic} Nobody Talks About`,
    `Stop Making This Huge ${niche || 'Content'} Mistake (${topic})`,
    `${topic}: 5 Proven Strategies for Rapid Success`,
    `I Tried ${topic} for 30 Days — Here Is What Happened`
  ];
};

const generateDescription = async ({ topic, summary = '', niche }) => {
  const prompt = `Write an SEO-optimized YouTube description for a video about "${topic}". Context summary: "${summary}". Include timestamps placeholder, call to action, and relevant hashtags.`;
  const res = await generateLLMText(prompt, 'text');
  if (res) return res;

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
  generateLLMText,
  analyzeAudienceComments,
  generateTitles,
  generateDescription,
  generateHashtags
};
