const { Router } = require("express");
const { authorize } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const loanController = require("./loan.controller");
const { applyLoanSchema, approveLoanSchema, rejectLoanSchema, repayLoanSchema } = require("./loan.validation");

const router = Router();

router.post("/apply", authorize("CUSTOMER"), validate(applyLoanSchema), loanController.apply);
router.patch("/:id/approve", authorize("LOAN_OFFICER", "MANAGER", "ADMIN"), validate(approveLoanSchema), loanController.approve);
router.patch("/:id/reject", authorize("LOAN_OFFICER", "MANAGER", "ADMIN"), validate(rejectLoanSchema), loanController.reject);
router.post("/:id/repay", authorize("CUSTOMER"), validate(repayLoanSchema), loanController.repay);
router.get("/customer/:customerId", authorize("CUSTOMER", "LOAN_OFFICER", "MANAGER", "ADMIN"), loanController.getHistory);

module.exports = router;
