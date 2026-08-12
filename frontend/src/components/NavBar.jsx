import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play } from "lucide-react";
import ParticipantsPopover from './Participants.jsx'
import { Terminal } from "lucide-react";

const Navbar = ({ roomId, language, handleLanguageChange, copyRoomId, leaveRoom, runCode,users,currentUser }) => {
  return (
    <nav className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
      <div className="flex items-center gap-1.5">
      <Terminal className="size-4 text-primary" /> 
      <h4 className="text-base font-bold tracking-tight  text-white text-primary">CollabCode</h4>
        </div> 
      <div className="flex items-center gap-2.5">
        <Badge
          variant="secondary"
          className="px-2.5 py-1 text-xs font-mono cursor-pointer h-7"
          onClick={copyRoomId}
          title="Click to copy"
        >
          {roomId.slice(0, 8)}...
        </Badge>

        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[120px] h-8 text-xs bg-background border-border">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
            <SelectItem value="java">Java</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={runCode} size="sm" className="h-8 gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs">
          <Play className="w-3.5 h-3.5" /> Run
        </Button>
      </div>
      <div className="flex items-center gap-2.5">
      <ParticipantsPopover users={users} currentUser={currentUser} />

      <Button variant="destructive" size="sm" className="h-8 text-xs" onClick={leaveRoom}>
        Leave
      </Button>
       </div> 
    </nav>
  );
};

export default Navbar;