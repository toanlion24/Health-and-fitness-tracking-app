import "dotenv/config";
import { createServer } from "node:http";
import { createApp } from "./app.js";
import { loadEnv } from "./shared/config/env.js";
import { getLogger } from "./shared/logger.js";

const env = loadEnv();
const app = createApp();
const server = createServer(app);

server.listen(env.PORT, "0.0.0.0", () => {
  getLogger().info({ port: env.PORT }, "API listening on 0.0.0.0");
});