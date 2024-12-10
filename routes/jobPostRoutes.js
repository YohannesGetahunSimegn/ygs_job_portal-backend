const express = require("express");
const jobPostController = require("../controllers/jobPostController");
const { createJobPost } = require("../controllers/jobPostController");
const {
  requireAuth,
  requireAdmin,
  verifyToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public route: Create a job post (guest or admin)
router.post("/post-job", verifyToken, createJobPost);

// Admin route: Get all job posts (both approved and unapproved for admins)
router.get(
  "/all-jobs",
  requireAuth,
  requireAdmin,
  jobPostController.getAllJobPosts
);

// Admin-only: Approve job post
router.put(
  "/approve-job/:id",
  requireAuth,
  requireAdmin,
  jobPostController.approveJobPost
);

// Admin-only: Update job post
router.put(
  "/update-job/:id",
  requireAuth,
  requireAdmin,
  jobPostController.updateJobPost
);

// Admin-only: Delete job post
router.delete(
  "/delete-job/:id",
  requireAuth,
  requireAdmin,
  jobPostController.deleteJobPost
);

module.exports = router;
