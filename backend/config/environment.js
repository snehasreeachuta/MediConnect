require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET || 'mediconnect-super-secure-dev-jwt-secret-key-change-in-prod-2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mediconnect',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
  },
  llm: {
    apiKey: process.env.LLM_API_KEY || '',
    model: process.env.LLM_MODEL || 'gemini-1.5-flash',
    enableMockSummarization: process.env.ENABLE_MOCK_SUMMARIZATION === 'true' || !process.env.LLM_API_KEY
  },
  upload: {
    directory: process.env.UPLOAD_DIR || 'uploads',
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10
  }
};
