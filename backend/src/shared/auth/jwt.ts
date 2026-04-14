import jwt from "jsonwebtoken";
import { loadEnv } from "../config/env.js";

export type AccessPayload = {
  sub: number;
  email: string;
  typ: "access";
};

export type RefreshPayload = {
  sub: number;
  typ: "refresh";
  jti: string;
};

export function signAccessToken(userId: number, email: string): string {
  const env = loadEnv();
  const payload: AccessPayload = { sub: userId, email, typ: "access" };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL_SEC,
    issuer: "health-fitness-api",
  });
}

export function signRefreshToken(userId: number, jti: string): string {
  const env = loadEnv();
  const payload: RefreshPayload = { sub: userId, typ: "refresh", jti };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL_SEC,
    issuer: "health-fitness-api",
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseUserId(value: unknown): number {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === "string" && /^\d+$/.test(value)) {
    return Number(value);
  }
  throw new Error("Invalid token subject");
}

export function verifyAccessToken(token: string): AccessPayload {
  const env = loadEnv();
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: "health-fitness-api",
  });
  if (!isRecord(decoded)) {
    throw new Error("Invalid access token");
  }
  if (decoded.typ !== "access" || typeof decoded.email !== "string") {
    throw new Error("Invalid access token");
  }
  const sub = parseUserId(decoded.sub);
  return {
    sub,
    email: decoded.email,
    typ: "access",
  };
}

export function verifyRefreshToken(token: string): RefreshPayload {
  const env = loadEnv();
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: "health-fitness-api",
  });
  if (!isRecord(decoded)) {
    throw new Error("Invalid refresh token");
  }
  if (decoded.typ !== "refresh" || typeof decoded.jti !== "string") {
    throw new Error("Invalid refresh token");
  }
  const sub = parseUserId(decoded.sub);
  return {
    sub,
    typ: "refresh",
    jti: decoded.jti,
  };
}
