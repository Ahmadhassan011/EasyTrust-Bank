const { Router } = require("express");
const transactionController = require("./transaction.controller");

const router = Router();

router.post("/transfer", transactionController.transfer);
router.post("/deposit", transactionController.deposit);
router.post("/withdraw", transactionController.withdraw);
router.get("/history/:accountId", transactionController.history);

module.exports = router;
