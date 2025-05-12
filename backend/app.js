const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const userRouter = require('./routes/users');
const indexRouter = require('./routes/index');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const winston = require('winston');







// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// Database connection with retry
const connectToDB = require('./config/db');

const connectWithRetry = async () => {
  let retries = 5;
  while (retries) {
    try {
      await connectToDB();
      logger.info('Database connected successfully');
      break;
    } catch (err) {
      logger.error('Database connection failed:', err);
      retries -= 1;
      if (retries === 0) {
        logger.error('Failed to connect to database after retries');
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, 5000)); // Wait 5 seconds
    }
  }
};

connectWithRetry();

const app = express();

// Security middleware
app.use(helmet()); // Secure HTTP headers
app.use(compression()); // Compress responses
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit to 100 requests per window
  })
);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173', // Your Vite dev server
  'https://drive-clone-c0af.onrender.com',
  'https://drive-clone-1-lmus.onrender.com' // Production frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // For legacy browser
}));

app.options('*', cors());

//Request logging
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

// Secure cookies in production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy
}
app.get('/api/healthcheck', (req, res) => {
  res.json({ 
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
// Routes
app.use('/api', indexRouter); // Prefix to avoid conflicts
app.use('/api/users', userRouter); // Specific prefix for user routes

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Closing server...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});