import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
export const ACCESS_EXPIRES_SECONDS = 15 * 60; // 15 minutes
export const REFRESH_EXPIRES_DAYS = 30;

export function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: `${ACCESS_EXPIRES_SECONDS}s`,
  });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (e) {
    return null;
  }
}
