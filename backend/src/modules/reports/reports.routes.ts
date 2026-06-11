const { Router } = require("express");
const { authorize } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const reportsController = require("./reports.controller");
const { monthlyTransactionsQuerySchema } = require("./reports.validation");

const router = Router();

router.get("/monthly-transactions", authorize("MANAGER", "ADMIN"), validate(monthlyTransactionsQuerySchema, "query"), reportsController.monthlyTransactions);

module.exports = router;
