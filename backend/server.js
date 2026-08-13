require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbStore = require('./src/storage/dbStore');
const scraperRoutes = require('./src/routes/scraperRoutes');
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const propertyRoutes = require('./src/routes/propertyRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scriper2';

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Unified Scriper 2 Engine & Accommodation Onboarding API',
    database: dbStore.isMongo() ? 'MongoDB' : 'Local JSON Store',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('🚀 Unified Scriper 2 Backend & Accommodation Onboarding API is running.');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Exception Handler]:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
async function startServer() {
  await dbStore.initDb(MONGODB_URI);
  app.listen(PORT, () => {
    console.log('\n======================================================');
    console.log(`🚀 [Unified Backend Server] Running on http://localhost:${PORT}`);
    console.log(`🔌 Database Mode: ${dbStore.isMongo() ? 'MongoDB' : 'Local JSON File Store'}`);
    console.log('📌 Mounted Endpoints: /api/scraper, /api/auth, /api/users, /api/properties');
    console.log('======================================================\n');
  });
}

startServer();
