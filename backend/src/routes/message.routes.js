import express from "express";
import {
  getConversationsForSidebar,
  getMessages,
  getUserForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.route("/users").get(getUserForSidebar);
router.route("/conversations").get(getConversationsForSidebar);
router.route("/:id").get(getMessages);
router.route("/send/:id").post(upload.single("media"), sendMessage);

export default router;
