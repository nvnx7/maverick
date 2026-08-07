import { Hono } from "hono";
import { claims } from "./claims";
import { health } from "./health";
import { jobs } from "./jobs";
import { upload } from "./upload";

export const routes = new Hono()
  .route("/health", health)
  .route("/jobs", jobs)
  .route("/jobs", claims)
  .route("/upload", upload);
