const { Router } = require("express");
const interbankController = require("./interbank.controller");
const interbankValidation = require("./interbank.validation");
const { validate } = require("../../middleware/validation.middleware");
const { authRequired } = require("../../middleware/auth.middleware");

const router = Router();

router.post("/transfer", authRequired, validate(interbankValidation.interbankTransferSchema), interbankController.transfer);

module.exports = router;
