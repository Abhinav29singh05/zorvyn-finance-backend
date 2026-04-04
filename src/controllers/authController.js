const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

// POST /api/auth/login
// Takes email + password, returns a JWT token if credentials are valid.
//
// Why JWT?
//   After login, the client stores the token (usually in localStorage or a cookie).
//   On every subsequent request, the client sends: Authorization: Bearer <token>
//   The server verifies the token instead of checking the database every time.
//   This makes authentication stateless — the server doesn't store sessions.

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Basic input check
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // 2. Find the user by email
    const user = await userService.findByEmail(email);
    if (!user) {
      // Don't say "email not found" — that tells attackers which emails exist.
      // Always use a generic message for auth failures.
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 3. Check if the user account is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Contact an administrator.',
      });
    }

    // 4. Compare the plain-text password with the hashed password in the DB.
    //    bcrypt.compare() hashes the input with the same salt and checks if they match.
    //    This is the ONLY safe way to compare passwords — never compare strings directly.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 5. Create a JWT token.
    //    The payload contains user info that we'll need on every request.
    //    NEVER put sensitive data (password, secrets) in the payload —
    //    JWT payloads are base64-encoded (readable), not encrypted.
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    // 6. Send the token to the client
    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    // Pass unexpected errors to the global error handler
    next(err);
  }
};

module.exports = { login };
