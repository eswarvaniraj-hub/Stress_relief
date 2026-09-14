const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verifies the ID token's signature, audience, issuer and expiry with
// Google's servers. Throws if the token is invalid/expired/wrong audience.
// Returns only the verified claims we need.
async function verifyGoogleIdToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw new Error('Invalid Google token payload');
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || payload.given_name || 'Google User',
    picture: payload.picture || null,
    emailVerified: payload.email_verified
  };
}

module.exports = { verifyGoogleIdToken };
