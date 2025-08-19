const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const playgroundRoutes = require('./routes/playground');
const executeRoutes = require('./routes/execute');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

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