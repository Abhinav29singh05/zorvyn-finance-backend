const userService = require('../services/userService');

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const user = await userService.createUser({ name, email, password, role });

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await userService.findAll({ page, limit });

    res.json({
      success: true,
      data: result.users,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
};

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

const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, status } = req.body;

    const existingUser = await userService.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

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
