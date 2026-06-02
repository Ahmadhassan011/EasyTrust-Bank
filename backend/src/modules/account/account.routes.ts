const { Router } = require("express");
const accountController = require("./account.controller");
const accountValidation = require("./account.validation");
const transactionController = require("../transaction/transaction.controller");
const transactionValidation = require("../transaction/transaction.validation");
const { validate } = require("../../middleware/validation.middleware");
const { authRequired, roleRequired } = require("../../middleware/auth.middleware");

const router = Router();

router.post("/", authRequired, validate(accountValidation.createAccountSchema), accountController.create);
router.get("/:id/balance", authRequired, accountController.getBalance);
router.post("/cards", authRequired, roleRequired(["employee"]), validate(accountValidation.issueCardSchema), accountController.issueCard);

router.post("/:id/deposit", authRequired, validate(transactionValidation.depositWithdrawSchema), transactionController.deposit);
router.post("/:id/withdraw", authRequired, validate(transactionValidation.depositWithdrawSchema), transactionController.withdraw);
router.post("/:id/transfer", authRequired, validate(transactionValidation.transferSchema), transactionController.transfer);

module.exports = router;
