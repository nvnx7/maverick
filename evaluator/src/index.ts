import { app } from "./app";

const port = Number(process.env.PORT ?? 4001);

console.log(`Server listening on :${port}`);

export default {
  port,
  fetch: app.fetch,
};
