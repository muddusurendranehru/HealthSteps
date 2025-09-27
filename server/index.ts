import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cookieParser from 'cookie-parser';
import { DatabaseStorage } from './storage.js';
import { createRoutes } from './routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Session store
const PgSession = connectPgSimple(session);
const sessionStore = new PgSession({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: true,
});

// Middleware
app.use(cors({
  origin: true, // Allow all origins for healthcare center simplicity
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'healthcare-center-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Allow HTTP for healthcare center
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Serve static files from root directory for flat file access
app.use(express.static('.'));

// Database storage
const storage = new DatabaseStorage();

// API routes
app.use(createRoutes(storage));

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: '.' });
});

app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: '.' });
});

app.get('/signup', (req, res) => {
  res.sendFile('signup.html', { root: '.' });
});

app.get('/dashboard', (req, res) => {
  res.sendFile('dashboard.html', { root: '.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HealthStep server running on port ${PORT}`);
  console.log('Healthcare center step tracking system ready!');
});

export default app;