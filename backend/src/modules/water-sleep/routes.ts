import { Router } from "express";
import type { AuthenticatedUser } from "../../shared/auth/jwt.js";
import type { Request } from "express";

import * as controller from "./controller.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const router = Router();

// ============== WATER ROUTES ==============

// POST /api/v1/water/log - Log water intake
router.post("/water/log", (req, res, next) => {
  controller.handleLogWater(req as Request, res, next);
});

// GET /api/v1/water/logs - Get water logs
router.get("/water/logs", (req, res, next) => {
  controller.handleGetWaterLogs(req as Request, res, next);
});

// GET /api/v1/water/today - Get today's water summary
router.get("/water/today", (req, res, next) => {
  controller.handleGetTodayWater(req as Request, res, next);
});

// PATCH /api/v1/water/goal - Update water goal
router.patch("/water/goal", (req, res, next) => {
  controller.handleUpdateWaterGoal(req as Request, res, next);
});

// ============== SLEEP ROUTES ==============

// POST /api/v1/sleep/log - Log sleep
router.post("/sleep/log", (req, res, next) => {
  controller.handleLogSleep(req as Request, res, next);
});

// GET /api/v1/sleep/logs - Get sleep logs
router.get("/sleep/logs", (req, res, next) => {
  controller.handleGetSleepLogs(req as Request, res, next);
});

// GET /api/v1/sleep/today - Get today's sleep summary
router.get("/sleep/today", (req, res, next) => {
  controller.handleGetTodaySleep(req as Request, res, next);
});

// PATCH /api/v1/sleep/goal - Update sleep goal
router.patch("/sleep/goal", (req, res, next) => {
  controller.handleUpdateSleepGoal(req as Request, res, next);
});

// DELETE /api/v1/sleep/:sleepLogId - Delete sleep log
router.delete("/sleep/:sleepLogId", (req, res, next) => {
  controller.handleDeleteSleepLog(req as Request, res, next);
});

export default router;
