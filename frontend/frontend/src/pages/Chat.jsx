import { useEffect, useState } from "react";
import api from "../api/axios";
import socket from "../socket";

export default function Chat() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);

  /* ================= Fetch chats ================= */
  useEffect(() => {
    api.get("/chat").then((res) => setChats(res.data));
  }, []);

  /* ================= Socket listeners ================= */
  useEffect(() => {
    const onReceiveMessage = (msg) => {
      if (msg.chat === activeChat?._id) {
        setMessages((prev) => {
          const exists = prev.find((m) => m._id === msg._id);
          return exists ? prev : [...prev, msg];
        });
      }
    };

    socket.on("receive_message", onReceiveMessage);
    socket.on("typing", () => setTyping(true));
    socket.on("stop_typing", () => setTyping(false));

    return () => {
      socket.off("receive_message", onReceiveMessage);
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [activeChat?._id]);

  /* ================= Active chat ================= */
  useEffect(() => {
    if (!activeChat) return;

    socket.emit("join_chat", activeChat._id);

    api.get(`/message/${activeChat._id}`).then((res) => {
      setMessages(res.data);
    });

    return () => {
      socket.emit("leave_chat", activeChat._id);
      setMessages([]);
    };
  }, [activeChat]);

  /* ================= Send message ================= */
  const sendMessage = async () => {
    if (!text.trim()) return;

    await api.post("/message", {
      content: text,
      chatId: activeChat._id,
    });

    setText("");
    socket.emit("stop_typing", activeChat._id);
  };

  /* ================= Typing ================= */
  const handleTyping = (e) => {
    setText(e.target.value);
    socket.emit("typing", activeChat._id);

    setTimeout(() => {
      socket.emit("stop_typing", activeChat._id);
    }, 800);
  };

  return (
    <div className="h-screen flex">
      {/* Chat list */}
      <div className="w-1/3 border-r p-4">
        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => setActiveChat(chat)}
            className="p-2 cursor-pointer hover:bg-gray-100"
          >
            Chat ({chat.users.length})
          </div>
        ))}
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((m) => (
            <div key={m._id}>
              <b>{m.sender?.name}:</b> {m.content}
            </div>
          ))}
          {typing && (
            <div className="italic text-gray-400">Typing...</div>
          )}
        </div>

        {activeChat && (
          <div className="p-4 flex gap-2">
            <input
              value={text}
              onChange={handleTyping}
              className="flex-1 border p-2"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-black text-white px-4"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
