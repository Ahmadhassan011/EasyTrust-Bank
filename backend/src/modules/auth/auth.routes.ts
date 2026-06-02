const { Router } = require("express");
const { authenticate, authorize } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const authController = require("./auth.controller");
const { registerSchema, loginSchema, mfaLoginSchema, mfaSetupSchema, mfaEnableSchema, mfaDisableSchema, refreshSchema } = require("./auth.validation");

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/mfa/login", validate(mfaLoginSchema), authController.loginWithMfa);
router.post("/mfa/setup", authenticate, authorize("TELLER", "LOAN_OFFICER", "MANAGER", "ADMIN", "AUDITOR"), authController.setupMfa);
router.post("/mfa/enable", authenticate, authorize("TELLER", "LOAN_OFFICER", "MANAGER", "ADMIN", "AUDITOR"), validate(mfaEnableSchema), authController.enableMfa);
router.post("/mfa/disable", authenticate, authorize("TELLER", "LOAN_OFFICER", "MANAGER", "ADMIN", "AUDITOR"), validate(mfaDisableSchema), authController.disableMfa);
router.post("/refresh", validate(refreshSchema), authController.refresh);

module.exports = router;
