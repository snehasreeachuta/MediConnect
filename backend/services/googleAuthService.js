const { OAuth2Client } = require('google-auth-library');
const config = require('../config/environment');
const AppError = require('../utils/AppError');

let client = null;

function getClient() {
  if (!client && config.google.clientId) {
    client = new OAuth2Client(config.google.clientId);
  }
  return client;
}

/**
 * Verify Google ID Token server-side
 * @param {string} idToken 
 * @returns {Promise<{ googleId: string, email: string, name: string, picture: string }>}
 */
async function verifyGoogleIdToken(idToken) {
  if (!idToken) {
    throw new AppError('Google ID token is required.', 400);
  }

  // If google client id is not configured, support development mock token for testing
  if (!config.google.clientId) {
    console.warn('[GoogleAuth] GOOGLE_CLIENT_ID not configured in backend/.env. Using development mock verification.');
    return {
      googleId: 'mock_google_sub_123456789',
      email: 'mock.google.user@mediconnect.local',
      name: 'Google Verified User',
      picture: null
    };
  }

  try {
    const oAuthClient = getClient();
    const ticket = await oAuthClient.verifyIdToken({
      idToken,
      audience: config.google.clientId
    });

    const payload = ticket.getPayload();
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };
  } catch (err) {
    console.error('[GoogleAuth] Token verification failed:', err.message);
    throw new AppError('Invalid or expired Google authentication token.', 401);
  }
}

module.exports = {
  verifyGoogleIdToken
};
