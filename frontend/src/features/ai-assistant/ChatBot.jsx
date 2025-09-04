import React, { useState } from "react";
import axios from "axios";

const initialMessages = [
  {
    role: "bot",
    text: "👋🏽 Welcome to FarmBotika AI! I'm here to help with farming advice, seasonal tips, and weather updates. What would you like to know?",
  },
];

const ChatBot = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { role: "user", text: trimmed };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", trimmed);

      const response = await axios.post("http://localhost:5001/ask", formData);

      const botText =
        response?.data?.response?.trim() ||
        "🤖 Hmm... I didn't get a reply. Try again later.";

      const reply = {
        role: "bot",
        text: botText,
      };

      setMessages((msgs) => [...msgs, reply]);
    } catch (error) {
      console.error("Chatbot error:", error.message);
      setMessages((msgs) => [
        ...msgs,
        {
          role: "bot",
          text: "⚠️ Sorry, I couldn't reach the server. Please check your connection or try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-black bg-gradient-to-br from-white via-lime-50 to-green-50 border border-green-300 rounded-xl shadow-md flex flex-col overflow-hidden font-poppins">
      {/* Chat Window */}
      <div className="p-4 max-h-[300px] overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-full text-sm shadow-sm max-w-[80%] ${
                m.role === "user"
                  ? "bg-green-700 text-white"
                  : "bg-green-100 text-green-900"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="border-t bg-white px-4 py-3 flex gap-3 items-center">
        <input
          className="flex-1 border border-green-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about crops, weather, or soil..."
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-green-700 text-white px-5 py-2 rounded-full hover:bg-green-800 transition duration-300 shadow-sm"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
