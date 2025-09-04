import React, { useState } from "react";

const CommunityChatCard = () => {
  const [messages, setMessages] = useState([
    { sender: "Mercy (Nakuru)", text: "The rains came late this season 😓" },
    {
      sender: "John (Kisumu)",
      text: "Try early-maturing maize — I had good results!",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "You", text: input.trim() }]);
    setInput("");
  };

  return (
    <div className="bg-green-50 p-4 rounded-xl shadow-inner text-sm text-green-900">
      <div className="mb-3 font-semibold text-green-800">
        Live Community Feed 💬
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="bg-white p-2 rounded-lg border border-green-200 shadow-sm"
          >
            <span className="font-semibold">{msg.sender}:</span> {msg.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share your tip or question..."
          className="flex-grow px-3 py-2 border border-green-300 rounded-full text-green-900 focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleSend}
          className="bg-green-700 text-white px-4 py-2 rounded-full hover:bg-green-800 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default CommunityChatCard;
