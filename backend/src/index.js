import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";
import job from "./lib/cron.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("Server is running on port: ", PORT);

      if (process.env.NODE_ENV === "production") {
        job.start();
      }
    });
  })
  .catch((err) => {
    console.log("MongoDB connection error ", err);
  });
