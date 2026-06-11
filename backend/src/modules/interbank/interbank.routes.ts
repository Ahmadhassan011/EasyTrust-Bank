const { Router } = require("express");
const { authorize } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const interbankController = require("./interbank.controller");
const { transferSchema, interbankIdParamSchema } = require("./interbank.validation");

const router = Router();

router.post(
  "/transfer",
  authorize("TELLER", "MANAGER", "ADMIN"),
  validate(transferSchema),
  interbankController.transfer
);

router.get(
  "/:id/settlement",
  authorize("TELLER", "MANAGER", "ADMIN"),
  validate(interbankIdParamSchema, "params"),
  interbankController.getSettlementStatus
);

module.exports = router;