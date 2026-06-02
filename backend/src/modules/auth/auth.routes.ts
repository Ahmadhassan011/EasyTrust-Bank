const { Router } = require("express");
const authController = require("./auth.controller");
const authValidation = require("./auth.validation");
const { validate } = require("../../middleware/validation.middleware");

const router = Router();

router.post("/register", validate(authValidation.registerSchema), authController.register);
router.post("/login", validate(authValidation.loginSchema), authController.login);
router.post("/mfa/verify", validate(authValidation.mfaVerifySchema), authController.verifyMfa);

module.exports = router;
