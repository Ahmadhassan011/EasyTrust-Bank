const { Router } = require("express");
const { authorize } = require("../../middleware/auth");
const accountController = require("./account.controller");

const router = Router();

router.post("/", authorize("TELLER", "MANAGER", "ADMIN"), accountController.create);
router.get("/", authorize("ADMIN", "MANAGER"), accountController.getAll);
router.get("/:id", authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN"), accountController.getById);
router.get("/customer/:customerId", authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN"), accountController.getByCustomer);
router.get("/:id/balance", authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN"), accountController.getBalance);
router.patch("/:id/status", authorize("MANAGER", "ADMIN"), accountController.updateStatus);

module.exports = router;
