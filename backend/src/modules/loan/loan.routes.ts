const { Router } = require("express");
const { authorize } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const loanController = require("./loan.controller");
const { applyLoanSchema, approveLoanSchema, rejectLoanSchema, repayLoanSchema, loanIdParamSchema } = require("./loan.validation");

const router = Router();

router.post("/apply", authorize("CUSTOMER"), validate(applyLoanSchema), loanController.apply);
router.patch("/:id/approve", authorize("LOAN_OFFICER", "MANAGER", "ADMIN"), validate(approveLoanSchema), validate(loanIdParamSchema, "params"), loanController.approve);
router.patch("/:id/reject", authorize("LOAN_OFFICER", "MANAGER", "ADMIN"), validate(rejectLoanSchema), validate(loanIdParamSchema, "params"), loanController.reject);
router.post("/:id/repay", authorize("CUSTOMER"), validate(repayLoanSchema), validate(loanIdParamSchema, "params"), loanController.repay);
router.get("/customer/:customerId", authorize("CUSTOMER", "LOAN_OFFICER", "MANAGER", "ADMIN", "AUDITOR"), loanController.getHistory);

module.exports = router;
