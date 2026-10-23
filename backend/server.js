require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Attempt database connection (falls back smoothly if MongoDB is not running locally)
  await connectDB();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`[Server] Todo API server running on http://localhost:${PORT}`);
    console.log(`[Server] Health check available at http://localhost:${PORT}/api/health`);
    console.log(`[Server] Todos API available at http://localhost:${PORT}/api/todos`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = async (signal) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await disconnectDB();
      console.log('[Server] Database connection closed. Exit clean.');
      process.exit(0);
    });

    // Force exit if not closed within 10 seconds
    setTimeout(() => {
      console.error('[Server] Forcing shutdown after timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer().catch(err => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
