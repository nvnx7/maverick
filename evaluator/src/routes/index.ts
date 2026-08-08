import { Hono } from "hono";
import { claims } from "./claims";
import { health } from "./health";

export const routes = new Hono()
  .route("/health", health)
  .route("/jobs", claims);
