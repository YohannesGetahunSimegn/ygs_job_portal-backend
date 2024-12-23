const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

const { getCompany } = require("../controllers/companyManagementController");

const router = express.Router();

// route to get all company
router.get("/companies", requireAuth, requireAdmin, getCompany);

module.exports = router;
