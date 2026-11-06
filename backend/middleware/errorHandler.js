const config = require('../config/environment');

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected internal server error occurred.';

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = `File too large. Maximum allowed size is ${config.upload.maxFileSizeMb} MB.`;
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field in upload request.';
  }

  // Safe logging that does not log medical records
  console.error(`[Error ${statusCode}] ${req.method} ${req.originalUrl}:`, message);
  if (statusCode === 500 && config.nodeEnv === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    message,
    ...(err.details ? { details: err.details } : {})
  });
}

module.exports = errorHandler;
