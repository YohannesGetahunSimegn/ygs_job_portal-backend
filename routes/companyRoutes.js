const express = require("express");
const {
  updateApplicationStatus,
  signUp,
  login,
} = require("../controllers/companyController");
const { createJobPost } = require("../controllers/jobPostController");

const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/job", verifyToken, createJobPost);

router.post("/signup", signUp);
router.post("/login", login);

// Route for updating the application status
router.patch(
  "/jobposts/:jobPostId/applications/:applicationId/status",
  verifyToken,
  updateApplicationStatus
);

module.exports = router;
