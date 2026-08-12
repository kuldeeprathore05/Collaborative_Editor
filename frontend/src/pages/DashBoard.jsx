import { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackDrop } from "@/components/BackDrop.jsx";
import { LogOut, Plus, Terminal } from "lucide-react";

const Dashboard = () => {
  const [roomId, setRoomId] = useState("");
  const [myRooms, setMyRooms] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/rooms/my-rooms");
        setMyRooms(res.data.rooms);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRooms();
  }, []);

  const createRoom = async () => {
    const newRoomId = uuid();
    try {
      await api.post("/rooms/create", { roomId: newRoomId });
      navigate(`/room/${newRoomId}`);
    } catch (err) {
      toast.error("Could not create room");
    }
  };

  const joinRoom = () => {
    if (!roomId) return toast.error("Enter a Room ID");
    navigate(`/room/${roomId}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main className="relative min-h-screen bg-surface-1 text-white">
      <BackDrop />
      
     <header className="relative z-10 flex h-11 w-full shrink-0 items-center justify-between border-b border-border bg-surface-2/80 px-4 backdrop-blur-xl">
        {/* left side logo */}
        <div className="flex items-center gap-1.5">
          <Terminal className="size-4 text-primary" />
          <span className="text-[13px] font-semibold tracking-tight text-white">CollabCode</span>
        </div>

        {/* right Side  username , logout */}
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-zinc-400">Hi, {user?.name || "Coder"}</span>
          
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 px-2 text-[12px] text-zinc-400 hover:text-red-400 hover:bg-transparent"
            onClick={handleLogout}
          >
            <LogOut className="size-3.5" />
            Logout
          </Button>
        </div>
      </header>

      {/* main */}
      <div className="relative z-10 mx-auto w-full max-w-[560px] px-4 py-8">
        <div className="rounded-lg border border-border bg-surface-2/85 p-5 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <h1 className="text-[15px] font-semibold tracking-tight text-white">Join a room</h1>
          <p className="mt-1 text-[12px] text-zinc-400">
            Paste a room ID to hop into an existing session.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <Input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
              placeholder="Room ID"
              className="h-9 flex-1 bg-background font-mono text-[12.5px] text-white placeholder:text-zinc-600 border-zinc-700"
            />
            <Button className="h-9 px-4 text-[13px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white" onClick={joinRoom}>
              Join
            </Button>
          </div>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="secondary"
            className="h-9 w-full gap-1.5 text-[13px] bg-zinc-800 text-white hover:bg-zinc-700 border-zinc-700"
            onClick={createRoom}
          >
            <Plus className="size-3.5" />
            Create new room
          </Button>
        </div>
 
      </div>
    </main>
  );
};

export default Dashboard;