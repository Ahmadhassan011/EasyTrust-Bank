import type { Request, Response } from "express";
const prisma = require("../../config/prisma");
const authService = require("./auth.service");

const register = async (req: Request, res: Response) => {
  try {
    const { role, email, password, first_name, last_name } = req.body;

    // Check if email already exists in either table
    const existingCustomer = await prisma.customer.findUnique({ where: { email } });
    const existingEmployee = await prisma.employee.findUnique({ where: { email } });

    if (existingCustomer || existingEmployee) {
      return res.status(400).json({
        success: false,
        error: { code: "EMAIL_TAKEN", message: "Email is already registered" }
      });
    }

    const hashedPassword = await authService.hashPassword(password);
    const mfaSecret = authService.generateTOTPSecret();

    let createdUser;

    if (role === "customer") {
      const { cnic, phone, address, dob } = req.body;
      
      // Check cnic unique
      const existingCnic = await prisma.customer.findUnique({ where: { cnic } });
      if (existingCnic) {
        return res.status(400).json({
          success: false,
          error: { code: "CNIC_TAKEN", message: "CNIC is already registered" }
        });
      }

      createdUser = await prisma.customer.create({
        data: {
          first_name,
          last_name,
          cnic,
          email,
          phone,
          address,
          dob: dob ? new Date(dob) : null,
          password_hash: hashedPassword,
          mfa_secret: mfaSecret,
          mfa_enabled: false // Setup complete, but needs verification to enable
        }
      });
    } else {
      const { branch_id, employee_role, hire_date } = req.body;

      // Verify branch exists
      const branch = await prisma.branch.findUnique({ where: { branch_id } });
      if (!branch) {
        return res.status(400).json({
          success: false,
          error: { code: "INVALID_BRANCH", message: "Specified branch does not exist" }
        });
      }

      createdUser = await prisma.employee.create({
        data: {
          branch_id,
          first_name,
          last_name,
          role: employee_role,
          email,
          hire_date: new Date(hire_date),
          password_hash: hashedPassword,
          mfa_secret: mfaSecret,
          mfa_enabled: false
        }
      });
    }

    res.status(201).json({
      success: true,
      data: {
        id: role === "customer" ? createdUser.customer_id : createdUser.employee_id,
        email: createdUser.email,
        role,
        first_name: createdUser.first_name,
        last_name: createdUser.last_name,
        mfa_secret: mfaSecret,
        mfa_setup_url: `otpauth://totp/EasyTrustBank:${createdUser.email}?secret=${mfaSecret}&issuer=EasyTrustBank`
      }
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, error: { code: "REGISTRATION_FAILED", message: error.message } });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Search customer first
    let user = await prisma.customer.findUnique({ where: { email } });
    let role: "customer" | "employee" = "customer";

    if (!user) {
      user = await prisma.employee.findUnique({ where: { email } });
      role = "employee";
    }

    if (!user || !user.password_hash) {
      return res.status(401).json({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" }
      });
    }

    const passwordMatch = await authService.comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" }
      });
    }

    const userId = role === "customer" ? user.customer_id : user.employee_id;

    if (user.mfa_enabled) {
      return res.json({
        success: true,
        data: {
          mfa_required: true,
          email: user.email,
          message: "Please enter your 6-digit authenticator code"
        }
      });
    }

    // Default response: Return final token since MFA isn't verified/enabled yet
    const token = authService.generateToken({
      id: userId,
      email: user.email,
      role
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: userId,
          email: user.email,
          role,
          first_name: user.first_name,
          last_name: user.last_name
        }
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: { code: "LOGIN_FAILED", message: error.message } });
  }
};

const verifyMfa = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    let user = await prisma.customer.findUnique({ where: { email } });
    let role: "customer" | "employee" = "customer";

    if (!user) {
      user = await prisma.employee.findUnique({ where: { email } });
      role = "employee";
    }

    if (!user || !user.mfa_secret) {
      return res.status(404).json({
        success: false,
        error: { code: "USER_NOT_FOUND", message: "User not found or MFA not configured" }
      });
    }

    const isValid = authService.verifyTOTPToken(code, user.mfa_secret);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_CODE", message: "Invalid verification code" }
      });
    }

    // Enable MFA if it was not enabled before
    if (!user.mfa_enabled) {
      if (role === "customer") {
        await prisma.customer.update({
          where: { email },
          data: { mfa_enabled: true }
        });
      } else {
        await prisma.employee.update({
          where: { email },
          data: { mfa_enabled: true }
        });
      }
    }

    const userId = role === "customer" ? user.customer_id : user.employee_id;
    const token = authService.generateToken({
      id: userId,
      email: user.email,
      role
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: userId,
          email: user.email,
          role,
          first_name: user.first_name,
          last_name: user.last_name
        }
      }
    });
  } catch (error: any) {
    console.error("MFA verification error:", error);
    res.status(500).json({ success: false, error: { code: "MFA_VERIFICATION_FAILED", message: error.message } });
  }
};

module.exports = {
  register,
  login,
  verifyMfa
};
