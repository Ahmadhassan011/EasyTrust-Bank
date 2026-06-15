const { Router } = require("express");
const { authorize } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const employeeController = require("./employee.controller");
const {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeIdParamSchema,
} = require("./employee.validation");

const router = Router();

// All employee routes are ADMIN-only
router.get("/", authorize("ADMIN"), employeeController.getAll);
router.get(
  "/:id",
  authorize("ADMIN"),
  validate(employeeIdParamSchema, "params"),
  employeeController.getById
);
router.post(
  "/",
  authorize("ADMIN"),
  validate(createEmployeeSchema),
  employeeController.create
);
router.put(
  "/:id",
  authorize("ADMIN"),
  validate(employeeIdParamSchema, "params"),
  validate(updateEmployeeSchema),
  employeeController.update
);
router.delete(
  "/:id",
  authorize("ADMIN"),
  validate(employeeIdParamSchema, "params"),
  employeeController.remove
);

module.exports = router;
