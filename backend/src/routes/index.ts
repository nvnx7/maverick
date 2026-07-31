import { Hono } from "hono";
import { health } from "./health";

export const routes = new Hono().route("/health", health);
