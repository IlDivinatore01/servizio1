const express = require('express');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const connectDB = require('./config/db');
// Import is changed here (no curly braces)
const errorHandler = require('./middleware/errorHandler');

// Connect to Database
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const stickerRoutes = require('./routes/stickerRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const characterRoutes = require('./routes/characterRoutes');

const app = express();

// Middleware to log all incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.path}`);
    next();
});

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // allow non-browser requests
        try {
            const url = new URL(origin);
            if ((url.hostname === 'localhost' || url.hostname === '127.0.0.1') && url.port) {
                return callback(null, true);
            }
        } catch (e) {
            console.error('CORS origin parsing error:', e);
        }
        callback(new Error('Not allowed by CORS'));
    }
}));

// Swagger UI Setup
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount API routers BEFORE static assets and SPA handler
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stickers', stickerRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/characters', characterRoutes);

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Handle SPA: All other GET requests not handled by previous routes should return the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Custom Error Handler Middleware
app.use(errorHandler);

const startServer = (port) => {
  app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${port + 1}...`);
      // Add a small delay before retrying
      setTimeout(() => {
        startServer(parseInt(port) + 1);
      }, 1000);
    } else {
      console.error(err);
    }
  });
};

const PORT = parseInt(process.env.PORT) || 5001;
startServer(PORT);