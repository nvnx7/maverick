import { Hono } from "hono";
import { health } from "./health.js";

export const routes = new Hono().route("/health", health);
