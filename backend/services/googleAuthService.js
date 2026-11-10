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

  // Development testing mode token handling
  const isDevToken = idToken.startsWith('mock_') || idToken.startsWith('dev-mock');
  if (isDevToken) {
    console.log('[GoogleAuth] Developer testing mode token received.');
    return {
      googleId: 'mock_google_sub_123456789',
      email: 'mock.google.user@mediconnect.local',
      name: 'Google Verified User',
      picture: null
    };
  }

  if (!config.google.clientId) {
    throw new AppError('Google OAuth Client ID is not configured on the server. Please set GOOGLE_CLIENT_ID in backend/.env.', 400);
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
    console.error('[GoogleAuth] Real Google token verification failed:', err.message);
    throw new AppError(`Invalid or expired Google authentication token: ${err.message}`, 401);
  }
}

module.exports = {
  verifyGoogleIdToken
};
