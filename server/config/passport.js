const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./database');

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Construct full callback URL based on environment
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? (process.env.CLIENT_URL || 'https://codeplayground.zeabur.app')
    : 'http://localhost:5001';
  const callbackURL = `${baseUrl}/api/auth/google/callback`;
  
  console.log(`OAuth Callback URL configured: ${callbackURL}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`CLIENT_URL: ${process.env.CLIENT_URL}`);
  
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('OAuth profile received:', {
        id: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName
      });

      const { rows } = await pool.query(
        'SELECT * FROM users WHERE google_id = $1',
        [profile.id]
      );

      if (rows.length > 0) {
        console.log('Existing user found:', rows[0].id);
        return done(null, rows[0]);
      }

      console.log('Creating new user...');
      const newUser = await pool.query(
        'INSERT INTO users (google_id, email, name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [
          profile.id, 
          profile.emails[0].value, 
          profile.displayName, 
          profile.photos && profile.photos[0] ? profile.photos[0].value : null
        ]
      );

      console.log('New user created:', newUser.rows[0].id);
      return done(null, newUser.rows[0]);
    } catch (error) {
      console.error('OAuth Error:', error);
      return done(error, null);
    }
  }));
} else {
  console.warn('Google OAuth credentials not provided. OAuth authentication will be disabled.');
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, rows[0]);
  } catch (error) {
    done(error, null);
  }
});