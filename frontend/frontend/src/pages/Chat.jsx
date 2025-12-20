import { useEffect, useState } from "react";
import api from "../api/axios";
import socket from "../socket";

export default function Chat() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  /* =========================
     Fetch user chats
  ========================= */
  useEffect(() => {
    const fetchChats = async () => {
      const { data } = await api.get("/chat");
      setChats(data);
    };
    fetchChats();
  }, []);

  /* =========================
     Handle active chat
  ========================= */
  useEffect(() => {
    if (!activeChat) return;

    socket.emit("join_chat", activeChat._id);

    api.get(`/message/${activeChat._id}`).then((res) => {
      setMessages(res.data);
    });

    const messageHandler = (msg) => {
      if (msg.chat === activeChat._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receive_message", messageHandler);

    return () => {
      socket.off("receive_message", messageHandler);
    };
  }, [activeChat]);

  /* =========================
     Start new chat
  ========================= */
  const startChat = async () => {
    const userId = prompt("Enter other user ID");
    if (!userId) return;

    const { data } = await api.post("/chat", { userId });

    setChats((prev) => {
      const exists = prev.find((c) => c._id === data._id);
      if (exists) return prev;
      return [...prev, data];
    });

    setActiveChat(data);
  };

  /* =========================
     Send message
  ========================= */
  const sendMessage = async () => {
    if (!text.trim() || !activeChat) return;

    await api.post("/message", {
      content: text,
      chatId: activeChat._id,
    });

    setText("");
  };

  return (
    <div className="h-screen flex">
      {/* ================= Chat List ================= */}
      <div className="w-1/3 bg-white border-r p-4 flex flex-col">
        <button
          onClick={startChat}
          className="w-full bg-black text-white py-2 rounded mb-4"
        >
          Start New Chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-1">
          {chats.map((chat) => (
            <div
              key={chat._id}
              className={`p-2 rounded cursor-pointer ${
                activeChat?._id === chat._id
                  ? "bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveChat(chat)}
            >
              Chat with {chat.users.length} users
            </div>
          ))}
        </div>
      </div>

      {/* ================= Chat Window ================= */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {activeChat ? (
            messages.map((m) => (
              <div key={m._id} className="mb-2">
                <span className="font-semibold">{m.sender.name}:</span>{" "}
                {m.content}
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select a chat to start messaging
            </div>
          )}
        </div>

        {activeChat && (
          <div className="p-4 flex gap-2 border-t">
            <input
              className="flex-1 border p-2 rounded"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-black text-white px-4 rounded"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
