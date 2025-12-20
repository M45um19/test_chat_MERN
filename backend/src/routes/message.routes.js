import express from "express";
import protect from "../middleware/auth.middleware.js";
import { sendMessage, fetchMessages } from "../controllers/message.controller.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/:chatId", protect, fetchMessages);

export default router;
