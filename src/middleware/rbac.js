// RBAC = Role-Based Access Control
// This middleware checks if the logged-in user's role is allowed to access a route.
//
// Usage in routes:
//   router.post('/', authorize('admin'), controller.create);
//   router.get('/', authorize('analyst', 'admin'), controller.getAll);
//
// How it works:
//   authorize() is a FACTORY FUNCTION — it returns a middleware function.
//   We need this pattern because middleware has a fixed signature (req, res, next),
//   but we also need to pass in the allowed roles. The factory solves this:
//
//   authorize('admin')  →  returns a function(req, res, next) that checks for admin role
//   authorize('analyst', 'admin')  →  returns a function that checks for either role

const authorize = (...allowedRoles) => {
  // This inner function is the actual middleware that Express runs.
  // It has access to allowedRoles via closure.
  return (req, res, next) => {
    // req.user is set by the auth middleware (Phase 2).
    // If we reach here, the user is already authenticated.
    // Now we check: is their role in the allowed list?

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    // Role is allowed — proceed to the next middleware/controller.
    next();
  };
};

module.exports = authorize;
