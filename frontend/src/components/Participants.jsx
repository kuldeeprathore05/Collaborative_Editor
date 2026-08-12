import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
 
export default function ParticipantsPopover({ users = [], currentUser }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex gap-2">
          <Users className="w-4 h-4" />
          <span>{users.length}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-56" align="end">
        <div className="space-y-2">
          <h4 className="font-medium text-sm leading-none mb-3">
            People in Room
          </h4>

          <ScrollArea className="h-32">
            <div className="flex flex-col gap-2">
              {users.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No one else here yet
                </p>
              )}
              {users.map((name) => (
                <div key={name} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  {name === currentUser ? `${name} (You)` : name}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}