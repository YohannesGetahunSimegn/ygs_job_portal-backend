require('dotenv').config();
const cors = require('cors');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('./routes/authRoutes');
const jobPostRoutes = require('./routes/jobPostRoutes'); // New job routes

require('./config/PassportConfig');

const app = express();

// Configure session
app.use(session({
  secret: 'your_unsecret_key',
  resave: false,
  saveUninitialized: true    
}));

// Middleware
app.use(express.json());
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', authRoutes);
app.use('/api/jobs', jobPostRoutes); // New route for job functionalities

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
