const express = require("express");
const { check } = require("express-validator");
const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  updatePassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  registerUser
);

// @route   POST /api/users/login
// @desc    Login user and get token
// @access  Public
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  loginUser
);

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get("/me", protect, getCurrentUser);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", protect, updateProfile);

// @route   PUT /api/users/password
// @desc    Update password
// @access  Private
router.put(
  "/password",
  [
    check("currentPassword", "Current password is required").not().isEmpty(),
    check("newPassword", "New password must be at least 6 characters").isLength(
      {
        min: 6,
      }
    ),
  ],
  protect,
  updatePassword
);

module.exports = router;
