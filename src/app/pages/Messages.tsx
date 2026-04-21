import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { mockApi } from "../lib/mockApi";

interface Item {
  id: string;
  name: string;
  status: string;
  imageUrls?: string[];
  userId: string;
  userName: string;
}

interface Message {
  id: number;
  sender: string;
  text: string;
  timestamp: string;
  isCurrentUser: boolean;
}

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchItem(); }, [id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchItem = async () => {
    try {
      if (id) {
        const data = await mockApi.getItem(id);
        setItem(data);
      }
    } catch (error) {
      console.error("Error fetching item:", error);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
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
      <header className="navbar-poke sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/my-items")} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base text-white font-bold">{item?.name || "Messages"}</h1>
            <p className="text-xs text-white/60">Conversation about this item</p>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-4 flex flex-col" style={{ minHeight: "calc(100vh - 72px)" }}>
        {/* Messages list */}
        <div className="flex-1 card-poke p-4 mb-3 overflow-y-auto space-y-3" style={{ minHeight: 300 }}>
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isCurrentUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.isCurrentUser
                  ? "bg-[#1565C0] text-white"
                  : "bg-[var(--poke-surface-2)] text-[var(--poke-text)] border border-[var(--poke-border)]"
              }`}>
                <p className="text-sm mb-1">{message.text}</p>
                <p className={`text-xs ${message.isCurrentUser ? "text-white/60" : "text-[var(--poke-text-dim)]"}`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="card-poke p-3 flex gap-2">
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
            className="btn-poke-primary px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
