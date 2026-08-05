const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Extracts audio WAV file from video using FFmpeg CLI.
 */
const extractAudio = (videoPath, outputWavPath) => {
  return new Promise((resolve, reject) => {
    const cmd = `ffmpeg -y -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${outputWavPath}"`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn('[FFmpeg Warning] Could not execute ffmpeg command:', error.message);
        // If FFmpeg is not installed on path, resolve gracefully
        return resolve({ success: false, error: error.message });
      }
      resolve({ success: true, outputPath: outputWavPath });
    });
  });
};

/**
 * Generates an ASS/SRT file from transcript segments.
 */
const generateSRT = (transcript = []) => {
  return transcript.map((seg, idx) => {
    const formatTime = (seconds) => {
      const date = new Date(seconds * 1000);
      const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
      const mm = String(date.getUTCMinutes()).padStart(2, '0');
      const ss = String(date.getUTCSeconds()).padStart(2, '0');
      const ms = String(date.getUTCMilliseconds()).padStart(3, '0');
      return `${hh}:${mm}:${ss},${ms}`;
    };

    return `${idx + 1}\n${formatTime(seg.start)} --> ${formatTime(seg.end)}\n${seg.text}\n`;
  }).join('\n');
};

module.exports = {
  extractAudio,
  generateSRT
};
