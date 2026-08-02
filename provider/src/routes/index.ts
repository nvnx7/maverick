import { Hono } from "hono";
import { health } from "./health";
import { jobs } from "./jobs";

export const routes = new Hono().route("/health", health).route("/jobs", jobs);
