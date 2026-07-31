import { app } from "./app.js";

const port = Number(process.env.PORT ?? 3000);

console.log(`backend listening on :${port}`);

export default {
  port,
  fetch: app.fetch,
};
