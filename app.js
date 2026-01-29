import dotenv from 'dotenv';
// Load env vars - don't fail if .env doesn't exist (Vercel uses env vars from dashboard)
try {
  dotenv.config();
} catch (err) {
  console.warn('Could not load .env file:', err.message);
}

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import { createDemoUsers } from './src/controllers/authController.js';
import authRoutes from './src/routes/authRoutes.js';
import carRoutes from './src/routes/carRoutes.js';
import clientRoutes from './src/routes/clientRoutes.js';
import vehicleRoutes from './src/routes/vehicleRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import quickActionsRoutes from './src/routes/quickActionsRoutes.js';

// Initialize Express app
const app = express();

// Connect to MongoDB (non-blocking for serverless)
// Don't await - let it connect in background, will retry on first request if needed
connectDB().then(() => {
  // Only create demo users after DB is connected
  createDemoUsers().catch(err => {
    console.error('Demo users creation failed:', err.message);
  });
}).catch(err => {
  console.error('Initial DB connection failed:', err.message);
  // Don't crash - function can still handle requests
});

// Middleware
const corsOptions = {
  origin: [
    'http://localhost:5173',       // Vite dev server
    'http://localhost:3000',       // React dev server
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'https://car-hire-pro-frontend.vercel.app', // Production frontend (no trailing slash)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check route (doesn't require DB connection)
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    message: 'CarHirePro Backend API', 
    status: 'running',
    version: '1.0.0',
    database: dbStatus
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/quick-actions', quickActionsRoutes);

// Catch-all for undefined API routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/api/auth',
      '/api/cars',
      '/api/clients',
      '/api/vehicles',
      '/api/bookings',
      '/api/analytics',
      '/api/quick-actions'
    ]
  });
});

// Error handling middleware (must be last, with 4 parameters)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

export default app;


