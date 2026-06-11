const { Router } = require("express");
const { authorize } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const accountController = require("./account.controller");
const { createAccountSchema, updateAccountStatusSchema, accountIdParamSchema, customerIdParamSchema } = require("./account.validation");

const router = Router();

router.post("/", authorize("TELLER", "MANAGER", "ADMIN"), validate(createAccountSchema), accountController.create);
router.get("/", authorize("ADMIN", "MANAGER"), accountController.getAll);
router.get("/:id", authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN", "AUDITOR"), validate(accountIdParamSchema, "params"), accountController.getById);
router.get("/customer/:customerId", authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN", "AUDITOR"), validate(customerIdParamSchema, "params"), accountController.getByCustomer);
router.get("/:id/balance", authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN", "AUDITOR"), validate(accountIdParamSchema, "params"), accountController.getBalance);
router.patch("/:id/status", authorize("MANAGER", "ADMIN"), validate(updateAccountStatusSchema), accountController.updateStatus);

module.exports = router;
