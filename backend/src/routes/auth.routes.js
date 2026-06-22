import express from "express";
import { checkAuth } from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/check").get(protectRoute, checkAuth);

export default router;
