import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket.js";
import EditorWrapper from "../components/EditorWrapper.jsx";
import ChatBox from "../components/ChatBox.jsx";
import Navbar from "../components/NavBar.jsx";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const Main = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// start coding...");
  const [outPut, setOutPut] = useState("");
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    socket.connect();
    socket.emit("join", { roomId, token, userName: user?.name });

    const handleUserList = (list) => setUsers(list);
    const handleCodeUpdate = (newCode) => setCode(newCode);
    const handleLanguageUpdate = (lang) => setLanguage(lang);
    const handleCodeResponse = (res) => setOutPut(res.run.output);
    const handleChatHistory = (history) => setMessages(history);

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      setIsChatOpen((currentlyOpen) => {
        if (!currentlyOpen) setUnreadCount((prev) => prev + 1);
        return currentlyOpen;
      });
    };

    socket.on("userList", handleUserList);
    socket.on("codeUpdate", handleCodeUpdate);
    socket.on("languageUpdate", handleLanguageUpdate);
    socket.on("codeResponse", handleCodeResponse);
    socket.on("newMessage", handleNewMessage);
    socket.on("chatHistory", handleChatHistory);

    return () => {
      socket.off("userList", handleUserList);
      socket.off("codeUpdate", handleCodeUpdate);
      socket.off("languageUpdate", handleLanguageUpdate);
      socket.off("codeResponse", handleCodeResponse);
      socket.off("newMessage", handleNewMessage);
      socket.off("chatHistory", handleChatHistory);
      socket.emit("leaveRoom");
      socket.disconnect();
    };
  }, [roomId, user?.name]);

  const leaveRoom = () => navigate("/dashboard");

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied");
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
  };

  const handleLanguageChange = (val) => {
    setLanguage(val);
    socket.emit("languageChange", { roomId, language: val });
  };

  const runCode = () => {
    setOutPut("Running code...");
    socket.emit("compileCode", { code, roomId, language, input: userInput });
  };

  const sendMessage = (text) => {
    socket.emit("sendMessage", { roomId, msg: { text, user: user?.name } });
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) setUnreadCount(0);
  };
  
  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-background">
      <Navbar
        roomId={roomId}
        language={language}
        handleLanguageChange={handleLanguageChange}
        copyRoomId={copyRoomId}
        leaveRoom={leaveRoom}
        runCode={runCode}
        users={users}
        currentUser={user?.name}
      />

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup orientation="horizontal">

          {/* left psanel ... coder editor */}
          <ResizablePanel defaultSize={62} minSize={30}>
            <EditorWrapper
              code={code}
              language={language}
              handleCodeChange={handleCodeChange}
              socket={socket}   
              roomId={roomId}   
              user={user}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* righht panel i/o */}
          <ResizablePanel defaultSize={36} minSize={20}>
            <ResizablePanelGroup orientation="vertical">

              {/* top right input */}
              <ResizablePanel defaultSize={40} minSize={20}>
                <div className="flex h-full flex-col bg-surface-2">
                  <div className="flex items-center border-b border-border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Input
                  </div>
                  <textarea
                    className="flex-1 w-full p-3 bg-transparent text-sm resize-none focus:outline-none placeholder:text-muted-foreground/60"
                    placeholder="Enter custom input here..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* bottom right output */}
              <ResizablePanel defaultSize={60} minSize={20}>
                <div className="flex h-full flex-col bg-terminal">
                  <span className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground border-b border-border">
                    OUTPUT
                  </span>
                  <pre className="flex-1 w-full p-3 font-mono text-[13px] text-green-400 overflow-auto bg-black/40">
                    {outPut || "Click 'Run' to see output..."}
                  </pre>
                </div>
              </ResizablePanel>

            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* chat box */}
      {isChatOpen && (
        <div
          className="absolute bg-card border border-border shadow-2xl flex flex-col rounded-lg overflow-hidden z-50"
          style={{
            bottom: "76px",
            right: "20px",
            width: "320px",
            height: "420px",
            minWidth: "260px",
            minHeight: "300px",
            resize: "both",
          }}
        >
          <div className="bg-muted px-3 py-2 flex justify-between items-center cursor-move border-b border-border">
            <span className="font-semibold text-xs text-foreground">Room Chat</span>
            <button onClick={() => setIsChatOpen(false)} className="text-muted-foreground hover:text-foreground text-sm">
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatBox
              messages={messages}
              sendMessage={sendMessage}
              userName={user?.name}
              users={users}
            />
          </div>
        </div>
      )}

      {/* chat toggle */}
      <Button
        size="icon"
        className="absolute bottom-5 right-5 h-12 w-12 rounded-full shadow-xl z-50"
        onClick={toggleChat}
      >
        <MessageSquare className="h-5 w-5" />
        {unreadCount > 0 && !isChatOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-background">
            {unreadCount/2 > 9 ? "9+" : unreadCount/2}
          </span>
        )}
      </Button>
    </div>
  );
};

export default Main;