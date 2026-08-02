import { Hono } from "hono";
import { logger } from "hono/logger";
import { routes } from "./routes";

export const app = new Hono().use(logger()).route("/", routes);
