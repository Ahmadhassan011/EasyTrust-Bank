const { Router } = require("express");
const { authorize } = require("../../middleware/auth");
const loanController = require("./loan.controller");

const router = Router();

router.post("/apply", authorize("CUSTOMER"), loanController.apply);
router.patch("/:id/approve", authorize("LOAN_OFFICER", "MANAGER", "ADMIN"), loanController.approve);
router.patch("/:id/reject", authorize("LOAN_OFFICER", "MANAGER", "ADMIN"), loanController.reject);
router.post("/:id/repay", authorize("CUSTOMER"), loanController.repay);
router.get("/customer/:customerId", authorize("CUSTOMER", "LOAN_OFFICER", "MANAGER", "ADMIN"), loanController.getHistory);

module.exports = router;
