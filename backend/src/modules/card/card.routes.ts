const { Router } = require("express");
const { authorize } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const cardController = require("./card.controller");
const {
  createCardSchema,
  updateCardStatusSchema,
  updateCardLimitSchema,
  cardIdParamSchema,
  accountIdParamSchema,
} = require("./card.validation");

const router = Router();

router.post(
  "/",
  authorize("TELLER", "MANAGER", "ADMIN"),
  validate(createCardSchema),
  cardController.create
);

router.get(
  "/:id",
  authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN", "AUDITOR"),
  validate(cardIdParamSchema, "params"),
  cardController.getById
);

router.get(
  "/account/:accountId",
  authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN", "AUDITOR"),
  validate(accountIdParamSchema, "params"),
  cardController.getByAccount
);

router.patch(
  "/:id/status",
  authorize("CUSTOMER", "TELLER", "MANAGER", "ADMIN"),
  validate(cardIdParamSchema, "params"),
  validate(updateCardStatusSchema),
  cardController.updateStatus
);

router.patch(
  "/:id/limit",
  authorize("CUSTOMER", "MANAGER", "ADMIN"),
  validate(cardIdParamSchema, "params"),
  validate(updateCardLimitSchema),
  cardController.updateLimit
);

router.delete(
  "/:id",
  authorize("ADMIN", "MANAGER"),
  validate(cardIdParamSchema, "params"),
  cardController.remove
);

module.exports = router;
