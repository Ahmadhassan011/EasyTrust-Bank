import type { Request, Response } from "express";
const prisma = require("../../config/prisma");
const authService = require("./auth.service");

const register = async (req: Request, res: Response) => {
  try {
    const { role, email, password, first_name, last_name } = req.body;

    // Check if email already exists in the decoupled Credential table
    const existingCred = await prisma.credential.findUnique({ where: { email } });
    if (existingCred) {
      return res.status(400).json({
        success: false,
        error: { code: "EMAIL_TAKEN", message: "Email is already registered" }
      });
    }

    const hashedPassword = await authService.hashPassword(password);
    const mfaSecret = authService.generateTOTPSecret();

    let createdProfile;

    if (role === "customer") {
      const { cnic, phone, address, dob } = req.body;
      
      // Check cnic unique in customer profiles
      const existingCnic = await prisma.customer.findUnique({ where: { cnic } });
      if (existingCnic) {
        return res.status(400).json({
          success: false,
          error: { code: "CNIC_TAKEN", message: "CNIC is already registered" }
        });
      }

      // Create Customer profile without auth columns
      createdProfile = await prisma.customer.create({
        data: {
          first_name,
          last_name,
          cnic,
          email,
          phone,
          address,
          dob: dob ? new Date(dob) : null
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

      // Create Employee profile without auth columns
      createdProfile = await prisma.employee.create({
        data: {
          branch_id,
          first_name,
          last_name,
          role: employee_role,
          email,
          hire_date: new Date(hire_date)
        }
      });
    }

    // Create secure decoupled Credential record
    await prisma.credential.create({
      data: {
        email,
        password_hash: hashedPassword,
        mfa_secret: mfaSecret,
        mfa_enabled: false,
        role
      }
    });

    const userId = role === "customer" ? createdProfile.customer_id : createdProfile.employee_id;

    res.status(201).json({
      success: true,
      data: {
        id: userId,
        email,
        role,
        first_name: createdProfile.first_name,
        last_name: createdProfile.last_name,
        mfa_secret: mfaSecret,
        mfa_setup_url: `otpauth://totp/EasyTrustBank:${email}?secret=${mfaSecret}&issuer=EasyTrustBank`
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

    // Check credentials first
    const cred = await prisma.credential.findUnique({ where: { email } });
    if (!cred) {
      return res.status(401).json({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" }
      });
    }

    const passwordMatch = await authService.comparePassword(password, cred.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" }
      });
    }

    // Retrieve corresponding user profile details
    let userProfile;
    if (cred.role === "customer") {
      userProfile = await prisma.customer.findUnique({ where: { email } });
    } else {
      userProfile = await prisma.employee.findUnique({ where: { email } });
    }

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: { code: "PROFILE_NOT_FOUND", message: "User profile could not be resolved" }
      });
    }

    const userId = cred.role === "customer" ? userProfile.customer_id : userProfile.employee_id;

    if (cred.mfa_enabled) {
      return res.json({
        success: true,
        data: {
          mfa_required: true,
          email,
          message: "Please enter your 6-digit authenticator code"
        }
      });
    }

    // Default response: Return final token
    const token = authService.generateToken({
      id: userId,
      email,
      role: cred.role
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: userId,
          email,
          role: cred.role,
          first_name: userProfile.first_name,
          last_name: userProfile.last_name
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

    const cred = await prisma.credential.findUnique({ where: { email } });
    if (!cred) {
      return res.status(404).json({
        success: false,
        error: { code: "USER_NOT_FOUND", message: "User credentials not found" }
      });
    }

    const isValid = authService.verifyTOTPToken(code, cred.mfa_secret);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_CODE", message: "Invalid verification code" }
      });
    }

    // Enable MFA if it wasn't enabled before
    if (!cred.mfa_enabled) {
      await prisma.credential.update({
        where: { email },
        data: { mfa_enabled: true }
      });
    }

    // Retrieve corresponding user profile details
    let userProfile;
    if (cred.role === "customer") {
      userProfile = await prisma.customer.findUnique({ where: { email } });
    } else {
      userProfile = await prisma.employee.findUnique({ where: { email } });
    }

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: { code: "PROFILE_NOT_FOUND", message: "User profile could not be resolved" }
      });
    }

    const userId = cred.role === "customer" ? userProfile.customer_id : userProfile.employee_id;
    const token = authService.generateToken({
      id: userId,
      email,
      role: cred.role
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: userId,
          email,
          role: cred.role,
          first_name: userProfile.first_name,
          last_name: userProfile.last_name
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
