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
  if (!user || !user.passwordHash) {
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

import { OAuth2Client } from "google-auth-library";
import appleSignin from "apple-signin-auth";
import type { SocialLoginBody } from "./auth.dto.js";

export async function loginWithGoogle(body: SocialLoginBody): Promise<{ user: AuthUserDto; tokens: AuthTokens }> {
  const env = loadEnv();
  if (!env.GOOGLE_CLIENT_ID) {
    throw new AppError(500, ApiErrorCodes.INTERNAL_ERROR, "Google login is not configured on the server");
  }

  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  
  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken: body.idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    throw new AppError(401, ApiErrorCodes.UNAUTHORIZED, "Invalid Google ID token");
  }

  const payload = ticket.getPayload();
  if (!payload || !payload.email || !payload.sub) {
    throw new AppError(401, ApiErrorCodes.UNAUTHORIZED, "Invalid Google token payload");
  }

  const email = payload.email.toLowerCase();
  const googleId = payload.sub;

  return processSocialLogin(email, { googleId });
}

export async function loginWithApple(body: SocialLoginBody): Promise<{ user: AuthUserDto; tokens: AuthTokens }> {
  const env = loadEnv();
  
  let appleIdToken;
  try {
    appleIdToken = await appleSignin.verifyIdToken(body.idToken, {
      audience: env.APPLE_CLIENT_ID, // Audience is optional, but recommended
      ignoreExpiration: true, // We might want to set this to false in production
    });
  } catch (error) {
    throw new AppError(401, ApiErrorCodes.UNAUTHORIZED, "Invalid Apple ID token");
  }

  if (!appleIdToken || !appleIdToken.sub) {
    throw new AppError(401, ApiErrorCodes.UNAUTHORIZED, "Invalid Apple token payload");
  }

  const appleId = appleIdToken.sub;
  const email = appleIdToken.email?.toLowerCase(); // Email might be hidden or only sent on first login

  if (!email) {
    // If Apple didn't provide an email (e.g., user hid it or subsequent logins), we MUST find the user by appleId
    const existingUser = await prisma.user.findUnique({
      where: { appleId },
    });

    if (!existingUser) {
       throw new AppError(400, ApiErrorCodes.VALIDATION_ERROR, "Apple email is missing and user not found");
    }
    
    const tokens = await issueTokens(existingUser.id, existingUser.email);
    return { user: mapUser(existingUser), tokens };
  }

  return processSocialLogin(email, { appleId });
}

async function processSocialLogin(email: string, socialIds: { googleId?: string; appleId?: string }): Promise<{ user: AuthUserDto; tokens: AuthTokens }> {
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    // Link social ID if not already linked
    if ((socialIds.googleId && user.googleId !== socialIds.googleId) || 
        (socialIds.appleId && user.appleId !== socialIds.appleId)) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: socialIds.googleId || user.googleId,
          appleId: socialIds.appleId || user.appleId,
        },
      });
    }
  } else {
    // Create new user without password
    user = await prisma.user.create({
      data: {
        email,
        googleId: socialIds.googleId,
        appleId: socialIds.appleId,
        profile: {
          create: {},
        },
      },
    });
  }

  const tokens = await issueTokens(user.id, user.email);
  return { user: mapUser(user), tokens };
}

