const http = require('http');
const app = require('./app');
const setupSocket = require('./socket/socket');
const { scheduleDeadlineCheck } = require('./utils/cronJobs');

const PORT = process.env.PORT || 5000;

// ✅ Create HTTP server
const server = http.createServer(app);

// ✅ Setup Socket.io
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ['GET', 'POST'],
    credentials: true
  }
});


app.set('io', io);

// ✅ Setup socket handlers
setupSocket(io);

// ✅ Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready`);
  scheduleDeadlineCheck();
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});
