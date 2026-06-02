const { Router } = require("express");
const auditController = require("./audit.controller");
const { authRequired, roleRequired } = require("../../middleware/auth.middleware");

const router = Router();

router.get("/", authRequired, roleRequired(["employee"]), auditController.getLogs);

module.exports = router;
