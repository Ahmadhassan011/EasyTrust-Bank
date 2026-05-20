const { Router } = require("express");
const { validate } = require("../../middleware/validate");
const authController = require("./auth.controller");
const { loginSchema, registerSchema, refreshSchema } = require("./auth.validation");

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);

module.exports = router;
