// Guards routes that require a logged-in user.
// The authenticated user's id comes ONLY from the server-side session
// (req.session.userId), which is set in controllers/authController.js
// after the Google ID token was verified. We never trust a user id
// sent by the client in the body/query/params.
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  req.userId = req.session.userId;
  next();
}

module.exports = { requireAuth };
