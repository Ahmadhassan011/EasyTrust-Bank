const { Router } = require("express");
const { authorize } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const customerController = require("./customer.controller");
const { createCustomerSchema, updateCustomerSchema } = require("./customer.validation");

const router = Router();

router.post("/", authorize("TELLER", "MANAGER", "ADMIN"), validate(createCustomerSchema), customerController.create);
router.get("/", authorize("ADMIN", "MANAGER"), customerController.getAll);
router.get("/:id", authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN", "LOAN_OFFICER"), customerController.getById);
router.get("/:id/accounts", authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN"), customerController.getAccounts);
router.get("/:id/loans", authorize("CUSTOMER", "LOAN_OFFICER", "MANAGER", "ADMIN"), customerController.getLoans);
router.put("/:id", authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN"), validate(updateCustomerSchema), customerController.update);
router.delete("/:id", authorize("ADMIN"), customerController.remove);

module.exports = router;
