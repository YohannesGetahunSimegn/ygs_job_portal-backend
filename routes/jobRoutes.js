const express = require("express");
const { applyForJob } = require("../controllers/jobController");
const router = express.Router();

// Route to apply for a job
router.post("/apply/:jobId", applyForJob);

module.exports = router;
