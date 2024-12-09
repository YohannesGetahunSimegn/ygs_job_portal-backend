const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  deactivateUser,
  activateUser,
} = require("../controllers/userManageController");

const router = express.Router();

// GET route to list all users (for admin)
router.get("/users", requireAuth, requireAdmin, getAllUsers);

// PUT route to deactivate a user (for admin)
router.put("/users/deactivate/:id", requireAuth, requireAdmin, deactivateUser);

// PUT route to activate a user (for admin)
router.put("/users/activate/:id", requireAuth, requireAdmin, activateUser);

module.exports = router;
