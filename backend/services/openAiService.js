require('../config/environment');
const axios = require('axios');

/**
 * OpenAI ChatGPT Service
 * Connects directly to OpenAI's Chat Completions API (GPT-4o, GPT-4o-mini)
 */
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];

const getOpenAiApiKey = (options = {}) => {
  const userKey = typeof options.openAiApiKey === 'string' ? options.openAiApiKey.trim() : '';
  const envKey = (process.env.OPENAI_API_KEY || '').trim();
  if (userKey && userKey !== 'undefined' && userKey !== 'null') return userKey;
  if (envKey && envKey !== 'undefined' && envKey !== 'null') return envKey;
  return null;
};

/**
 * Generate chat response via OpenAI ChatGPT
 */
const generateChatWithOpenAI = async (messages, systemPrompt, options = {}) => {
  const apiKey = getOpenAiApiKey(options);
  if (!apiKey) return null;

  // Format messages for OpenAI API
  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }))
  ];

  let lastError = null;

  for (const model of OPENAI_MODELS) {
    try {
      const response = await axios.post(
        OPENAI_ENDPOINT,
        {
          model,
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      const reply = response.data?.choices?.[0]?.message?.content?.trim();
      if (reply) {
        return {
          reply,
          model: `ChatGPT (${model})`,
          provider: 'OpenAI'
        };
      }
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      console.warn(`[OpenAI Chat] Model ${model} error (${status}):`, err.response?.data?.error?.message || err.message);
      // If auth error, don't keep trying models with an invalid key
      if (status === 401 || status === 403) {
        break;
      }
    }
  }

  if (lastError) {
    console.warn('[OpenAI Chat] Could not complete request via OpenAI:', lastError.response?.data?.error?.message || lastError.message);
  }
  return null;
};

module.exports = {
  generateChatWithOpenAI,
  getOpenAiApiKey
};
