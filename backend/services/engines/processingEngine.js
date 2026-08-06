const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const TEMP_DIR = path.join(__dirname, '../../temp');

// Ensure required directories exist
[UPLOADS_DIR, TEMP_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Processing Engine
 * Responsibilities: File validation, upload management, audio extraction, temporary storage & cleanup
 */
class ProcessingEngine {
  /**
   * Validate uploaded media file format and size
   */
  static validateFile(file, allowedExtensions = ['.mp4', '.mov', '.avi', '.mp3', '.wav', '.m4a'], maxMB = 200) {
    if (!file) {
      throw new Error('No file provided for processing');
    }
    const ext = path.extname(file.originalname || file.name || '').toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Invalid file type ${ext}. Allowed: ${allowedExtensions.join(', ')}`);
    }
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxMB) {
      throw new Error(`File size exceeds maximum limit of ${maxMB}MB`);
    }
    return true;
  }

  /**
   * Extract audio track from video file using FFmpeg
   */
  static extractAudio(videoPath) {
    return new Promise((resolve, reject) => {
      const audioFileName = `audio_${Date.now()}.wav`;
      const audioOutputPath = path.join(TEMP_DIR, audioFileName);

      const command = `ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioOutputPath}" -y`;

      exec(command, (error) => {
        if (error) {
          console.warn(`[Processing Engine] FFmpeg audio extraction warning: ${error.message}`);
          // Return videoPath as fallback if audio extraction cannot run in environment
          return resolve(videoPath);
        }
        resolve(audioOutputPath);
      });
    });
  }

  /**
   * Clean up temporary file asynchronously
   */
  static cleanupFile(filePath) {
    if (!filePath) return;
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[Processing Engine Cleanup] Temporary file deleted: ${path.basename(filePath)}`);
      }
    } catch (err) {
      console.warn(`[Processing Engine Cleanup Warning] Could not delete ${filePath}: ${err.message}`);
    }
  }

  /**
   * Get paths to temp and uploads folders
   */
  static getDirectories() {
    return { UPLOADS_DIR, TEMP_DIR };
  }
}

module.exports = ProcessingEngine;
