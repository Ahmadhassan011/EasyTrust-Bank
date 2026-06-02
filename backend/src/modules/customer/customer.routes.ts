const { Router } = require("express");
const customerController = require("./customer.controller");
const accountController = require("../account/account.controller");
const { authRequired } = require("../../middleware/auth.middleware");

const router = Router();

router.post("/", customerController.create);
router.get("/", customerController.getAll);
router.get("/:id/accounts", authRequired, accountController.getCustomerAccounts);
router.get("/:id", customerController.getById);
router.put("/:id", customerController.update);
router.delete("/:id", customerController.remove);

module.exports = router;