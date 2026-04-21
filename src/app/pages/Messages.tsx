import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { mockApi } from "../lib/mockApi";

interface Item { id: string; name: string; category: string; location: string; dateFound: string; description: string; status: string; imageUrls?: string[]; userId: string; userName: string; }
interface Message { id: number; sender: string; text: string; timestamp: string; isCurrentUser: boolean; }

const MOCK_MESSAGES: Message[] = [
  { id: 1, sender: "john.doe", text: "Hi! I think this might be my phone. I lost it yesterday near the student center.", timestamp: "10:30 AM", isCurrentUser: false },
  { id: 2, sender: "You", text: "Can you describe any unique features or what's on the lock screen?", timestamp: "10:35 AM", isCurrentUser: true },
  { id: 3, sender: "john.doe", text: "It has a cracked screen protector and a blue floral case. Lock screen is a photo of a golden retriever.", timestamp: "10:37 AM", isCurrentUser: false },
];

export default function Messages() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [item, setItem] = useState<Item | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) mockApi.getItem(id).then(setItem).catch(console.error);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([...messages, {
      id: messages.length + 1,
      sender: "You",
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isCurrentUser: true,
    }]);
    setNewMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="navbar-poke sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button onClick={() => navigate("/my-items")} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-black text-white leading-tight" style={{ fontFamily: "Rajdhani, sans-serif" }}>
              {item?.name || "Messages"}
            </h1>
            <p className="text-xs text-white/40">Conversation with john.doe</p>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-4 flex flex-col">
        {/* Messages */}
        <div className="flex-1 card-minimal p-4 mb-3 overflow-y-auto space-y-3 min-h-[400px]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                msg.isCurrentUser
                  ? "bg-gradient-to-br from-[#E3350D] to-[#B02800] text-white rounded-br-sm"
                  : "bg-white/10 text-white rounded-bl-sm border border-white/10"
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.isCurrentUser ? "text-white/50" : "text-white/30"}`}>{msg.timestamp}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input-poke flex-1"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn-poke-primary px-5 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
