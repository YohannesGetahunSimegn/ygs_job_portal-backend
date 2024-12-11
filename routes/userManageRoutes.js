const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  getOneUser,
  deactivateUser,
  activateUser,
  getAppliedJobs,
} = require("../controllers/userManageController");

const router = express.Router();

// GET route to list all users (for admin)
router.get("/users", requireAuth, requireAdmin, getAllUsers);
router.get("/users/:id", requireAuth, requireAdmin, getOneUser);

// PUT route to deactivate a user (for admin)
router.put("/users/deactivate/:id", requireAuth, requireAdmin, deactivateUser);

// PUT route to activate a user (for admin)
router.put("/users/activate/:id", requireAuth, requireAdmin, activateUser);

// GET all applied jobs by a single user
router.get("/applied-jobs/:userId", requireAuth, requireAdmin, getAppliedJobs);

module.exports = router;
