import { describe, expect, it, vi, beforeEach } from "vitest";
import { register, login, refresh, logout } from "./auth.service.js";
import * as jwt from "../../shared/auth/jwt.js";
import * as tokenHash from "../../shared/crypto/token-hash.js";
import * as env from "../../shared/config/env.js";
import { AppError } from "../../shared/errors/app-error.js";

vi.mock("../../shared/config/env.js", () => ({
  loadEnv: vi.fn(() => ({
    ACCESS_TOKEN_TTL_SEC: 900,
    REFRESH_TOKEN_TTL_SEC: 604800,
    BCRYPT_ROUNDS: 10,
  })),
}));

vi.mock("../../shared/db/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

const mockPrisma = await import("../../shared/db/prisma.js").then(
  (m) => m.prisma
);

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        status: "active",
        passwordHash: "hashed",
      };

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue(mockUser);
      vi.mocked(mockPrisma.refreshToken.create).mockResolvedValue({} as any);
      vi.spyOn(jwt, "signAccessToken").mockReturnValue("access-token");
      vi.spyOn(jwt, "signRefreshToken").mockReturnValue("refresh-token");
      vi.spyOn(tokenHash, "hashToken").mockReturnValue("jti-hash");

      const result = await register({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.user.email).toBe("test@example.com");
      expect(result.tokens.accessToken).toBe("access-token");
      expect(result.tokens.refreshToken).toBe("refresh-token");
    });

    it("should throw conflict error when email already exists", async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 1,
        email: "test@example.com",
        status: "active",
      });

      await expect(
        register({
          email: "test@example.com",
          password: "password123",
        })
      ).rejects.toThrow(AppError);
    });

    it("should normalize email to lowercase", async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(mockPrisma.user.create).mockResolvedValue({
        id: 1,
        email: "test@example.com",
        status: "active",
        passwordHash: "hashed",
      });
      vi.mocked(mockPrisma.refreshToken.create).mockResolvedValue({} as any);
      vi.spyOn(jwt, "signAccessToken").mockReturnValue("access-token");
      vi.spyOn(jwt, "signRefreshToken").mockReturnValue("refresh-token");
      vi.spyOn(tokenHash, "hashToken").mockReturnValue("jti-hash");

      await register({
        email: "TEST@EXAMPLE.COM",
        password: "password123",
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });
  });

  describe("login", () => {
    it("should login successfully with correct credentials", async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 1,
        email: "test@example.com",
        status: "active",
        passwordHash:
          "$2b$10$abcdefghijklmnopqrstuv",
      });
      vi.mocked(mockPrisma.refreshToken.create).mockResolvedValue({} as any);
      vi.spyOn(jwt, "signAccessToken").mockReturnValue("access-token");
      vi.spyOn(jwt, "signRefreshToken").mockReturnValue("refresh-token");
      vi.spyOn(tokenHash, "hashToken").mockReturnValue("jti-hash");

      const result = await login({
        email: "test@example.com",
        password: "correct-password",
      });

      expect(result.user.id).toBe(1);
      expect(result.tokens.accessToken).toBe("access-token");
    });

    it("should throw unauthorized when user not found", async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);

      await expect(
        login({
          email: "nonexistent@example.com",
          password: "password",
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe("refresh", () => {
    it("should refresh tokens successfully", async () => {
      const mockPayload = { sub: 1, jti: "valid-jti" };

      vi.mocked(mockPrisma.refreshToken.findFirst).mockResolvedValue({
        id: 1,
        userId: 1,
        tokenHash: "valid-jti",
        expiresAt: new Date(Date.now() + 86400000),
      });
      vi.mocked(mockPrisma.refreshToken.delete).mockResolvedValue({} as any);
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 1,
        email: "test@example.com",
        status: "active",
      });
      vi.mocked(mockPrisma.refreshToken.create).mockResolvedValue({} as any);
      vi.spyOn(jwt, "verifyRefreshToken").mockReturnValue(mockPayload as any);
      vi.spyOn(jwt, "signAccessToken").mockReturnValue("new-access-token");
      vi.spyOn(jwt, "signRefreshToken").mockReturnValue("new-refresh-token");
      vi.spyOn(tokenHash, "hashToken").mockReturnValue("new-jti-hash");

      const result = await refresh("valid-refresh-token");

      expect(result.tokens.accessToken).toBe("new-access-token");
      expect(result.tokens.refreshToken).toBe("new-refresh-token");
    });

    it("should throw unauthorized when token expired", async () => {
      vi.mocked(jwt.verifyRefreshToken).mockReturnValue({
        sub: 1,
        jti: "expired-jti",
      });
      vi.mocked(mockPrisma.refreshToken.findFirst).mockResolvedValue(null);

      await expect(refresh("expired-token")).rejects.toThrow(AppError);
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      const mockPayload = { sub: 1, jti: "valid-jti" };

      vi.mocked(jwt.verifyRefreshToken).mockReturnValue(mockPayload as any);
      vi.mocked(mockPrisma.refreshToken.deleteMany).mockResolvedValue({
        count: 1,
      });

      await expect(
        logout(1, "valid-refresh-token")
      ).resolves.toBeUndefined();
    });

    it("should throw forbidden when token belongs to different user", async () => {
      const mockPayload = { sub: 2, jti: "valid-jti" };

      vi.mocked(jwt.verifyRefreshToken).mockReturnValue(mockPayload as any);

      await expect(logout(1, "token-of-user2")).rejects.toThrow(AppError);
    });
  });
});
