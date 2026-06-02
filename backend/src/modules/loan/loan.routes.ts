const { Router } = require("express");
const loanController = require("./loan.controller");
const loanValidation = require("./loan.validation");
const { validate } = require("../../middleware/validation.middleware");
const { authRequired, roleRequired } = require("../../middleware/auth.middleware");

const router = Router();

router.get("/", authRequired, loanController.getAll);
router.post("/apply", authRequired, validate(loanValidation.applyLoanSchema), loanController.apply);
router.put("/:id/approve", authRequired, roleRequired(["employee"]), validate(loanValidation.approveLoanSchema), loanController.approve);
router.post("/:id/repay", authRequired, validate(loanValidation.repayLoanSchema), loanController.repay);

module.exports = router;
