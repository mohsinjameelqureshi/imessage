import { CronJob } from "cron";
import http from "node:http";
import https from "node:https";

const job = new CronJob("*/14****", function () {
  const base = process.env.CLIENT_URL;
  if (!base) return;
  const url = new URL("/api/healthcheck", base).href;
  const client = url.startsWith("https:") ? https : http;

  client
    .get(url, (res) => {
      if (res.statusCode === 200) console.log("Get request sent successfully");
      else console.log("Get request failed", res.statusCode);
    })
    .on("error", (e) => console.error("Error while sending request", e));
});

export default job;
