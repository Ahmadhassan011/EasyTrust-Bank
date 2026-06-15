import type { Request, Response } from "express";
const employeeService = require("./employee.service");

const getAll = async (req: Request, res: Response) => {
  try {
    const employees = await employeeService.getAllEmployees();
    res.json({ success: true, data: employees });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "FETCH_FAILED", message: error.message } });
  }
};

const getById = async (req: Request, res: Response) => {
  try {
    const employee = await employeeService.getEmployeeById(Number(req.params.id));
    res.json({ success: true, data: employee });
  } catch (error: any) {
    const status = error.message === "Employee not found" ? 404 : 500;
    res.status(status).json({ success: false, error: { code: "FETCH_FAILED", message: error.message } });
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const employee = await employeeService.createEmployee(
      req.body,
      req.user!.userId,
      req.ip
    );
    res.status(201).json({ success: true, data: employee });
  } catch (error: any) {
    const status = error.message.includes("already exists") ? 409 : 400;
    res.status(status).json({ success: false, error: { code: "CREATE_FAILED", message: error.message } });
  }
};

const update = async (req: Request, res: Response) => {
  try {
    const employee = await employeeService.updateEmployee(
      Number(req.params.id),
      req.body,
      req.user!.userId,
      req.ip
    );
    res.json({ success: true, data: employee });
  } catch (error: any) {
    const status = error.message === "Employee not found" ? 404 : error.message.includes("already exists") ? 409 : 400;
    res.status(status).json({ success: false, error: { code: "UPDATE_FAILED", message: error.message } });
  }
};

const remove = async (req: Request, res: Response) => {
  try {
    const result = await employeeService.deleteEmployee(
      Number(req.params.id),
      req.user!.userId,
      req.ip
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message === "Employee not found" ? 404 : 400;
    res.status(status).json({ success: false, error: { code: "DELETE_FAILED", message: error.message } });
  }
};

module.exports = { getAll, getById, create, update, remove };
