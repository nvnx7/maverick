import { app } from "./app";

const port = Number(process.env.PORT ?? 4000);

console.log(`backend listening on :${port}`);

export default {
  port,
  fetch: app.fetch,
};
