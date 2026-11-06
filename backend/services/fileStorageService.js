const path = require('path');
const fs = require('fs');
const { uploadDir } = require('../middleware/uploadValidation');
const AppError = require('../utils/AppError');

class FileStorageService {
  /**
   * Safely resolve file path inside upload directory to prevent path traversal
   */
  static getSafeFilePath(storedFilename) {
    if (!storedFilename || typeof storedFilename !== 'string') {
      throw new AppError('Invalid filename.', 400);
    }

    // Strip directory traversal patterns
    const sanitized = path.basename(storedFilename);
    const resolvedPath = path.resolve(uploadDir, sanitized);

    if (!resolvedPath.startsWith(uploadDir)) {
      throw new AppError('Access to unauthorized file path is strictly prohibited.', 403);
    }

    return resolvedPath;
  }

  static fileExists(storedFilename) {
    const filePath = this.getSafeFilePath(storedFilename);
    return fs.existsSync(filePath);
  }

  static deleteFile(storedFilename) {
    try {
      const filePath = this.getSafeFilePath(storedFilename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
    } catch (err) {
      console.error(`[FileStorage] Error deleting ${storedFilename}:`, err.message);
    }
    return false;
  }
}

module.exports = FileStorageService;
