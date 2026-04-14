import pino from "pino";
import { loadEnv } from "./config/env.js";

let loggerInstance: pino.Logger | null = null;

export function getLogger(): pino.Logger {
  if (loggerInstance) {
    return loggerInstance;
  }
  const env = loadEnv();
  loggerInstance = pino({
    level: env.NODE_ENV === "development" ? "debug" : "info",
  });
  return loggerInstance;
}
