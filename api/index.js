import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Import routes statically
import authRoutes from '../src/routes/authRoutes.js';
import carRoutes from '../src/routes/carRoutes.js';
import clientRoutes from '../src/routes/clientRoutes.js';
import vehicleRoutes from '../src/routes/vehicleRoutes.js';
import bookingRoutes from '../src/routes/bookingRoutes.js';
import analyticsRoutes from '../src/routes/analyticsRoutes.js';
import quickActionsRoutes from '../src/routes/quickActionsRoutes.js';

const app = express();

// CORS configuration - must specify exact origin when using credentials
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'https://car-hire-pro-frontend-omega.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection (lazy - only connect when needed)
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set');
    throw new Error('MONGO_URI environment variable is not set');
  }
  
  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

// Middleware to ensure DB connection before routes that need it
const ensureDB = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
};

// Health check route (no DB needed)
app.get('/', (req, res) => {
  res.json({ 
    message: 'CarHirePro Backend API', 
    status: 'running',
    mongoUri: process.env.MONGO_URI ? 'set' : 'NOT SET',
    jwtSecret: process.env.JWT_SECRET ? 'set' : 'NOT SET',
    dbState: mongoose.connection.readyState
  });
});

// Test route (no DB needed)
app.get('/api/test', (req, res) => {
  res.json({ message: 'API test route works!' });
});
app.get('/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

// Auth routes - support both /auth and /api/auth
app.use('/auth', ensureDB, authRoutes);
app.use('/api/auth', ensureDB, authRoutes);

// Cars routes
app.use('/cars', ensureDB, carRoutes);
app.use('/api/cars', ensureDB, carRoutes);

// Clients routes
app.use('/clients', ensureDB, clientRoutes);
app.use('/api/clients', ensureDB, clientRoutes);

// Vehicles routes
app.use('/vehicles', ensureDB, vehicleRoutes);
app.use('/api/vehicles', ensureDB, vehicleRoutes);

// Bookings routes
app.use('/bookings', ensureDB, bookingRoutes);
app.use('/api/bookings', ensureDB, bookingRoutes);

// Analytics routes
app.use('/analytics', ensureDB, analyticsRoutes);
app.use('/api/analytics', ensureDB, analyticsRoutes);

// Quick actions routes
app.use('/quick-actions', ensureDB, quickActionsRoutes);
app.use('/api/quick-actions', ensureDB, quickActionsRoutes);

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message
  });
});

export default app;
