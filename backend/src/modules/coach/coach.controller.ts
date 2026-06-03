import type { Response } from "express";
import type { AuthedRequest } from "../../shared/middleware/require-auth.js";
import { ChatRequestSchema } from "./coach.dto.js";
import { processCoachChat } from "./coach.service.js";
import { AppError } from "../../shared/errors/app-error.js";
import { ApiErrorCodes } from "@health-fitness/shared";
import { getLogger } from "../../shared/logger.js";

const logger = getLogger();

export async function handleCoachChat(
  req: AuthedRequest,
  res: Response,
): Promise<void> {
  try {
    // 1. Validate inputs
    const parsed = ChatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        400,
        ApiErrorCodes.VALIDATION_ERROR,
        "Invalid chat message array inputs",
        parsed.error.format(),
      );
    }

    const { messages } = parsed.data;
    const userId = req.user.id;

    logger.info({ userId, messageCount: messages.length }, "Received AI coach conversation request");

    // 2. Call service layer
    const reply = await processCoachChat(userId, messages);

    // 3. Respond
    res.status(200).json({
      reply,
    });
  } catch (err: any) {
    logger.error({ err, userId: req.user?.id }, "Error occurred in AI coach chat handler");
    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        code: err.code,
        message: err.message,
        details: err.details,
        requestId: req.requestId,
      });
    } else {
      res.status(500).json({
        code: ApiErrorCodes.INTERNAL_ERROR,
        message: "An internal server error occurred while talking to the AI coach.",
        requestId: req.requestId,
      });
    }
  }
}
