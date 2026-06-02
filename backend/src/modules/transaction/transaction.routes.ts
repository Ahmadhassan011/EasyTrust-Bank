const { Router } = require("express");
const transactionController = require("./transaction.controller");
const { authRequired } = require("../../middleware/auth.middleware");

const router = Router();

router.get("/history", authRequired, transactionController.getHistory);

module.exports = router;
