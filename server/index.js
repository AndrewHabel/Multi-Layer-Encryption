const express = require('express');
const cors = require('cors');
const path = require('path');
const encryptionRoutes = require('./routes/encryptionRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for large encrypted data
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API routes
app.use('/api/encryption', encryptionRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});