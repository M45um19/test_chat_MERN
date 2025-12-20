import Message from "../models/Message.js";
import { getIO } from "../config/socket.js";

export const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  const message = await Message.create({
    sender: req.user._id,
    content,
    chat: chatId,
  });

  const fullMessage = await message.populate("sender", "name email");

  getIO().to(chatId).emit("receive_message", fullMessage);

  res.json(fullMessage);
};

export const fetchMessages = async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "name email");

  res.json(messages);
};
