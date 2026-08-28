const axios = require('axios');
const AppError = require('../shared/AppError');

/**
 * Helper to extract 11-character YouTube video ID from various URL formats
 */
const extractVideoId = (url) => {
  if (!url) return null;
  // Match standard URLs, youtu.be, and YouTube Shorts
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  
  if (match) return match[1];
  
  // If no match but the string is exactly 11 chars (user just pasted ID)
  if (url.length === 11) return url;
  
  return null;
};

/**
 * Format ISO 8601 duration (e.g. PT14M25S) to human readable string (14:25)
 */
const parseISO8601Duration = (isoDuration) => {
  if (!isoDuration) return "0:00";
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const hours = match[1] ? `${match[1]}:` : '';
  const minutes = match[2] ? (match[1] ? match[2].padStart(2, '0') : match[2]) : '0';
  const seconds = match[3] ? match[3].padStart(2, '0') : '00';
  return `${hours}${minutes}:${seconds}`;
};

/**
 * Fetch video metadata & audience insights from YouTube API
 */
const fetchYouTubeData = async (youtubeUrl, niche = 'Programming', topic = 'Machine Learning', options = {}) => {
  const videoId = extractVideoId(youtubeUrl);
  if (!videoId || videoId.length < 11) {
    throw new AppError('Invalid YouTube URL provided.', 400);
  }

  const apiKey = options.youtubeApiKey || process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new AppError('YouTube API Key is missing. Please configure it in Settings or backend environment variables.', 500);
  }

  try {
    // 1. Fetch Video Metadata
    const videoRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: videoId,
        key: apiKey
      }
    });

    if (!videoRes.data.items || videoRes.data.items.length === 0) {
      throw new AppError('Video not found or is private.', 404);
    }

    const item = videoRes.data.items[0];
    const snippet = item.snippet;
    const stats = item.statistics;
    const details = item.contentDetails;

    const views = parseInt(stats.viewCount || '0', 10);
    const likes = parseInt(stats.likeCount || '0', 10);
    const commentsCount = parseInt(stats.commentCount || '0', 10);
    const durationStr = parseISO8601Duration(details.duration);

    // Calculate derived metrics
    const engagementRate = views > 0 ? parseFloat(((likes + commentsCount) / views * 100).toFixed(2)) : 0;
    const likeViewRatio = views > 0 ? parseFloat((likes / views * 100).toFixed(2)) : 0;
    const commentViewRatio = views > 0 ? parseFloat((commentsCount / views * 100).toFixed(2)) : 0;

    // 2. Fetch Top Comments
    let commentsList = [];
    try {
      const commentRes = await axios.get('https://www.googleapis.com/youtube/v3/commentThreads', {
        params: {
          part: 'snippet',
          videoId: videoId,
          maxResults: 100,
          order: 'relevance',
          key: apiKey
        }
      });
      commentsList = (commentRes.data.items || []).map(c => c.snippet.topLevelComment.snippet.textDisplay);
    } catch (cErr) {
      console.warn('[YouTube API] Comment fetching restricted/failed for this video.', cErr.message);
    }

    return {
      videoId,
      url: youtubeUrl,
      niche,
      topic,
      metrics: {
        title: snippet.title,
        channel: snippet.channelTitle,
        views,
        likes,
        commentsCount,
        duration: durationStr,
        publishedDate: snippet.publishedAt,
        engagementRate,
        likeViewRatio,
        commentViewRatio
      },
      comments: commentsList,
      isLiveApi: true
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error(`[YouTube API Error] ${err.message}`);
    throw new AppError(`Failed to fetch YouTube data: ${err.response?.data?.error?.message || err.message}`, 500);
  }
};

module.exports = {
  extractVideoId,
  fetchYouTubeData
};
