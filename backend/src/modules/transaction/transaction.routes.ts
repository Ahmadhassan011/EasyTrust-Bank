const { Router } = require("express");
const { authorize } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const transactionController = require("./transaction.controller");
const { transferSchema, depositSchema, withdrawSchema } = require("./transaction.validation");

const router = Router();

router.post("/transfer", authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN"), validate(transferSchema), transactionController.transfer);
router.post("/deposit", authorize("TELLER", "MANAGER", "ADMIN"), validate(depositSchema), transactionController.deposit);
router.post("/withdraw", authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN"), validate(withdrawSchema), transactionController.withdraw);
router.get("/history/:accountId", authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN", "AUDITOR"), transactionController.history);

module.exports = router;
