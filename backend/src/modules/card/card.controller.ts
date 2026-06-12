import type { Request, Response } from "express";
const cardService = require("./card.service");
const accountService = require("../account/account.service");
const auditService = require("../audit/audit.service");

const requireOwnAccount = async (req: Request, accountId: number) => {
  if (req.user?.type !== "customer") return;
  const account = await accountService.getAccountById(accountId);
  if (!account || account.customer_id !== req.user.userId) {
    const err = new Error("Access denied");
    (err as any).statusCode = 403;
    throw err;
  }
};

const requireOwnCard = async (req: Request, cardId: number) => {
  if (req.user?.type !== "customer") return;
  const card = await cardService.getCardById(cardId);
  if (!card || card.account.customer_id !== req.user.userId) {
    const err = new Error("Access denied");
    (err as any).statusCode = 403;
    throw err;
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const card = await cardService.createCard(req.body);
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "card",
      entityId: card.card_id,
      action: "CREATE",
      newValue: { ...card, cvv: "[REDACTED]" },
      ipAddress: req.ip,
    });
    res.status(201).json({ success: true, data: card });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "CREATE_FAILED", message: error.message } });
  }
};

const getById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await requireOwnCard(req, id);
    const card = await cardService.getCardById(id);
    if (!card) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Card not found" } });
    }
    res.json({ success: true, data: card });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      error: { code: status === 403 ? "FORBIDDEN" : "FETCH_FAILED", message: error.message }
    });
  }
};

const getByAccount = async (req: Request, res: Response) => {
  try {
    const accountId = Number(req.params.accountId);
    await requireOwnAccount(req, accountId);
    const cards = await cardService.getCardsByAccountId(accountId);
    res.json({ success: true, data: cards });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      error: { code: status === 403 ? "FORBIDDEN" : "FETCH_FAILED", message: error.message }
    });
  }
};

const updateStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await requireOwnCard(req, id);
    const oldCard = await cardService.getCardById(id);
    const card = await cardService.updateCardStatus(id, req.body.status);
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "card",
      entityId: card.card_id,
      action: "UPDATE_STATUS",
      oldValue: oldCard ? { status: oldCard.status } : null,
      newValue: { status: card.status },
      ipAddress: req.ip,
    });
    res.json({ success: true, data: card });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      error: { code: status === 403 ? "FORBIDDEN" : "UPDATE_FAILED", message: error.message }
    });
  }
};

const updateLimit = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await requireOwnCard(req, id);
    const oldCard = await cardService.getCardById(id);
    const card = await cardService.updateCardLimit(id, Number(req.body.daily_limit));
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "card",
      entityId: card.card_id,
      action: "UPDATE_LIMIT",
      oldValue: oldCard ? { daily_limit: oldCard.daily_limit } : null,
      newValue: { daily_limit: card.daily_limit },
      ipAddress: req.ip,
    });
    res.json({ success: true, data: card });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      error: { code: status === 403 ? "FORBIDDEN" : "UPDATE_FAILED", message: error.message }
    });
  }
};

const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const oldCard = await cardService.getCardById(id);
    await cardService.deleteCard(id);
    await auditService.log({
      employeeId: req.user?.type === "employee" ? req.user.userId : null,
      entityType: "card",
      entityId: id,
      action: "DELETE",
      oldValue: oldCard,
      newValue: null,
      ipAddress: req.ip,
    });
    res.json({ success: true, data: { message: "Card deleted successfully" } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "DELETE_FAILED", message: error.message } });
  }
};

module.exports = {
  create,
  getById,
  getByAccount,
  updateStatus,
  updateLimit,
  remove,
};
