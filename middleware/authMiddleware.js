const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if user is authenticated
exports.requireAuth = async (req, res, next) => {
  try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'Authorization required' });

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decodedToken.userId);
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      req.user = user; // Attach the full user object to the request
      next();
  } catch (error) {
      res.status(401).json({ message: 'Unauthorized' });
  }
};

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];  // Assuming the token is passed as "Bearer <token>"

  if (!token) {
      return next(); // If no token, just proceed to the next middleware (i.e., create job post with unapproved)
  }

  try {
      // Verify the token if it's provided
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach the decoded user to the request object
      next(); // Proceed to the next middleware or route handler
  } catch (err) {
      return res.status(400).send({ message: 'Invalid or expired token.' });
  }
};


// Middleware to check if user is an admin
exports.requireAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin privileges required' });
};
