const axios = require('axios');
const AppError = require('../shared/AppError');

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

const generateLLMText = async (prompt, format = 'text', options = {}) => {
  const apiKey = options.geminiApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError('Gemini API Key is missing. Please configure it in Settings or backend environment variables.', 500);
  }

  const models = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        },
        { timeout: 15000 }
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
      lastError = err;
      if (err.response?.status === 429) {
        console.warn(`[LLM Service] Gemini ${model} rate-limited (429).`);
      } else if (err.response?.status !== 404) {
        console.warn(`[LLM Service] Gemini ${model} error: ${err.message}`);
      }
    }
  }
  
  throw new AppError(`AI Generation failed: ${lastError ? lastError.message : 'Unknown error'}`, 500);
};

const summarizeTranscript = async (text, projectTitle = '', options = {}) => {
  if (!text || text.length < 15) throw new AppError('Transcript too short for summarization.', 400);

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

  const res = await generateLLMText(prompt, 'text', options);
  if (res && res.length > 25 && res.length < 500) {
    return res.trim().replace(/^["']|["']$/g, '');
  }
  throw new AppError('AI returned an invalid summary format.', 500);
};

const generateScriptImprovements = async (scriptText, options = {}) => {
  if (!scriptText || scriptText.length < 10) throw new AppError('Script too short to improve.', 400);

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

  const res = await generateLLMText(prompt, 'json', options);
  if (res && res.hookEnhancement) return res;

  throw new AppError('AI failed to generate valid script improvements.', 500);
};

const analyzeAudienceComments = async ({ title, comments = [], niche, topic }, options = {}) => {
  const commentText = comments.length > 0 ? comments.slice(0, 100).join('\n') : `Video title: ${title}`;
  
  const prompt = `You are an AI Audience Intelligence Analyst for YouTube content.
Video Title: "${title}"
Niche: "${niche || 'General'}"
Topic: "${topic || title}"

Comments Sample:
${commentText}

Return a strict JSON object with EXACTLY these keys:
{
  "commentSentiment": { "positive": 75, "neutral": 15, "negative": 10 },
  "aiSummary": "A 2-3 sentence overarching summary of the video's reception and core value delivered.",
  "positiveSentimentDetails": ["Exact quote or specific detail driving positive reception 1", "Detail 2"],
  "negativeSentimentDetails": ["Exact pain point, confusion, or critique 1", "Detail 2"],
  "lovedAspects": ["Loved aspect 1 specific to ${topic}", "Loved aspect 2", "Loved aspect 3"],
  "dislikedAspects": ["Constructive critique 1 for ${topic}", "Critique 2"],
  "frequentlyRequested": ["Requested follow-up 1 on ${topic}", "Request 2", "Request 3"],
  "trendingTopics": ["Trending subtopic 1", "Trending subtopic 2", "Trending subtopic 3"],
  "targetNicheIdeas": ["Target niche pivot/idea 1", "Target niche idea 2"],
  "whatWorks": ["Element that works exceptionally well 1", "Element 2"],
  "whatDoesntWork": ["Element that fails or hurts retention 1", "Element 2"]
}`;

  const aiResult = await generateLLMText(prompt, 'json', options);
  if (aiResult && aiResult.commentSentiment && aiResult.aiSummary) {
    return aiResult;
  }
  throw new AppError('AI failed to parse audience comments.', 500);
};

const generateTitles = async ({ topic, niche, keywords = [] }, options = {}) => {
  const kwString = keywords.length > 0 ? keywords.join(', ') : topic;
  const prompt = `Generate 5 viral, high-CTR YouTube title suggestions for a video in the "${niche || 'General'}" niche about "${topic}". Keywords: ${kwString}. Output ONLY a raw JSON array of string titles.`;
  
  const res = await generateLLMText(prompt, 'json', options);
  if (Array.isArray(res)) return res;

  throw new AppError('AI failed to generate titles.', 500);
};

const generateDescription = async ({ topic, summary = '', niche }, options = {}) => {
  const prompt = `Write an SEO-optimized YouTube description for a video about "${topic}". Summary: "${summary}". Include timestamps placeholder, call to action, and hashtags.`;
  const res = await generateLLMText(prompt, 'text', options);
  if (res) return res;

  throw new AppError('AI failed to generate description.', 500);
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
