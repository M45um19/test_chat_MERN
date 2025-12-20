import Chat from "../models/Chat.js";

export const accessChat = async (req, res) => {
  const { userId } = req.body;

  let chat = await Chat.findOne({
    users: { $all: [req.user._id, userId] },
  }).populate("users", "-password");

  if (!chat) {
    chat = await Chat.create({
      users: [req.user._id, userId],
    });
    chat = await chat.populate("users", "-password");
  }

  res.json(chat);
};

export const fetchChats = async (req, res) => {
  const chats = await Chat.find({
    users: req.user._id,
  }).populate("users", "-password");

  res.json(chats);
};
