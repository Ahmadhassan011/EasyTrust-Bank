const { Router } = require("express");
const { authorize } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const coordinatorController = require("./coordinator.controller");
const { twoPhaseCommitSchema } = require("./coordinator.validation");

const router = Router();

router.post(
  "/transfer",
  authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN"),
  validate(twoPhaseCommitSchema),
  coordinatorController.transfer2PC
);

module.exports = router;
