const express = require("express");
const { submitJobPost } = require("../controllers/companyController");

const router = express.Router();

router.post("/submit", submitJobPost);

module.exports = router;
