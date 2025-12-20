import express from "express";
import protect from "../middleware/auth.middleware.js";
import { accessChat, fetchChats } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/", protect, accessChat);
router.get("/", protect, fetchChats);

export default router;
