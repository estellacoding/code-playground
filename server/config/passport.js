const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./database');

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.CLIENT_URL}/api/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('OAuth Profile:', JSON.stringify(profile, null, 2));
      
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE google_id = $1',
        [profile.id]
      );

      if (rows.length > 0) {
        console.log('Existing user found:', rows[0].email);
        return done(null, rows[0]);
      }

      console.log('Creating new user for:', profile.emails[0].value);
      const newUser = await pool.query(
        'INSERT INTO users (google_id, email, name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [
          profile.id, 
          profile.emails[0].value, 
          profile.displayName, 
          profile.photos && profile.photos[0] ? profile.photos[0].value : null
        ]
      );

      console.log('New user created:', newUser.rows[0].email);
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