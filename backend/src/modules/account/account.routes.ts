const { Router } = require("express");
const accountController = require("./account.controller");

const router = Router();

router.post("/", accountController.create);
router.get("/", accountController.getAll);
router.get("/:id", accountController.getById);
router.get("/customer/:customerId", accountController.getByCustomer);
router.patch("/:id/status", accountController.updateStatus);

module.exports = router;
