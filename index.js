require('dotenv').config();
const cors = require('cors');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
require('./config/PassportConfig');

const app = express();

app.use(session({
  secret: 'your_unsecret_key', // You should replace this with a strong secret
  resave: false,             // Don't resave session if not modified
  saveUninitialized: true    // Save uninitialized sessions
}));
app.use(express.json());
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
