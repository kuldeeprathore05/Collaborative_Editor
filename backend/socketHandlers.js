import {executeCode} from "./piston.js"; 
import Room from "./models/Room.js";  
 
const rooms = new Map(); 
const saveTimers = new Map();

export const handleSocketEvents=(io)=>{
  io.on("connection", (socket)=>{
    console.log("New user connected:", socket.id);

    // join room
    socket.on("join", async ({roomId,token,userName})=>{
      if (socket.currentRoom) leaveRoom(io, socket);

      socket.currentRoom = roomId;
      socket.currentUser = userName;
      socket.join(roomId); 

      if (!rooms.has(roomId)) {
        let existingCode = "// start coding...";
        let savedLanguage = "javascript";
        let snippetsMap = new Map();

        try {
          const dbRoom = await Room.findOne({roomId});
          if (dbRoom) {
            savedLanguage = dbRoom.currentLanguage || "javascript";
            snippetsMap = dbRoom.codeSnippets || new Map();
 
            if (snippetsMap.get && snippetsMap.get(savedLanguage)) {
              existingCode = snippetsMap.get(savedLanguage);
            }
          }
        } catch (err) {
          console.error("Error fetching room from MongoDB:", err);
        }
 
        rooms.set(roomId, {
          users: new Set(),
          language: savedLanguage,
          codeSnippets: snippetsMap,
          output: "",
          messages: [],
        });
      }

      const room = rooms.get(roomId);
      if (userName) room.users.add(userName); 
      io.to(roomId).emit("userList", Array.from(room.users));
      socket.emit("languageUpdate", room.language);
       
      const currentCode = room.codeSnippets.get
        ? (room.codeSnippets.get(room.language) || "// start coding...")
        : "// start coding...";

      socket.emit("codeUpdate", currentCode);
      socket.emit("chatHistory", room.messages || []);
    });
 
    // change lang
    socket.on("languageChange", ({roomId,language}) => {
      if (!rooms.has(roomId)) return;
      const room = rooms.get(roomId);

      room.language = language;
 
      const selectedLanguageCode = room.codeSnippets.get
        ? (room.codeSnippets.get(language) || `// start coding in ${language}...`)
        : `// start coding in ${language}...`;
 
      io.to(roomId).emit("languageUpdate", language);
      io.to(roomId).emit("codeUpdate", selectedLanguageCode);
    });

    //code change
    socket.on("codeChange", ({roomId,code})=>{
      if (!rooms.has(roomId)) return;
      const room = rooms.get(roomId); 
      const activeLanguage = room.language || "javascript";
 
      if (room.codeSnippets.set) {
        room.codeSnippets.set(activeLanguage, code);
      }
 
      socket.to(roomId).emit("codeUpdate", code);
 
      if (saveTimers.has(roomId)) {
        clearTimeout(saveTimers.get(roomId));
      }

      const timer = setTimeout(async () => {
        try {
          await Room.findOneAndUpdate(
            { roomId: roomId },
            {
              $set: {
                [`codeSnippets.${activeLanguage}`]: code,
                currentLanguage: activeLanguage,
              },
            },
            {upsert:true}
          );
          console.log(`Saved ${activeLanguage} code for room ${roomId} to MongoDB`);
        }catch(err){
          console.error("Database save error:", err);
        }
      }, 5000);

      saveTimers.set(roomId, timer);
    });

    // exceute code
    socket.on("compileCode", async ({code,roomId,language,input}) => {
      if (!rooms.has(roomId)) return;
      const room = rooms.get(roomId);

      const result = await executeCode({code,language,input});
      room.output = result.run.output;

      io.to(roomId).emit("codeResponse", result);
    });
 
    // chad msg
    socket.on("sendMessage", ({ roomId, msg }) => {
      if (!rooms.has(roomId)) return;
      const room = rooms.get(roomId);

      room.messages.push(msg);
      io.to(roomId).emit("newMessage", msg); 
    });

    // diconnectt
    socket.on("disconnect", () => {
      leaveRoom(io, socket);
      console.log("User disconnected");
    });
  });
};

// leave room
const leaveRoom = (io, socket) => {
  const {currentRoom,currentUser } = socket;
  if (currentRoom && currentUser && rooms.has(currentRoom)) {
    rooms.get(currentRoom).users.delete(currentUser);

    io.to(currentRoom).emit(
      "userList",
      Array.from(rooms.get(currentRoom).users)
    );

    socket.leave(currentRoom);
    console.log(`${currentUser} left room ${currentRoom}`);
  }
  socket.currentRoom = null;
  socket.currentUser = null;
};