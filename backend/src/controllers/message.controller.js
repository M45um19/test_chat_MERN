import Message from "../models/Message.js";
import { getIO } from "../config/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body;

    const message = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId,
    });

    const fullMessage = await message.populate(
      "sender",
      "name email"
    );

    // 🔥 REAL-TIME EMIT FROM SERVER
    getIO().to(chatId).emit("receive_message", {
      ...fullMessage.toObject(),
      chat: chatId, // important for frontend check
    });

    res.json(fullMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const fetchMessages = async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name email")
    .sort({ createdAt: 1 });

  res.json(messages);
};
