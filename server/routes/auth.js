const express = require('express');
const passport = require('passport');
const router = express.Router();

// Check if Google OAuth is configured
const isGoogleOAuthEnabled = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

if (isGoogleOAuthEnabled) {
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      console.log('OAuth callback successful, user:', req.user);
      const redirectUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      console.log('Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    }
  );
} else {
  router.get('/google', (req, res) => {
    res.status(503).json({ error: 'Google OAuth is not configured' });
  });

  router.get('/google/callback', (req, res) => {
    res.status(503).json({ error: 'Google OAuth is not configured' });
  });
}

// Test endpoint for debugging
router.get('/debug', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    user: req.user,
    session: req.session,
    headers: req.headers,
    isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false
  });
});

router.get('/user', (req, res) => {
  console.log('=== AUTH CHECK ===');
  console.log('Session ID:', req.sessionID);
  console.log('User:', req.user);
  console.log('Session data:', req.session);
  console.log('Is authenticated:', req.isAuthenticated ? req.isAuthenticated() : false);
  console.log('Headers:', req.headers);
  console.log('=== END AUTH CHECK ===');
  
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;