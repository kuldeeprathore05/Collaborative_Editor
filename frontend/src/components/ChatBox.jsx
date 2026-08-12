import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const ChatBox = ({ messages, sendMessage, userName, users }) => {
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (text.trim()) {
      sendMessage(text);
      setText("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="bg-muted/60 px-3 py-1.5 border-b border-border flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Active Users</span>
        <span className="font-medium text-foreground">
          {users.length} {users.length === 1 ? "user" : "users"}
        </span>
      </div>

      <ScrollArea className="flex-1 px-2.5 py-2">
        <div className="space-y-2">
          {messages.map((msg, i) => {
            const isCurrentUser =
              msg.user?.toString().trim().toLowerCase() ===
              userName?.toString().trim().toLowerCase();

            return (
              <div
                key={i}
                className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-md px-2.5 py-1.5 text-[13px] leading-snug ${
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {!isCurrentUser && (
                    <div className="text-[10px] opacity-60 mb-0.5 font-semibold">
                      {msg.user}
                    </div>
                  )}
                  <span className="break-words">{msg.text}</span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-2 border-t border-border bg-card flex gap-1.5">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 h-8 text-[13px] bg-background border-border"
        />
        <Button size="icon" className="h-8 w-8" onClick={handleSend}>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatBox;