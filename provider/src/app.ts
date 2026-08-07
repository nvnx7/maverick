import { Hono } from "hono";
import { cors } from 'hono/cors'
import { logger } from "hono/logger";
import { routes } from "./routes";

export const app = new Hono().use('*', cors()).use(logger()).route("/", routes);
