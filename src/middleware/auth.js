const jwt = require('jsonwebtoken');

// verify JWT and attach decoded user to req.user
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // expired, tampered, or just invalid
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

module.exports = authenticate;
