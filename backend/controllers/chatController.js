const { generateChatWithOpenAI } = require('../services/openAiService');
const { generateChatWithGroq } = require('../services/groqService');
const { generateLLMText } = require('../services/llmService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const CREATOR_SYSTEM_PROMPT = `You are the ultimate Creator Intelligence Co-Pilot & Senior Social Media Growth Engineer. 
You possess deep, modern, practical mastery of 2026 YouTube, YouTube Shorts, TikTok, and Instagram algorithms, viewer retention psychology, and viral content packaging.

Your Core Competencies & Guidelines:
1. Modern Social Media & YouTube Algorithm Awareness:
   - Understands click-through-rate (CTR) vs impression velocity, AVD (average view duration), relative retention graphs, and viewer satisfaction signals.
   - Hook Mastery: Never recommend fluffy intros or "Hey guys welcome back". Recommend launching directly into high-curiosity propositions, visual stakes, or pattern interrupts within the first 3-5 seconds.
   - Packaging: Crafts compelling thumbnail-title combinations (curiosity gaps, negative FOMO, time-to-value, counter-intuitive claims) where the title and thumbnail complement rather than repeat each other.
2. Vertical & Short-Form Video Dynamics (Shorts, Reels, TikTok):
   - Seamless loop techniques, instant text overlays, dynamic pacing (130-160 WPM), pattern interrupts every 3-4 seconds, and natural engagement/comment triggers.
3. Script Doctoring & Content Strategy:
   - Identifies and eliminates retention drop-offs, sharpens storytelling arcs, tightens explanations, and crafts seamless, context-driven CTAs (e.g. bridging into the next video).
4. Delivery & Tone:
   - Direct, actionable, punchy, and highly strategic. Use clean markdown, bold highlights, and clear bullet points.
   - Never provide generic or bland textbook fluff. Always provide concrete titles, exact word-for-word hook examples, and tailored strategic steps for the creator's specific topic or niche.
   - If the user provides an attached transcript, video title, or audience analytics, deeply integrate those specific details into your recommendations.
5. Structural Integrity & Clean Markdown:
   - When presenting formulas, concepts, or comparisons, use clean, valid GitHub-Flavored Markdown tables with proper header rows (| Col 1 | Col 2 |) and alignment dashes (|---|---|).
   - Do NOT output raw HTML tags like <br> in text. Keep table cell content concise and readable.
   - Separate major topics with clean headers (###) and bulleted lists. Ensure all tables are closed and formatted properly.`;

/**
 * Dynamic fallback intelligence for creator queries when cloud LLM is rate-limited or offline
 */
const generateFallbackChatReply = (messages) => {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  const lowerMsg = lastUserMsg.toLowerCase();

  // Find any attached context from earlier assistant messages
  const contextMsg = messages.find(m => m.isContext || (m.content && m.content.includes('attached')));
  let contextSnippet = '';
  if (contextMsg) {
    const match = contextMsg.content.match(/(?:Transcript Snippet|Summary|Video|Title)[:\*]*\s*([^\n]+)/i);
    if (match) contextSnippet = match[1].replace(/[*_]/g, '').trim();
  }

  // Extract core subject/topic keywords from user message or context
  const cleanSubject = (contextSnippet || lastUserMsg.replace(/^(what|how|why|give me|write|generate|can you|help me with)\s+/i, '')).substring(0, 50).trim() || 'Your Content';

  if (lowerMsg.includes('title') || lowerMsg.includes('headline')) {
    return `Here are 5 high-CTR, algorithm-optimized titles for **${cleanSubject}**:\n\n` +
      `1. **"The Zero-Cost Blueprint to ${cleanSubject} in 2026"** *(Curiosity & Immediate Value)*\n` +
      `2. **"Why 90% of Creators Fail at ${cleanSubject} (And How to Fix It)"** *(Negative FOMO Framing)*\n` +
      `3. **"Master ${cleanSubject} in 10 Minutes (Step-by-Step Guide)"** *(Time-to-Value Appeal)*\n` +
      `4. **"I Tested Every ${cleanSubject} Strategy So You Don't Have To"** *(Authority & Effort Proof)*\n` +
      `5. **"Stop Doing ${cleanSubject} Like This... Do THIS Instead"** *(Pattern Interrupt)*\n\n` +
      `💡 **Pro Tip:** Pair these with high-contrast, 3-word maximum thumbnail text that raises an unanswered question!`;
  }

  if (lowerMsg.includes('hook') || lowerMsg.includes('intro') || lowerMsg.includes('opening')) {
    return `Here are 3 high-retention opening hooks for **${cleanSubject}** to kill the first-5-second drop-off:\n\n` +
      `🔥 **Hook 1 (The Counter-Intuitive Reversal):**\n` +
      `*"Everything you've been told about ${cleanSubject} is wrong in 2026. In the next 6 minutes, I'm breaking down the exact framework that actually works."*\n\n` +
      `⚡ **Hook 2 (The Stakes & Proof Hook):**\n` +
      `*"If you want to master ${cleanSubject} without wasting weeks of trial and error, watch this first. Here is the single mistake costing creators their reach."*\n\n` +
      `🎯 **Hook 3 (The Instant Action Hook):**\n` +
      `*"Don't publish another piece of content until you apply this simple ${cleanSubject} tweak. Let's dive straight in—no intro fluff."*\n\n` +
      `💡 **Retention Rule:** Cut any logo animation or channel greeting. Start on visual movement or your biggest statement instantly.`;
  }

  if (lowerMsg.includes('hashtag') || lowerMsg.includes('tag') || lowerMsg.includes('seo') || lowerMsg.includes('keyword')) {
    const cleanTag = cleanSubject.replace(/[^a-zA-Z0-9]/g, '');
    return `Here is your SEO keyword & hashtag optimization pack for **${cleanSubject}**:\n\n` +
      `🏷️ **Primary Hashtags:**\n` +
      `#${cleanTag} #${cleanTag}Tips #ContentCreator #YouTubeGrowth #ViralStrategy\n\n` +
      `🔍 **High-Intent Search Queries:**\n` +
      `- How to get started with ${cleanSubject}\n` +
      `- ${cleanSubject} tutorial for beginners 2026\n` +
      `- Best tools and workflow for ${cleanSubject}\n\n` +
      `💡 **SEO Best Practice:** Include these natural phrases in your first 2 sentences of the description for peak algorithm indexation.`;
  }

  if (lowerMsg.includes('script') || lowerMsg.includes('outline') || lowerMsg.includes('structure')) {
    return `Here is a high-retention video script structure for **${cleanSubject}**:\n\n` +
      `⏱️ **0:00 - 0:15 | The Hook:** Bold visual statement + core promise of what the viewer gains.\n` +
      `⏱️ **0:15 - 1:00 | The Problem:** Why standard advice fails and the frustration of being stuck.\n` +
      `⏱️ **1:00 - 4:00 | Core Framework:** 3 distinct, actionable steps with on-screen visual demonstrations.\n` +
      `⏱️ **4:00 - 6:00 | The Insider Secret:** A breakthrough workflow tip that overdelivers on the title promise.\n` +
      `⏱️ **6:00 - 6:30 | Seamless Bridge CTA:** Direct viewers into your next relevant video or resource without sounding like an ad.\n\n` +
      `💡 **Pacing Tip:** Keep delivery pace between 135–155 WPM and change visual camera angles or graphics every 4–5 seconds.`;
  }

  if (lowerMsg.includes('thumbnail') || lowerMsg.includes('ctr')) {
    return `Here are 3 clickable thumbnail concepts for **${cleanSubject}**:\n\n` +
      `🎨 **Concept A (Before vs After):** Split screen showing frustrated struggle on left vs clean breakthrough result on right.\n` +
      `🎨 **Concept B (The Secret Method):** Close-up expressive face reacting to a high-contrast graphic with 2-word text: *"DON'T DO THIS"*\n` +
      `🎨 **Concept C (The Minimalist Curiosity):** Crisp high-res focal asset centered on a dark blurred background with text: *"10X FASTER"*\n\n` +
      `💡 **Thumbnail Rule:** Ensure your text is readable at 120x90px (mobile feed size) with high edge contrast and drop shadows.`;
  }

  // General creator consulting response
  return `I've analyzed your question regarding **"${lastUserMsg.replace(/[*_]/g, '')}"**!\n\n` +
    `As your Creator Co-Pilot, here is what I recommend for maximum reach and audience retention:\n\n` +
    `1. **Deliver Immediate Value:** Satisfy the viewer's primary intent in the first 60 seconds before branching into sub-topics.\n` +
    `2. **Algorithm Synergy:** Ensure your title, thumbnail visual text, and the first 30 seconds of spoken audio align seamlessly on **${cleanSubject}**.\n` +
    `3. **Visual Dynamics & Captions:** Use dynamic animated captions (available in Caption Studio) to keep mobile attention locked in.\n\n` +
    `What specific area should we tackle next? I can generate viral titles, script an engaging hook, or outline an entire high-retention video!`;
};

/**
 * POST /api/v1/chat
 * Multi-Engine Intelligence: OpenAI ChatGPT -> Groq GPT-OSS / Llama 3.3 -> Gemini -> Fallback
 */
const chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;
    const openAiApiKey = req.headers['x-openai-key'];
    const groqApiKey = req.headers['x-groq-key'];
    const geminiApiKey = req.headers['x-gemini-key'];

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return sendError(res, 'Messages array is required', [], 400);
    }

    // 1. Prioritize OpenAI ChatGPT if an OpenAI key is configured (header or .env)
    try {
      const openAiResult = await generateChatWithOpenAI(messages, CREATOR_SYSTEM_PROMPT, { openAiApiKey });
      if (openAiResult && openAiResult.reply) {
        return sendSuccess(res, { 
          reply: openAiResult.reply, 
          provider: openAiResult.provider, 
          model: openAiResult.model 
        }, 'Chat response generated via OpenAI ChatGPT');
      }
    } catch (err) {
      console.warn('[ChatController] OpenAI chat attempt skipped/failed:', err.message);
    }

    // 2. Ultra-fast, context-rich Groq LPU engine (openai/gpt-oss-120b, llama-3.3-70b-versatile)
    try {
      const groqResult = await generateChatWithGroq(messages, CREATOR_SYSTEM_PROMPT, { groqApiKey });
      if (groqResult && groqResult.reply) {
        return sendSuccess(res, { 
          reply: groqResult.reply, 
          provider: groqResult.provider, 
          model: groqResult.model 
        }, 'Chat response generated via Groq LPU');
      }
    } catch (err) {
      console.warn('[ChatController] Groq chat attempt skipped/failed:', err.message);
    }

    // 3. Cloud Google Gemini fallback
    try {
      let prompt = `${CREATOR_SYSTEM_PROMPT}\n\nConversation History:\n`;
      messages.forEach(msg => {
        const role = msg.role === 'assistant' ? 'Assistant' : 'User';
        prompt += `${role}: ${msg.content}\n\n`;
      });
      prompt += `Assistant:`;

      const geminiReply = await generateLLMText(prompt, 'text', { geminiApiKey });
      if (geminiReply && geminiReply.length > 10) {
        return sendSuccess(res, { 
          reply: geminiReply, 
          provider: 'Gemini', 
          model: 'Gemini 3.6 Flash' 
        }, 'Chat response generated via Google Gemini');
      }
    } catch (geminiErr) {
      console.warn('[ChatController] Gemini LLM unavailable:', geminiErr.message);
    }

    // 4. Offline Co-Pilot Intelligence Fallback
    console.info('[ChatController] Using smart offline Creator Co-Pilot strategy');
    const fallbackReply = generateFallbackChatReply(messages);
    return sendSuccess(res, { 
      reply: fallbackReply, 
      isFallback: true, 
      provider: 'Offline Co-Pilot', 
      model: 'Rule-Based Strategy' 
    }, 'Chat response generated via offline strategy');

  } catch (err) {
    console.error('[ChatController Error]', err);
    return sendError(res, 'Failed to generate chat response', err, 500);
  }
};

module.exports = {
  chatWithAI
};
