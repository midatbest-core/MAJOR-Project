const fs = require('fs');
const path = require('path');

/**
 * Safely deletes a temporary file from disk.
 * @param {string} filePath - Absolute or relative path to the file.
 */
const removeTempFile = (filePath) => {
  if (!filePath) return;
  try {
    const resolvedPath = path.resolve(filePath);
    if (fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
      console.log(`[Cleanup Policy] Temporary file deleted: ${path.basename(resolvedPath)}`);
    }
  } catch (err) {
    console.error(`[Cleanup Warning] Failed to delete file ${filePath}:`, err.message);
  }
};

/**
 * Cleans up temporary files older than maxAgeMs in a given directory.
 * @param {string} dirPath - Directory path.
 * @param {number} maxAgeMs - Max age in milliseconds (default 1 hour).
 */
const cleanupDirectory = (dirPath, maxAgeMs = 3600000) => {
  try {
    const resolvedDir = path.resolve(dirPath);
    if (!fs.existsSync(resolvedDir)) return;
    
    const files = fs.readdirSync(resolvedDir);
    const now = Date.now();
    
    files.forEach(file => {
      const filePath = path.join(resolvedDir, file);
      if (file === '.gitkeep') return;
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > maxAgeMs) {
        fs.unlinkSync(filePath);
        console.log(`[Auto Cleanup] Expired file deleted: ${file}`);
      }
    });
  } catch (err) {
    console.error(`[Cleanup Directory Error]:`, err.message);
  }
};

module.exports = {
  removeTempFile,
  cleanupDirectory
};
