require('../config/environment');
const axios = require('axios');

/**
 * Groq High-Speed AI Service for Sentiment Analysis & Summarization
 * Powered by Llama 3.3 70B & Llama 3.1 8B on LPUs
 */
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-20b',
  'groq/compound-mini',
  'llama-3.3-70b-versatile'
];

const getGroqApiKey = (options = {}) => {
  const userKey = typeof options.groqApiKey === 'string' ? options.groqApiKey.trim() : '';
  const envKey = (process.env.GROQ_API_KEY || '').trim();
  if (userKey && userKey !== 'undefined' && userKey !== 'null') return userKey;
  if (envKey && envKey !== 'undefined' && envKey !== 'null') return envKey;
  return null;
};

/**
 * Perform high-accuracy contextual sentiment analysis via Groq
 */
const analyzeSentimentWithGroq = async (text, options = {}) => {
  const apiKey = getGroqApiKey(options);
  if (!apiKey) return null;

  const sample = text.length > 4000 ? text.substring(0, 4000) : text;
  const models = GROQ_MODELS;

  for (const model of models) {
    try {
      const response = await axios.post(
        GROQ_ENDPOINT,
        {
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an elite NLP sentiment analyst for creator video scripts and audio transcripts. Evaluate the true emotional tone, engagement, and audience perception. Output ONLY valid JSON.'
            },
            {
              role: 'user',
              content: `Analyze the sentiment of the following video transcript/script:\n"""\n${sample}\n"""\n\nReturn strict JSON in this exact format:\n{\n  "label": "Positive" | "Neutral" | "Negative",\n  "polarity": 0.75,\n  "positive": 75,\n  "neutral": 20,\n  "negative": 5\n}\nRules:\n- polarity is a float between -1.0 (very negative) and 1.0 (very positive).\n- positive, neutral, negative are integer percentages summing to 100.`
            }
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 6000
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) continue;

      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.positive === 'number') {
        const pos = Math.min(100, Math.max(0, Math.round(parsed.positive)));
        const neg = Math.min(100, Math.max(0, Math.round(parsed.negative || 0)));
        const neu = Math.max(0, 100 - (pos + neg));
        
        let label = parsed.label || 'Neutral';
        if (!['Positive', 'Negative', 'Neutral'].includes(label)) {
          label = pos > neg ? 'Positive' : (neg > pos ? 'Negative' : 'Neutral');
        }

        const polarity = typeof parsed.polarity === 'number' 
          ? Number(parsed.polarity.toFixed(2)) 
          : Number(((pos - neg) / 100).toFixed(2));

        return {
          label,
          polarity,
          positive: pos,
          neutral: neu,
          negative: neg,
          provider: 'Groq (Llama 3.3)'
        };
      }
    } catch (err) {
      console.warn(`[Groq Sentiment Warning] Model ${model} failed:`, err.response?.data?.error?.message || err.message);
    }
  }

  return null;
};

/**
 * Generate a concise 2-sentence executive summary via Groq
 */
const generateSummaryWithGroq = async (text, options = {}) => {
  const apiKey = getGroqApiKey(options);
  if (!apiKey) return null;

  const sample = text.length > 4000 ? text.substring(0, 4000) : text;
  const models = GROQ_MODELS;

  for (const model of models) {
    try {
      const response = await axios.post(
        GROQ_ENDPOINT,
        {
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an elite YouTube Content Summarizer & Senior Editor. Deliver clear, high-retention executive summaries.'
            },
            {
              role: 'user',
              content: `Audio Transcript:\n"""\n${sample}\n"""\n\nTask: Convert this transcript into a crystal-clear, accurate 2-sentence executive summary.\nRules:\n1. Articulate the main premise, core demonstration, and key takeaway.\n2. Fix any speech-to-text grammar or stutter issues.\n3. Return ONLY the 2-sentence summary without intro phrases or quotation marks.`
            }
          ],
          temperature: 0.2,
          max_tokens: 200
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 6000
        }
      );

      const summaryText = response.data?.choices?.[0]?.message?.content?.trim();
      if (summaryText && summaryText.length > 25) {
        return summaryText.replace(/^["']|["']$/g, '').trim();
      }
    } catch (err) {
      console.warn(`[Groq Summary Warning] Model ${model} failed:`, err.response?.data?.error?.message || err.message);
    }
  }

  return null;
};

/**
 * Generate actionable script improvements via Groq
 */
const generateScriptImprovementsWithGroq = async (scriptText, options = {}) => {
  const apiKey = getGroqApiKey(options);
  if (!apiKey) return null;

  const sample = scriptText.length > 4000 ? scriptText.substring(0, 4000) : scriptText;
  const models = GROQ_MODELS;

  for (const model of models) {
    try {
      const response = await axios.post(
        GROQ_ENDPOINT,
        {
          model,
          messages: [
            {
              role: 'system',
              content: 'Act as an Elite YouTube Script Consultant & Senior Copywriter. Output ONLY valid JSON.'
            },
            {
              role: 'user',
              content: `Analyze the following script/transcript:\n"""\n${sample}\n"""\n\nProvide specific, actionable script improvements in this strict JSON structure:\n{\n  "hookEnhancement": "Specific suggestion to make the first 5 seconds 10x more engaging",\n  "pacingAndClarity": "Specific advice to eliminate fluff, filler words, or confusing explanations",\n  "engagementBoost": "Actionable prompt to boost viewer retention or call-to-action impact",\n  "improvedDraftSnippet": "A polished, punchy version of the opening 3-4 sentences"\n}`
            }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 6000
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) continue;

      const parsed = JSON.parse(content);
      if (parsed && parsed.hookEnhancement) {
        return parsed;
      }
    } catch (err) {
      console.warn(`[Groq Script Improvement Warning] Model ${model} failed:`, err.response?.data?.error?.message || err.message);
    }
  }

  return null;
};

/**
 * Generate high-accuracy YouTube audience comment analysis via Groq
 */
const generateAudienceAnalysisWithGroq = async ({ title, comments = [], niche, topic }, options = {}) => {
  const apiKey = getGroqApiKey(options);
  if (!apiKey) return null;

  const commentText = comments.length > 0 ? comments.slice(0, 40).join('\n') : `Video title: ${title}`;
  const models = GROQ_MODELS;

  for (const model of models) {
    try {
      const response = await axios.post(
        GROQ_ENDPOINT,
        {
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an elite AI Audience Intelligence Analyst for YouTube content. Output ONLY valid JSON.'
            },
            {
              role: 'user',
              content: `Analyze the audience response for this video:\nVideo Title: "${title}"\nNiche: "${niche || 'General'}"\nTopic: "${topic || title}"\n\nComments:\n${commentText}\n\nReturn strict JSON in this exact structure:\n{\n  "commentSentiment": { "positive": 75, "neutral": 15, "negative": 10 },\n  "aiSummary": "A 2-3 sentence overarching summary of reception and value.",\n  "positiveSummary": "What people positively loved.",\n  "neutralSummary": "General remarks and questions.",\n  "negativeSummary": "Core criticisms or missing elements.",\n  "lovedAspects": ["Aspect 1", "Aspect 2"],\n  "dislikedAspects": ["Critique 1", "Critique 2"],\n  "frequentlyRequested": ["Requested item 1", "Requested item 2"],\n  "trendingTopics": ["Topic 1", "Topic 2"],\n  "targetNicheIdeas": ["Idea 1", "Idea 2"],\n  "whatWorks": ["Element that works well"],\n  "whatDoesntWork": ["Element that hurts retention"]\n}`
            }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 6000
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) continue;

      const parsed = JSON.parse(content);
      if (parsed && parsed.commentSentiment && parsed.aiSummary) {
        return parsed;
      }
    } catch (err) {
      console.warn(`[Groq Audience Analysis Warning] Model ${model} failed:`, err.response?.data?.error?.message || err.message);
    }
  }

  return null;
};

/**
 * Generate intelligent, context-aware creator conversation via Groq
 */
const generateChatWithGroq = async (messages, systemPrompt, options = {}) => {
  const apiKey = getGroqApiKey(options);
  if (!apiKey) return null;

  const chatMessages = [
    {
      role: 'system',
      content: systemPrompt
    },
    ...messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }))
  ];

  const models = [
    'openai/gpt-oss-120b',
    'llama-3.3-70b-versatile',
    'qwen/qwen3.8-27b'
  ];

  for (const model of models) {
    try {
      const response = await axios.post(
        GROQ_ENDPOINT,
        {
          model,
          messages: chatMessages,
          temperature: 0.7,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const reply = response.data?.choices?.[0]?.message?.content?.trim();
      if (reply) {
        return {
          reply,
          model: model.includes('gpt-oss') ? 'GPT-120B (Groq LPU)' : `${model} (Groq LPU)`,
          provider: 'Groq'
        };
      }
    } catch (err) {
      console.warn(`[Groq Chat Warning] Model ${model} failed:`, err.response?.data?.error?.message || err.message);
    }
  }

  return null;
};

module.exports = {
  analyzeSentimentWithGroq,
  generateSummaryWithGroq,
  generateScriptImprovementsWithGroq,
  generateAudienceAnalysisWithGroq,
  generateChatWithGroq,
  getGroqApiKey
};

