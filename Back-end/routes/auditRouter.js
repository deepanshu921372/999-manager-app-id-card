const express = require('express');
const auditController = require("../controllers/auditController");

const router = express.Router();

// Define routes
router.post("/post-verifyEmployee", auditController.postVerifyEmployee);

module.exports = router;
