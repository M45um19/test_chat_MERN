import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log("Joined chat:", chatId);
    });

    socket.on("leave_chat", (chatId) => {
      socket.leave(chatId);
    });

    socket.on("typing", (chatId) => {
      socket.to(chatId).emit("typing");
    });

    socket.on("stop_typing", (chatId) => {
      socket.to(chatId).emit("stop_typing");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);
    });
  });
};

export const getIO = () => io;
