const { verifyGoogleIdToken } = require('../services/googleAuthService');
const { upsertUserFromGoogle, findUserById } = require('../services/userService');

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    picture: user.profile_picture,
    createdAt: user.created_at,
    lastLogin: user.last_login
  };
}

// POST /api/auth/google
// Body: { credential: "<Google ID token from the existing frontend flow>" }
async function googleLogin(req, res) {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Missing Google credential' });
    }

    const verified = await verifyGoogleIdToken(credential);

    const user = await upsertUserFromGoogle({
      googleId: verified.googleId,
      name: verified.name,
      email: verified.email,
      picture: verified.picture
    });

    // Regenerate session to prevent session fixation, then store only
    // the internal user id server-side.
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regenerate error:', err);
        return res.status(500).json({ error: 'Could not create session' });
      }
      req.session.userId = user.id;
      res.json({ user: toPublicUser(user) });
    });
  } catch (err) {
    console.error('Google login error:', err.message);
    res.status(401).json({ error: 'Google authentication failed' });
  }
}

// GET /api/auth/me
async function me(req, res) {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const user = await findUserById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error('Me endpoint error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/auth/logout
function logout(req, res) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    path: '/',
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  };

  const clearAllCookies = () => {
    res.clearCookie('breathly.sid', cookieOptions);
    res.clearCookie('connect.sid', cookieOptions);
    res.clearCookie('breathly.sid');
    res.clearCookie('connect.sid');
  };

  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout session destroy error:', err.message);
      }
      clearAllCookies();
      return res.json({ success: true });
    });
  } else {
    clearAllCookies();
    return res.json({ success: true });
  }
}

module.exports = { googleLogin, me, logout };
