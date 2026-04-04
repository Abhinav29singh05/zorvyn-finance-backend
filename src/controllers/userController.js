const userService = require('../services/userService');

// Controllers are THIN — they only:
//   1. Read data from the request (req.params, req.body, req.query)
//   2. Call the service layer to do the actual work
//   3. Send the response
// All business logic and DB queries live in the service layer.

// POST /api/users — Create a new user (Admin only)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email is already taken
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const user = await userService.createUser({ name, email, password, role });

    // 201 = "Created" — the correct status code when a new resource is created.
    // Don't use 200 for creation — it technically means "OK" (generic success).
    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users — List all users (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.findAll();

    res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id — Get a single user (Admin only)
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id — Update a user (Admin only)
// PATCH (not PUT) because we're doing partial updates — only changing
// the fields the client sends, not replacing the entire resource.
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, status } = req.body;

    // Check if user exists first
    const existingUser = await userService.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // If email is being changed, check it's not taken by another user
    if (email && email !== existingUser.email) {
      const emailTaken = await userService.findByEmail(email);
      if (emailTaken) {
        return res.status(409).json({
          success: false,
          message: 'A user with this email already exists.',
        });
      }
    }

    const user = await userService.updateUser(req.params.id, { name, email, role, status });

    res.json({
      success: true,
      message: 'User updated successfully.',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id — Delete a user (Admin only)
const deleteUser = async (req, res, next) => {
  try {
    const user = await userService.deleteUser(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
