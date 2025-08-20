const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const playgroundRoutes = require('./routes/playground');
const executeRoutes = require('./routes/execute');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS - allow same origin and development origins
const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    // Allow same origin requests (no origin header when same domain)
    if (!origin) {
      console.log('CORS: Same origin request allowed');
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'https://codeplayground.zeabur.app',
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL
    ].filter(Boolean);
    
    console.log('CORS check - Origin:', origin, 'Allowed origins:', allowedOrigins);
    
    if (allowedOrigins.includes(origin)) {
      console.log('CORS: Origin allowed');
      return callback(null, true);
    }
    
    console.log('CORS: Origin not allowed');
    callback(null, false);
  }
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Create PostgreSQL session store
const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Session configuration
const sessionConfig = {
  store: new pgSession({
    pool: sessionPool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    sameSite: 'lax', // Changed from 'none' to 'lax' for same-origin
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
    // Removed domain setting to let it default to current domain
  }
};

console.log('Session config:', {
  secure: sessionConfig.cookie.secure,
  sameSite: sessionConfig.cookie.sameSite,
  nodeEnv: process.env.NODE_ENV
});

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

require('./config/passport');

app.use('/api/auth', authRoutes);
app.use('/api/playground', playgroundRoutes);
app.use('/api/execute', executeRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'public')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'Code Playground API is running!' });
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});