// This middleware protects routes that require a logged-in user.
// It checks the request for a valid JWT token before letting it proceed.

const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // Tokens are sent in the header like: "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  const token = authHeader.split(' ')[1]; // grab the part after "Bearer "

  try {
    // Verify the token using our secret key. If it's invalid or expired, this throws.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user's id to the request so later code knows who is making the request
    req.userId = decoded.userId;

    next(); // token is valid, continue to the actual route handler
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
  }
};

module.exports = protect;
