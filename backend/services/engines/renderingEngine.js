const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const ProcessingEngine = require('./processingEngine');

/**
 * Rendering Engine
 * Responsibilities: Subtitle rendering, SRT generation, FFmpeg video export, Caption preview
 */
class RenderingEngine {
  /**
   * Format seconds to SRT timestamp string (00:00:00,000)
   */
  static formatSrtTimestamp(seconds) {
    const date = new Date(null);
    date.setMilliseconds(seconds * 1000);
    const timeStr = date.toISOString().substring(11, 23);
    return timeStr.replace('.', ',');
  }

  /**
   * Convert subtitle objects array into raw SRT string format
   */
  static generateSrtString(subtitles = []) {
    if (!subtitles || subtitles.length === 0) {
      return `1\n00:00:00,000 --> 00:00:05,000\nWelcome to AI Creator Dashboard!`;
    }

    return subtitles
      .map((sub, idx) => {
        const start = this.formatSrtTimestamp(sub.start || idx * 3);
        const end = this.formatSrtTimestamp(sub.end || (idx + 1) * 3);
        return `${idx + 1}\n${start} --> ${end}\n${sub.text || sub.content || ''}`;
      })
      .join('\n\n');
  }

  /**
   * Burn subtitles onto video using FFmpeg
   */
  static renderBurnedVideo(videoPath, subtitles, styleConfig = {}) {
    return new Promise((resolve, reject) => {
      const { TEMP_DIR } = ProcessingEngine.getDirectories();
      const srtPath = path.join(TEMP_DIR, `sub_${Date.now()}.srt`);
      const outputVideoPath = path.join(TEMP_DIR, `rendered_${Date.now()}.mp4`);

      // Write temporary SRT file
      const srtContent = this.generateSrtString(subtitles);
      fs.writeFileSync(srtPath, srtContent);

      const fontSize = styleConfig.fontSize || 24;
      const primaryColor = styleConfig.fontColor ? styleConfig.fontColor.replace('#', '&H') : '&HFFFFFF';

      // FFmpeg command to burn subtitles
      const command = `ffmpeg -i "${videoPath}" -vf "subtitles='${srtPath.replace(/\\/g, '/')}':force_style='FontSize=${fontSize},PrimaryColour=${primaryColor}'" -c:a copy "${outputVideoPath}" -y`;

      exec(command, (error) => {
        // Clean up temp SRT
        ProcessingEngine.cleanupFile(srtPath);

        if (error) {
          console.warn(`[Rendering Engine Warning] FFmpeg video rendering fallback: ${error.message}`);
          // Return input videoPath if FFmpeg rendering fails
          return resolve({ videoUrl: videoPath, isFallback: true });
        }

        resolve({ videoUrl: outputVideoPath, isFallback: false });
      });
    });
  }
}

module.exports = RenderingEngine;
