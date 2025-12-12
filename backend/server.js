require('dotenv').config();

// Import logger first
const logger = require('./config/logger');
const constants = require('./config/constants');

// Validate critical environment variables
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingEnvVars.length > 0) {
  logger.error('CRITICAL ERROR: Missing required environment variables:', missingEnvVars.join(', '));
  logger.error('Please create a .env file with all required variables. See .env.example for reference.');
  process.exit(1);
}

logger.info('Environment variables validated');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const http = require('http');
const { Server } = require('socket.io');
const { testConnection, syncDatabase } = require('./config/database');
const { Message } = require('./db-models');

// Import routes
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payments');
const ccbillPaymentsRoutes = require('./routes/ccbill-payments');
const workerRoutes = require('./routes/workers');
const securityRoutes = require('./routes/security');
const communityRoutes = require('./routes/community');
const bookingsRoutes = require('./routes/bookings');
const walletRoutes = require('./routes/wallet');
const albumsRoutes = require('./routes/albums');
const aiMatchmakingRoutes = require('./routes/ai-matchmaking');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Configure Redis adapter for Socket.IO if REDIS_URL is provided
if (process.env.REDIS_URL) {
  const { createAdapter } = require('@socket.io/redis-adapter');
  const { createClient } = require('redis');

  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();

  Promise.all([pubClient.connect(), subClient.connect()])
    .then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      logger.info('Socket.IO Redis adapter configured successfully');
    })
    .catch((error) => {
      logger.error('Failed to configure Redis adapter:', error);
      logger.warn('Socket.IO will use in-memory adapter (not suitable for multi-instance deployments)');
    });
} else {
  logger.info('REDIS_URL not configured - using in-memory Socket.IO adapter');
}

const PORT = parseInt(process.env.PORT) || 3000;

// Active users tracking (in-memory is OK for this)
const activeUsers = new Map();

// XSS Protection: Sanitize user input
const sanitizeMessage = (message) => {
  if (typeof message !== 'string') return '';
  return message
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .slice(0, constants.MAX_MESSAGE_LENGTH);
};

// Middleware
// Security headers with proper CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-eval needed for Vite dev
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:5173", "ws:", "wss:"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "blob:"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'", "blob:"]
    }
  },
  crossOriginEmbedderPolicy: false // Keep disabled for cross-origin resources
}));

// Response compression
app.use(compression());

// Configure CORS origins from environment variable
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:5173',
      'https://fairworkers.dpdns.org',
      'https://fairworkers-frontend.pages.dev'
    ];

logger.info('CORS origins configured:', corsOrigins.join(', '));

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payments/ccbill', ccbillPaymentsRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/albums', albumsRoutes);
app.use('/api/ai', aiMatchmakingRoutes);

// Chat Routes - Using database persistence
app.get('/api/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get messages from database
    const userMessages = await Message.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
      order: [['created_at', 'ASC']],
      limit: 100 // Limit to last 100 messages
    });

    res.json(userMessages);
  } catch (error) {
    logger.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    // Sanitize message to prevent XSS
    const sanitizedMessage = sanitizeMessage(message);

    // Save to database
    const newMessage = await Message.create({
      sender_id: senderId,
      receiver_id: receiverId,
      content: sanitizedMessage,
      message_type: 'text'
    });

    // Send via Socket.IO
    io.to(receiverId).emit('new-message', newMessage.toJSON());

    res.json(newMessage);
  } catch (error) {
    logger.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Socket.IO pro real-time chat
io.on('connection', (socket) => {
  logger.info(`New user connected: ${socket.id}`);

  // Uživatel se přihlásil do chatu
  socket.on('user-online', (userId) => {
    activeUsers.set(userId, socket.id);
    socket.join(userId); // Uživatel se přidá do room s jeho ID
    logger.info(`User ${userId} is online`);

    // Pošleme seznam aktivních uživatelů
    io.emit('users-online', Array.from(activeUsers.keys()));
  });

  // Nová zpráva
  socket.on('send-message', async (data) => {
    try {
      const { senderId, receiverId, message } = data;

      // Sanitize message to prevent XSS
      const sanitizedMessage = sanitizeMessage(message);

      // Save to database
      const newMessage = await Message.create({
        sender_id: senderId,
        receiver_id: receiverId,
        content: sanitizedMessage,
        message_type: 'text'
      });

      // Pošleme zprávu oběma uživatelům
      const messageJson = newMessage.toJSON();
      io.to(senderId).emit('new-message', messageJson);
      io.to(receiverId).emit('new-message', messageJson);

      logger.info(`Message sent from ${senderId} to ${receiverId}`);
    } catch (error) {
      logger.error('Error sending message via socket:', error);
    }
  });

  // Zpráva byla přečtena
  socket.on('mark-read', async (messageId) => {
    try {
      await Message.update(
        { is_read: true, read_at: new Date() },
        { where: { id: messageId } }
      );
    } catch (error) {
      logger.error('Error marking message as read:', error);
    }
  });

  // Uživatel začíná psát
  socket.on('typing', (data) => {
    const { senderId, receiverId } = data;
    io.to(receiverId).emit('user-typing', { userId: senderId });
  });

  // ========== WebRTC Video Chat Signaling ==========

  // Join live stream
  socket.on('join-stream', (data) => {
    const { streamId, userId } = data;
    socket.join(`stream-${streamId}`);
    logger.info(`User ${userId} joined stream ${streamId}`);

    // Notify streamer about new viewer
    io.to(`stream-${streamId}`).emit('viewer-joined', { userId, viewerCount: io.sockets.adapter.rooms.get(`stream-${streamId}`)?.size || 0 });
  });

  // Leave live stream
  socket.on('leave-stream', (data) => {
    const { streamId, userId } = data;
    socket.leave(`stream-${streamId}`);
    logger.info(`User ${userId} left stream ${streamId}`);

    // Notify about viewer count update
    io.to(`stream-${streamId}`).emit('viewer-left', { userId, viewerCount: io.sockets.adapter.rooms.get(`stream-${streamId}`)?.size || 0 });
  });

  // Start streaming (broadcaster)
  socket.on('start-stream', (data) => {
    const { streamId, userId, userName } = data;
    socket.join(`stream-${streamId}`);

    // Broadcast to all users that stream started
    io.emit('stream-started', { streamId, userId, userName, timestamp: new Date().toISOString() });
    logger.info(`User ${userId} started streaming: ${streamId}`);
  });

  // Stop streaming
  socket.on('stop-stream', (data) => {
    const { streamId, userId } = data;

    // Notify all viewers that stream ended
    io.to(`stream-${streamId}`).emit('stream-ended', { streamId });
    logger.info(`Stream ${streamId} ended by ${userId}`);
  });

  // WebRTC Offer (for 1-on-1 or streaming)
  socket.on('webrtc-offer', (data) => {
    const { to, from, offer, callType } = data;
    const targetSocketId = activeUsers.get(to);

    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc-offer', { from, offer, callType });
      logger.debug(`WebRTC offer from ${from} to ${to}`);
    }
  });

  // WebRTC Answer
  socket.on('webrtc-answer', (data) => {
    const { to, from, answer } = data;
    const targetSocketId = activeUsers.get(to);

    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc-answer', { from, answer });
      logger.debug(`WebRTC answer from ${from} to ${to}`);
    }
  });

  // ICE Candidate
  socket.on('ice-candidate', (data) => {
    const { to, candidate } = data;
    const targetSocketId = activeUsers.get(to);

    if (targetSocketId) {
      io.to(targetSocketId).emit('ice-candidate', { candidate });
    }
  });

  // Request private call
  socket.on('request-private-call', (data) => {
    const { workerId, clientId, clientName } = data;
    const workerSocketId = activeUsers.get(workerId);

    if (workerSocketId) {
      io.to(workerSocketId).emit('private-call-request', { clientId, clientName, timestamp: new Date().toISOString() });
      logger.info(`Private call request from ${clientId} to ${workerId}`);
    }
  });

  // Accept private call
  socket.on('accept-private-call', (data) => {
    const { workerId, clientId } = data;
    const clientSocketId = activeUsers.get(clientId);

    if (clientSocketId) {
      io.to(clientSocketId).emit('private-call-accepted', { workerId });
      logger.info(`Private call accepted: ${workerId} ↔ ${clientId}`);
    }
  });

  // Reject private call
  socket.on('reject-private-call', (data) => {
    const { workerId, clientId, reason } = data;
    const clientSocketId = activeUsers.get(clientId);

    if (clientSocketId) {
      io.to(clientSocketId).emit('private-call-rejected', { workerId, reason });
      logger.info(`Private call rejected by ${workerId}`);
    }
  });

  // End private call
  socket.on('end-private-call', (data) => {
    const { callId, userId, otherUserId } = data;
    const otherSocketId = activeUsers.get(otherUserId);

    if (otherSocketId) {
      io.to(otherSocketId).emit('private-call-ended', { userId, callId });
      logger.info(`Private call ended: ${callId}`);
    }
  });

  // Stream chat message
  socket.on('stream-chat-message', (data) => {
    const { streamId, userId, userName, message, timestamp } = data;

    // Sanitize message to prevent XSS
    const sanitizedMessage = sanitizeMessage(message);

    const chatMessage = {
      streamId,
      userId,
      userName,
      message: sanitizedMessage,
      timestamp
    };

    // Broadcast to all viewers in the stream
    io.to(`stream-${streamId}`).emit('stream-chat-message', chatMessage);
    logger.debug(`Stream chat message in ${streamId} from ${userName}`);
  });

  // Stream tip
  socket.on('stream-tip', (data) => {
    const { streamId, userId, userName, amount, timestamp } = data;

    const tipData = {
      streamId,
      userId,
      userName,
      amount,
      timestamp
    };

    // Broadcast tip to all viewers in the stream
    io.to(`stream-${streamId}`).emit('stream-tip-received', tipData);
    logger.info(`Tip of ${amount} Kč from ${userName} in stream ${streamId}`);
  });

  // Odpojení
  socket.on('disconnect', () => {
    // Najdeme a odebereme uživatele
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        logger.info(`User ${userId} disconnected`);
        io.emit('users-online', Array.from(activeUsers.keys()));
        break;
      }
    }
  });
});

// Production: Serve static frontend files
const path = require('path');
if (process.env.NODE_ENV === 'production') {
  // Serve frontend build files
  app.use(express.static(path.join(__dirname, 'public')));

  // All non-API routes return index.html (SPA support)
  app.get('*', (req, res, next) => {
    // Skip API routes and health check
    if (req.path.startsWith('/api') || req.path === '/health' || req.path.startsWith('/uploads') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Health check
app.get('/health', async (req, res) => {
  try {
    const messageCount = await Message.count();
    res.json({
      status: 'OK',
      message: 'FairWorkers API běží',
      timestamp: new Date().toISOString(),
      activeUsers: activeUsers.size,
      totalMessages: messageCount
    });
  } catch (error) {
    res.json({
      status: 'OK',
      message: 'FairWorkers API běží (without DB stats)',
      timestamp: new Date().toISOString(),
      activeUsers: activeUsers.size
    });
  }
});

// Demo endpoint - ukázka férového systému
app.get('/api/demo/compare', (req, res) => {
  const servicePrice = 1000; // 1000 Kč služba

  // Náš systém - používáme konstantu
  const ourCommission = servicePrice * constants.PLATFORM_COMMISSION_RATE;
  const ourWorkerEarnings = servicePrice - ourCommission;

  // Konkurence
  const competitorCommissionRate = 0.40; // 40%
  const competitorCommission = servicePrice * competitorCommissionRate;
  const competitorWorkerEarnings = servicePrice - competitorCommission;

  res.json({
    scenario: 'Služba za 1000 Kč',
    ourSystem: {
      name: 'FairWorkers',
      commission: ourCommission,
      workerEarnings: ourWorkerEarnings,
      commissionRate: constants.PLATFORM_COMMISSION_RATE * 100
    },
    competitor: {
      name: 'Amateri.com',
      commission: competitorCommission,
      workerEarnings: competitorWorkerEarnings,
      commissionRate: competitorCommissionRate * 100
    },
    advantage: ourWorkerEarnings - competitorWorkerEarnings,
    advantagePercentage: ((ourWorkerEarnings - competitorWorkerEarnings) / competitorWorkerEarnings * 100).toFixed(1)
  });
});

// Start server with database connection
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();

    if (dbConnected) {
      // Sync database models (create tables if they don't exist)
      // Use { alter: true } in development to update existing tables
      // Use { force: true } to drop and recreate tables (WARNING: deletes data!)
      await syncDatabase(); // Just verify tables exist, don't modify
      logger.info('Database models synced successfully');
    } else {
      logger.warn('Server starting without database connection');
    }

    // Try to start server with fallback ports
    const startServerOnPort = (port) => {
      return new Promise((resolve, reject) => {
        server.listen(port)
          .once('listening', () => {
            logger.info(`FairWorkers server running on port ${port}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`Socket.IO chat active`);
            logger.info(`Demo comparison: http://localhost:${port}/api/demo/compare`);
            logger.info(`Auth endpoints: http://localhost:${port}/api/auth/register`);
            resolve(port);
          })
          .once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
              logger.warn(`Port ${port} is in use, trying ${port + 1}`);
              resolve(startServerOnPort(port + 1));
            } else {
              reject(err);
            }
          });
      });
    };

    await startServerOnPort(PORT);
  } catch (error) {
    logger.error('Failed to start server:', error);
    logger.error('Error stack:', error.stack);
    process.exit(1);
  }
};

startServer();
