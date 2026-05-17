const { Router } = require("express");
const transactionController = require("./transaction.controller");

const router = Router();

router.post("/transfer", transactionController.transfer);
router.get("/history/:accountId", transactionController.history);

module.exports = router;
