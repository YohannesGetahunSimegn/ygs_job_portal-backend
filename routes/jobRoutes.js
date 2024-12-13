const express = require("express");
const { applyForJob } = require("../controllers/jobController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Route to apply for a job
router.post("/apply/:jobId", requireAuth, applyForJob);

module.exports = router;
