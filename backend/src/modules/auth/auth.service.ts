const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "easytrust-secret";

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

const generateToken = (payload: any, expiresIn: string = "24h"): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

// Cryptographically secure standard base32-like pseudo-random secret generation
const generateTOTPSecret = (): string => {
  return crypto.randomBytes(20).toString("hex"); // Store hex representation of secret
};

// RFC 6238 Compliant TOTP Code Generation & Verification
const generateTOTP = (secret: string, counterOffset: number = 0): string => {
  const timeStep = 30; // 30 seconds
  const counter = Math.floor(Date.now() / 1000 / timeStep) + counterOffset;
  
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(counter));
  
  // Use hex representation of the secret as key
  const hmac = crypto.createHmac("sha1", secret).update(buffer).digest();
  
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary = ((hmac[offset] & 0x7f) << 24) |
                 ((hmac[offset + 1] & 0xff) << 16) |
                 ((hmac[offset + 2] & 0xff) << 8) |
                 (hmac[offset + 3] & 0xff);
                 
  return (binary % 1000000).toString().padStart(6, "0");
};

const verifyTOTPToken = (token: string, secret: string): boolean => {
  // Allow a drift window of -1, 0, +1 time intervals (total 90 seconds window)
  for (let offset = -1; offset <= 1; offset++) {
    const computed = generateTOTP(secret, offset);
    if (computed === token) {
      return true;
    }
  }
  return false;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateTOTPSecret,
  generateTOTP,
  verifyTOTPToken
};
