const express = require("express");
const {
  updateApplicationStatus,
} = require("../controllers/hiringCompanyController");

const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Route for updating the application status
router.patch(
  "/jobposts/:jobPostId/applications/:applicationId/status",
  requireAuth,
  updateApplicationStatus
);

module.exports = router;
