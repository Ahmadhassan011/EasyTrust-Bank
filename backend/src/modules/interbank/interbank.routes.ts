const { Router } = require("express");
const { authorize } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const interbankController = require("./interbank.controller");
const { transferSchema } = require("./interbank.validation");

const router = Router();

router.post(
  "/transfer",
  authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN"),
  validate(transferSchema),
  interbankController.transfer
);

module.exports = router;