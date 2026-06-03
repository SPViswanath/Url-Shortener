const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Expose io instance to routes
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  // Join a specific URL room to listen for its analytics updates
  socket.on('join_url_room', (urlId) => {
    socket.join(urlId);
  });
});

// Connect to MongoDB
connectDB();

// ─── Middleware ───────────────────────────────────────────────
// CORS - Allow requests from frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// ─── API Routes ──────────────────────────────────────────────
// Auth routes
app.use('/api/auth', require('./routes/auth'));

// URL routes
app.use('/api/urls', require('./routes/urls'));

// Analytics routes
app.use('/api/analytics', require('./routes/analytics'));

// Redirect route
// IMPORTANT: This must come AFTER /api/* routes to avoid conflicts
app.use('/', require('./routes/redirect'));

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'URL Shortener API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler (API only) ──────────────────────────────────
app.use('/api/{*path}', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error',
  });
});

// ─── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`💊 Health: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
