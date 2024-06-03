const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
dotenv.config();

/**Token Generation */

// Used to generate token------------------------------------
const generateToken = (data) => {
  let jwtSecretKey = process.env.JWT_SECRET_KEY || "47592d6aae42d41f4c7a1812c6b0a6af88ce3eee7f39a6d46336dd393a118bed";
  return jwt.sign(data, jwtSecretKey, { expiresIn: process.env.JWT_EXPIRES_TIME || '720h' });
};

// Used to generate token for forgot password-----------------------
const generateTokenForgotPassword = (id) => {
  const data = {
    id: id,
    data: crypto.randomBytes(10).toString('hex'),
  }
  let jwtSecretKey = process.env.JWT_SECRET_KEY || "47592d6aae42d41f4c7a1812c6b0a6af88ce3eee7f39a6d46336dd393a118bed";
  return jwt.sign(data, jwtSecretKey, { expiresIn: '15m' });
};

// Used to verify the jwt token-------------------------------------
const verifyToken = (token, envToken) => {
  return jwt.verify(token, envToken);
}

const authService = {
  generateToken,
  generateTokenForgotPassword,
  verifyToken
};

module.exports = authService;
