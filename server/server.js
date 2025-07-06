const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const borrowRoutes = require('./routes/borrow');
const adminRoutes = require('./routes/admin');

const app = express();

// CORS Configuration
const allowedOrigins = [
  // Development
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  
  // Common production domains - replace with your actual domains
  'https://your-frontend-domain.com',
  'https://*.vercel.app',
  'https://*.netlify.app',
  'https://*.github.io'
];

// Middleware
app.use((req, res, next) => {
  // Log incoming requests for debugging
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    origin: req.headers.origin,
    'user-agent': req.headers['user-agent']
  });
  next();
});

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    if (allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      allowedOrigin.includes('*') && 
      new URL(origin).hostname.endsWith(allowedOrigin.split('*.')[1])
    )) {
      return callback(null, true);
    }
    
    console.warn(`Blocked request from unauthorized origin: ${origin}`);
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  maxAge: 600 // 10 minutes
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/admin', adminRoutes);

// Connect to MongoDB with better error handling
const connectDB = async () => {
  try {
    // Use MongoDB Atlas connection string if available, otherwise use a mock/in-memory solution
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI || mongoURI.includes('localhost')) {
      console.log('⚠️  MongoDB connection string not configured for cloud database.');
      console.log('📝 To fix this:');
      console.log('   1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas');
      console.log('   2. Create a new cluster');
      console.log('   3. Get your connection string');
      console.log('   4. Add it to your .env file as MONGODB_URI');
      console.log('');
      console.log('🚀 Server starting without database connection...');
      
      // Start server without database connection
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (without database)`);
        console.log('Note: Database operations will fail until MongoDB is properly configured');
      });
      return;
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB Atlas');
    
    // Start server after successful database connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('');
    console.log('📝 To fix this:');
    console.log('   1. Check your MongoDB Atlas connection string');
    console.log('   2. Ensure your IP address is whitelisted');
    console.log('   3. Verify your database credentials');
    console.log('');
    
    // Start server without database connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without database)`);
      console.log('Note: Database operations will fail until MongoDB is properly configured');
    });
  }
};

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

connectDB();