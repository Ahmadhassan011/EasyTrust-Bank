const { Router } = require("express");
const loanController = require("./loan.controller");

const router = Router();

router.post("/apply", loanController.apply);
router.patch("/:id/approve", loanController.approve);
router.get("/customer/:customerId", loanController.getHistory);

module.exports = router;
