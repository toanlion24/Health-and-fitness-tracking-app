import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import { ApiErrorCodes } from "@health-fitness/shared";
import type { AuthTokens, AuthUserDto } from "@health-fitness/shared";
import { loadEnv } from "../../shared/config/env.js";
import { prisma } from "../../shared/db/prisma.js";
import { AppError } from "../../shared/errors/app-error.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../shared/auth/jwt.js";
import { hashToken } from "../../shared/crypto/token-hash.js";
import type { LoginBody, RegisterBody } from "./auth.dto.js";

function mapUser(user: {
  id: number;
  email: string;
  status: string;
}): AuthUserDto {
  return {
    id: user.id,
    email: user.email,
    status: user.status,
  };
}

async function issueTokens(userId: number, email: string): Promise<AuthTokens> {
  const env = loadEnv();
  const rawRefresh = randomBytes(48).toString("hex");
  const jti = hashToken(rawRefresh);
  const accessToken = signAccessToken(userId, email);
  const refreshTokenJwt = signRefreshToken(userId, jti);
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_SEC * 1000);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: jti,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken: refreshTokenJwt,
    expiresIn: env.ACCESS_TOKEN_TTL_SEC,
  };
}

export async function register(
  body: RegisterBody,
): Promise<{ user: AuthUserDto; tokens: AuthTokens }> {
  const env = loadEnv();
  const existing = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() },
  });
  if (existing) {
    throw new AppError(
      409,
      ApiErrorCodes.CONFLICT,
      "Email already registered",
    );
  }

  const passwordHash = await bcrypt.hash(body.password, env.BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email: body.email.toLowerCase(),
      passwordHash,
      profile: {
        create: {},
      },
    },
  });

  const tokens = await issueTokens(user.id, user.email);
  return { user: mapUser(user), tokens };
}

export async function login(
  body: LoginBody,
): Promise<{ user: AuthUserDto; tokens: AuthTokens }> {
  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() },
  });
  if (!user) {
    throw new AppError(
      401,
      ApiErrorCodes.UNAUTHORIZED,
      "Invalid email or password",
    );
  }

  const ok = await bcrypt.compare(body.password, user.passwordHash);
  if (!ok) {
    throw new AppError(
      401,
      ApiErrorCodes.UNAUTHORIZED,
      "Invalid email or password",
    );
  }

  const tokens = await issueTokens(user.id, user.email);
  return { user: mapUser(user), tokens };
}

export async function refresh(
  refreshToken: string,
): Promise<{ tokens: AuthTokens }> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(
      401,
      ApiErrorCodes.UNAUTHORIZED,
      "Invalid refresh token",
    );
  }

  const stored = await prisma.refreshToken.findFirst({
    where: {
      userId: payload.sub,
      tokenHash: payload.jti,
    },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(
      401,
      ApiErrorCodes.UNAUTHORIZED,
      "Refresh token expired or revoked",
    );
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new AppError(401, ApiErrorCodes.UNAUTHORIZED, "User not found");
  }

  const tokens = await issueTokens(user.id, user.email);
  return { tokens };
}

export async function logout(userId: number, refreshToken: string): Promise<void> {
  try {
    const payload = verifyRefreshToken(refreshToken);
    if (payload.sub !== userId) {
      throw new AppError(
        403,
        ApiErrorCodes.FORBIDDEN,
        "Token does not belong to user",
      );
    }
    await prisma.refreshToken.deleteMany({
      where: { userId, tokenHash: payload.jti },
    });
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(
      401,
      ApiErrorCodes.UNAUTHORIZED,
      "Invalid refresh token",
    );
  }
}
