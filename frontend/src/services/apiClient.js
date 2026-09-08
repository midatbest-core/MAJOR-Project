import axios from 'axios';

/**
 * Standardized API v1 Axios Client
 */
const apiClient = axios.create({
  baseURL: '/api/v1'
});

// Request interceptor to automatically handle FormData content-type headers
apiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  // Inject API keys from Settings if they exist and are valid
  const rawOpenAiKey = localStorage.getItem('OPENAI_API_KEY');
  const rawGeminiKey = localStorage.getItem('GEMINI_API_KEY');
  const rawGroqKey = localStorage.getItem('GROQ_API_KEY');
  const rawYoutubeKey = localStorage.getItem('YOUTUBE_API_KEY');
  const openAiKey = rawOpenAiKey ? rawOpenAiKey.trim() : '';
  const geminiKey = rawGeminiKey ? rawGeminiKey.trim() : '';
  const groqKey = rawGroqKey ? rawGroqKey.trim() : '';
  const youtubeKey = rawYoutubeKey ? rawYoutubeKey.trim() : '';

  if (openAiKey && openAiKey !== 'undefined' && openAiKey !== 'null') {
    config.headers['X-OpenAI-Key'] = openAiKey;
  }
  if (geminiKey && geminiKey !== 'undefined' && geminiKey !== 'null') {
    config.headers['X-Gemini-Key'] = geminiKey;
  }
  if (groqKey && groqKey !== 'undefined' && groqKey !== 'null') {
    config.headers['X-Groq-Key'] = groqKey;
  }
  if (youtubeKey && youtubeKey !== 'undefined' && youtubeKey !== 'null') {
    config.headers['X-YouTube-Key'] = youtubeKey;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;
