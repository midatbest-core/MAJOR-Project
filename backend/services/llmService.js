const axios = require('axios');

/**
 * Polished, High-Accuracy LLM & Dynamic Creator Service
 */

const cleanJsonString = (raw) => {
  if (!raw) return null;
  let str = raw.trim();
  str = str.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const match = str.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return match ? match[0] : str;
};

const generateLLMText = async (prompt, format = 'text') => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const models = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];

  for (const model of models) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        },
        { timeout: 4000 }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;

      if (format === 'json') {
        const jsonStr = cleanJsonString(text);
        try {
          return JSON.parse(jsonStr);
        } catch (e) {
          // If JSON parse fails, continue to next model attempt
        }
      }
      return text.trim();
    } catch (err) {
      if (err.response?.status === 429) {
        console.warn(`[LLM Service] Gemini ${model} rate-limited (429).`);
      } else if (err.response?.status !== 404) {
        console.warn(`[LLM Service] Gemini ${model} error: ${err.message}`);
      }
    }
  }
  return null;
};

const summarizeTranscript = async (text, projectTitle = '') => {
  if (!text || text.length < 15) return null;

  const prompt = `You are an elite YouTube Content Summarizer & Senior Editor.
Video Title: "${projectTitle || 'Creator Video'}"
Audio Transcript:
"${text.substring(0, 3500)}"

Task: Convert this transcript into a crystal-clear, accurate 2-sentence executive summary.
Rules:
1. Fix any speech-to-text grammar or spelling errors.
2. Articulate the main topic, core demonstration, and key takeaway.
3. Write in clean third-person English (e.g., "This video explores...").
4. Return ONLY the 2-sentence summary without conversational intro.`;

  const res = await generateLLMText(prompt, 'text');
  if (res && res.length > 25 && res.length < 500) {
    return res.trim().replace(/^["']|["']$/g, '');
  }
  return null;
};

const generateScriptImprovements = async (scriptText) => {
  if (!scriptText || scriptText.length < 10) return null;

  const prompt = `Act as an Elite YouTube Script Consultant & Senior Copywriter.
Analyze the following script/transcript:
"${scriptText.substring(0, 3000)}"

Provide specific, actionable script improvements in this strict JSON structure:
{
  "hookEnhancement": "Specific suggestion to make the first 5 seconds 10x more engaging",
  "pacingAndClarity": "Specific advice to eliminate fluff, filler words, or confusing explanations",
  "engagementBoost": "Actionable prompt to boost viewer retention or call-to-action impact",
  "improvedDraftSnippet": "A polished, punchy version of the opening 3-4 sentences"
}`;

  const res = await generateLLMText(prompt, 'json');
  if (res && res.hookEnhancement) return res;

  const clean = scriptText.trim();
  const sentences = clean.split(/(?<=[.!?])\s+/);
  const opening = sentences[0] || clean.substring(0, 80);

  return {
    hookEnhancement: `Lead directly with the high-stakes problem: "${opening.substring(0, 60)}..." before giving background intro.`,
    pacingAndClarity: `Trim conversational filler words and keep average sentence length under 15 words for maximum speech clarity.`,
    engagementBoost: `Add a curiosity gap at 0:30 telling viewers what unique value or secret they'll unlock by watching till the end.`,
    improvedDraftSnippet: `"${opening.toUpperCase()} Here is the exact step-by-step breakdown you need."`
  };
};

const analyzeAudienceComments = async ({ title, comments = [], niche, topic }) => {
  const commentText = comments.length > 0 ? comments.slice(0, 15).join('\n') : `Video title: ${title}`;
  
  const prompt = `You are an AI Audience Intelligence Analyst for YouTube content.
Video Title: "${title}"
Niche: "${niche || 'General'}"
Topic: "${topic || title}"

Comments Sample:
${commentText}

Return a strict JSON object:
{
  "commentSentiment": { "positive": 75, "neutral": 15, "negative": 10 },
  "lovedAspects": ["Loved aspect 1 specific to ${topic}", "Loved aspect 2", "Loved aspect 3"],
  "dislikedAspects": ["Constructive critique 1 for ${topic}", "Critique 2"],
  "frequentlyRequested": ["Requested follow-up 1 on ${topic}", "Request 2", "Request 3"],
  "trendingTopics": ["Trending subtopic 1", "Trending subtopic 2", "Trending subtopic 3"]
}`;

  const aiResult = await generateLLMText(prompt, 'json');
  if (aiResult && aiResult.commentSentiment && aiResult.lovedAspects) {
    return aiResult;
  }
  return null;
};

const generateTitles = async ({ topic, niche, keywords = [] }) => {
  const kwString = keywords.length > 0 ? keywords.join(', ') : topic;
  const prompt = `Generate 5 viral, high-CTR YouTube title suggestions for a video in the "${niche || 'General'}" niche about "${topic}". Keywords: ${kwString}. Output ONLY a raw JSON array of string titles.`;
  
  const res = await generateLLMText(prompt, 'json');
  if (Array.isArray(res)) return res;

  const topicTitle = topic ? topic.trim() : 'Content Strategy';
  const cleanNiche = niche || 'Creator';
  return [
    `How to Master ${topicTitle} in 2026 (Step-by-Step Guide)`,
    `The Secret to ${topicTitle} Nobody Talks About`,
    `Stop Making This Huge ${cleanNiche} Mistake (${topicTitle})`,
    `${topicTitle}: 5 Proven Strategies for Rapid Growth`,
    `I Built a Custom ${topicTitle} Workflow — Here Is What Happened`
  ];
};

const generateDescription = async ({ topic, summary = '', niche }) => {
  const prompt = `Write an SEO-optimized YouTube description for a video about "${topic}". Summary: "${summary}". Include timestamps placeholder, call to action, and hashtags.`;
  const res = await generateLLMText(prompt, 'text');
  if (res) return res;

  const mainTopic = topic || 'Video Content';
  return `📌 In this video, we dive deep into ${mainTopic}.\n\n${summary ? 'Summary: ' + summary + '\n\n' : ''}⏱️ Timestamps:\n00:00 - Introduction & Hook\n01:30 - Core Concept & Breakdown\n05:00 - Step-by-Step Demonstration\n08:30 - Key Takeaways & Action Plan\n\n🔔 Don't forget to Like, Subscribe, and leave your thoughts in the comments below!`;
};

const generateHashtags = async ({ topic, keywords = [] }) => {
  const cleanTopic = (topic || 'Creator').replace(/[^a-zA-Z0-9]/g, '');
  const baseTags = [
    `#${cleanTopic}`,
    `#${cleanTopic}Tips`,
    '#ContentCreator',
    '#YouTubeGrowth',
    '#ViralContent'
  ];

  if (Array.isArray(keywords)) {
    keywords.slice(0, 5).forEach(kw => {
      const tag = (kw || '').replace(/[^a-zA-Z0-9]/g, '');
      if (tag && tag.length > 2) baseTags.push(`#${tag}`);
    });
  }

  return [...new Set(baseTags)];
};

module.exports = {
  generateLLMText,
  summarizeTranscript,
  generateScriptImprovements,
  analyzeAudienceComments,
  generateTitles,
  generateDescription,
  generateHashtags
};
