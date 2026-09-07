const { generateLLMText } = require('../services/llmService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * POST /api/v1/chat
 */
const chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;
    const geminiApiKey = req.headers['x-gemini-key'];

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return sendError(res, 'Messages array is required', [], 400);
    }

    // Format history into a cohesive prompt
    let prompt = `You are an elite AI Creator Co-Pilot assisting a YouTube creator with content strategy, SEO, scripting, and optimization. Be extremely helpful, concise, and professional.\n\n`;
    
    messages.forEach(msg => {
      const role = msg.role === 'assistant' ? 'Assistant' : 'User';
      prompt += `${role}: ${msg.content}\n\n`;
    });
    
    prompt += `Assistant:`;

    const responseText = await generateLLMText(prompt, 'text', { geminiApiKey });

    return sendSuccess(res, { reply: responseText }, 'Chat response generated successfully');
  } catch (err) {
    console.error('[ChatController Error]', err);
    return sendError(res, 'Failed to generate chat response', err, 500);
  }
};

module.exports = {
  chatWithAI
};
