import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

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
  if (isConnected) return;
  
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set');
    return;
  }
  
  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'CarHirePro Backend API', 
    status: 'running',
    mongoUri: process.env.MONGO_URI ? 'set' : 'NOT SET',
    jwtSecret: process.env.JWT_SECRET ? 'set' : 'NOT SET'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API test route works!' });
});

// Dynamic route imports with error handling
app.use('/api/auth', async (req, res, next) => {
  try {
    await connectDB();
    const authRoutes = (await import('../src/routes/authRoutes.js')).default;
    return authRoutes(req, res, next);
  } catch (err) {
    console.error('Auth routes error:', err);
    res.status(500).json({ error: 'Failed to load auth routes', details: err.message });
  }
});

app.use('/api/cars', async (req, res, next) => {
  try {
    await connectDB();
    const carRoutes = (await import('../src/routes/carRoutes.js')).default;
    return carRoutes(req, res, next);
  } catch (err) {
    console.error('Car routes error:', err);
    res.status(500).json({ error: 'Failed to load car routes', details: err.message });
  }
});

app.use('/api/clients', async (req, res, next) => {
  try {
    await connectDB();
    const clientRoutes = (await import('../src/routes/clientRoutes.js')).default;
    return clientRoutes(req, res, next);
  } catch (err) {
    console.error('Client routes error:', err);
    res.status(500).json({ error: 'Failed to load client routes', details: err.message });
  }
});

app.use('/api/vehicles', async (req, res, next) => {
  try {
    await connectDB();
    const vehicleRoutes = (await import('../src/routes/vehicleRoutes.js')).default;
    return vehicleRoutes(req, res, next);
  } catch (err) {
    console.error('Vehicle routes error:', err);
    res.status(500).json({ error: 'Failed to load vehicle routes', details: err.message });
  }
});

app.use('/api/bookings', async (req, res, next) => {
  try {
    await connectDB();
    const bookingRoutes = (await import('../src/routes/bookingRoutes.js')).default;
    return bookingRoutes(req, res, next);
  } catch (err) {
    console.error('Booking routes error:', err);
    res.status(500).json({ error: 'Failed to load booking routes', details: err.message });
  }
});

app.use('/api/analytics', async (req, res, next) => {
  try {
    await connectDB();
    const analyticsRoutes = (await import('../src/routes/analyticsRoutes.js')).default;
    return analyticsRoutes(req, res, next);
  } catch (err) {
    console.error('Analytics routes error:', err);
    res.status(500).json({ error: 'Failed to load analytics routes', details: err.message });
  }
});

app.use('/api/quick-actions', async (req, res, next) => {
  try {
    await connectDB();
    const quickActionsRoutes = (await import('../src/routes/quickActionsRoutes.js')).default;
    return quickActionsRoutes(req, res, next);
  } catch (err) {
    console.error('Quick actions routes error:', err);
    res.status(500).json({ error: 'Failed to load quick actions routes', details: err.message });
  }
});

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
