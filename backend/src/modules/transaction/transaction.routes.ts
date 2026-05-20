const { Router } = require("express");
const { authorize } = require("../../middleware/auth");
const transactionController = require("./transaction.controller");

const router = Router();

router.post("/transfer", authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN"), transactionController.transfer);
router.post("/deposit", authorize("TELLER", "MANAGER", "ADMIN"), transactionController.deposit);
router.post("/withdraw", authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN"), transactionController.withdraw);
router.get("/history/:accountId", authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN"), transactionController.history);

module.exports = router;
