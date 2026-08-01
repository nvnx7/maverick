import { Hono } from "hono";
import { health } from "./health";
import { specs } from "./specs";

export const routes = new Hono()
  .route("/health", health)
  .route("/specs", specs);
