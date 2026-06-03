const { Router } = require("express");
const { authorize } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const auditController = require("./audit.controller");
const { auditQuerySchema } = require("./audit.validation");

const router = Router();

router.get("/", authorize("AUDITOR", "ADMIN"), validate(auditQuerySchema, "query"), auditController.getLogs);

module.exports = router;
