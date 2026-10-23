const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const todoRoutes = require('./routes/todoRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

const app = express();

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: allowedOrigin === '*' ? true : allowedOrigin,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser with size limits
app.use(express.json({ limit: '10kb' }));

// Rate limiting (disabled during tests)
if (process.env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  });
  app.use('/api', limiter);
}

// Welcome route
app.get('/', (req, res) => {
  res.json({
    name: 'Full-Stack Todo API',
    version: '1.1.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      todos: '/api/todos',
    },
  });
});

// Mount Routes
app.use('/api', healthRoutes);
app.use('/api/todos', todoRoutes);

// 404 & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
