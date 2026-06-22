import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";
import { ApiError } from "./utils/apiError.js";
import fs from "fs";
import path from "path";
import clerkWebhook from "./webhooks/clerk.webhook.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// webhook route
app.use(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhook
);

//common middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(clerkMiddleware());

const publicDir = path.join(process.cwd(), "public");

// heathcheck
import healthCheckRouter from "./routes/healthcheck.routes.js";
app.use("/api/healthcheck", healthCheckRouter);

app.use("/api/auth", authRoutes);

//  if the public directory exists, serve the static files
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  app.get("/{*any}", (req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
  });
}

// global error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export { app };
