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

// Route handler factory
const createRouteHandler = (routeImportPath) => async (req, res, next) => {
  try {
    await connectDB();
    const routes = (await import(routeImportPath)).default;
    return routes(req, res, next);
  } catch (err) {
    console.error(`Route error (${routeImportPath}):`, err);
    res.status(500).json({ error: 'Failed to load routes', details: err.message });
  }
};

// Auth routes - support both /auth and /api/auth
const authHandler = createRouteHandler('../src/routes/authRoutes.js');
app.use('/auth', authHandler);
app.use('/api/auth', authHandler);

// Cars routes
const carsHandler = createRouteHandler('../src/routes/carRoutes.js');
app.use('/cars', carsHandler);
app.use('/api/cars', carsHandler);

// Clients routes
const clientsHandler = createRouteHandler('../src/routes/clientRoutes.js');
app.use('/clients', clientsHandler);
app.use('/api/clients', clientsHandler);

// Vehicles routes
const vehiclesHandler = createRouteHandler('../src/routes/vehicleRoutes.js');
app.use('/vehicles', vehiclesHandler);
app.use('/api/vehicles', vehiclesHandler);

// Bookings routes
const bookingsHandler = createRouteHandler('../src/routes/bookingRoutes.js');
app.use('/bookings', bookingsHandler);
app.use('/api/bookings', bookingsHandler);

// Analytics routes
const analyticsHandler = createRouteHandler('../src/routes/analyticsRoutes.js');
app.use('/analytics', analyticsHandler);
app.use('/api/analytics', analyticsHandler);

// Quick actions routes
const quickActionsHandler = createRouteHandler('../src/routes/quickActionsRoutes.js');
app.use('/quick-actions', quickActionsHandler);
app.use('/api/quick-actions', quickActionsHandler);

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
