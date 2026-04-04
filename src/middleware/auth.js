const jwt = require('jsonwebtoken');

// This middleware protects routes that require a logged-in user.
// It runs BEFORE the controller. If the token is invalid, the request
// is rejected here and never reaches the controller.
//
// Flow:
//   Client sends: Authorization: Bearer <token>
//   This middleware: verifies token → attaches user data to req.user → calls next()
//   Controller: reads req.user to know who is making the request

const authenticate = (req, res, next) => {
  // 1. Get the Authorization header
  const authHeader = req.headers.authorization;

  // 2. Check it exists and starts with "Bearer "
  //    Format: "Bearer eyJhbGciOiJIUzI1NiIs..."
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  // 3. Extract the token (everything after "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // 4. Verify the token using the same secret that signed it.
    //    jwt.verify() does two things:
    //    - Checks the signature (was this token created by our server?)
    //    - Checks expiration (is the token still valid?)
    //    If either fails, it throws an error.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attach the decoded payload to the request object.
    //    Now any middleware/controller after this can access req.user
    //    to know the user's id, email, and role.
    req.user = decoded;

    // 6. Pass control to the next middleware or controller.
    next();
  } catch (err) {
    // Token is expired, tampered with, or invalid
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

module.exports = authenticate;
