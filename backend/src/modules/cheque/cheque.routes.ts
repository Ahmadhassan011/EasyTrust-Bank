const { Router } = require("express");
const { authorize } = require("../../middleware/auth");
const chequeController = require("./cheque.controller");

const router = Router();

// Customer submits a cheque deposit
router.post("/", authorize("CUSTOMER"), chequeController.submit);

// Customer views their own cheque requests
router.get("/mine", authorize("CUSTOMER"), chequeController.getMine);

// Manager / Teller / Admin views all requests (filter by ?status=PENDING)
router.get("/", authorize("TELLER", "MANAGER", "ADMIN", "AUDITOR"), chequeController.getAll);

// Single request detail
router.get("/:id", authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN", "AUDITOR"), chequeController.getOne);

// Approve — money gets credited
router.patch("/:id/approve", authorize("TELLER", "MANAGER", "ADMIN"), chequeController.approve);

// Reject — no money moved
router.patch("/:id/reject", authorize("TELLER", "MANAGER", "ADMIN"), chequeController.reject);

module.exports = router;
