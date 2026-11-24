import * as Y from "yjs";
import { executeCode } from "./piston.js";
import Room from "./models/Room.js";
import { verifySocketToken } from "./middleware/authMiddleware.js";

const LANGS = ["javascript", "python", "cpp", "java"];
const rooms = new Map();       // roomId -> Promise<room>   (promise avoids the cold-start join race)
const saveTimers = new Map();

const userList = (room) => [...new Set(room.users.values())];

const saveRoom = async (roomId, room) => {
  const $set = {
    currentLanguage: room.language,
    ydoc: Buffer.from(Y.encodeStateAsUpdate(room.doc)),
  };
  for (const l of LANGS) $set[`codeSnippets.${l}`] = room.doc.getText(l).toString(); // keep for the dashboard / fallback
  try {
    await Room.updateOne({ roomId }, { $set });
  } catch (err) {
    console.error("Database save error:", err);
  }
};

const scheduleSave = (roomId, room) => {
  clearTimeout(saveTimers.get(roomId));
  saveTimers.set(roomId, setTimeout(() => saveRoom(roomId, room), 3000));
};

const getRoom = (roomId) => {
  if (!rooms.has(roomId)) {
    const p = (async () => {
      const doc = new Y.Doc();
      let language = "javascript";
      let snippets = null;
      let state = null;
      try {
        const dbRoom = await Room.findOne({ roomId });
        if (dbRoom) {
          language = dbRoom.currentLanguage || "javascript";
          snippets = dbRoom.codeSnippets;
          state = dbRoom.ydoc;
        }
      } catch (err) {
        console.error("Error fetching room:", err);
      }

      if (state?.length) {
        Y.applyUpdate(doc, new Uint8Array(state));
      } else {
        doc.transact(() => {
          for (const l of LANGS) {
            doc.getText(l).insert(0, snippets?.get?.(l) ?? `// start coding in ${l}...`);
          }
        });
      }
      const room = { doc, language, users: new Map(), messages: [] };
      doc.on("update", () => scheduleSave(roomId, room));   // registered after hydration
      return room;
    })();
    p.catch(() => rooms.delete(roomId));
    rooms.set(roomId, p);
  }
  return rooms.get(roomId);
};

export const handleSocketEvents = (io) => {
  io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    socket.on("join", async ({ roomId, token }) => {
      const payload = verifySocketToken(token);          // identity comes from the token, not the client
      if (!payload || !roomId) return socket.emit("authError");

      if (socket.currentRoom) await leaveRoom(io, socket);
      socket.currentRoom = roomId;
      socket.currentUser = payload.name;
      socket.join(roomId);

      const room = await getRoom(roomId);
      room.users.set(socket.id, payload.name);

      io.to(roomId).emit("userList", userList(room));
      socket.emit("languageUpdate", room.language);
      socket.emit("yjsSync", Y.encodeStateAsUpdate(room.doc));   // full state for the joiner
      socket.emit("chatHistory", room.messages);
      socket.to(roomId).emit("awarenessQuery");                    // ask others to re-send their cursors
    });

    // document operations (binary Yjs updates)
    socket.on("yjsUpdate", async (update) => {
      const roomId = socket.currentRoom;
      if (!roomId) return;
      const room = await getRoom(roomId);
      Y.applyUpdate(room.doc, new Uint8Array(update), socket.id);
      socket.to(roomId).emit("yjsUpdate", update);
    });

    // cursors / selections / names (ephemeral)
    socket.on("awarenessUpdate", ({ update, clientID }) => {
      const roomId = socket.currentRoom;
      if (!roomId) return;
      socket.awarenessId = clientID;
      socket.to(roomId).emit("awarenessUpdate", update);
    });

    socket.on("languageChange", async ({ language }) => {
      const roomId = socket.currentRoom;
      if (!roomId || !LANGS.includes(language)) return;
      const room = await getRoom(roomId);
      room.language = language;
      io.to(roomId).emit("languageUpdate", language);
      scheduleSave(roomId, room);
    });

    socket.on("compileCode", async ({ input }) => {
      const roomId = socket.currentRoom;
      if (!roomId) return;
      const room = await getRoom(roomId);
      const code = room.doc.getText(room.language).toString();   // server's authoritative copy
      const result = await executeCode({ code, language: room.language, input });
      io.to(roomId).emit("codeResponse", result);
    });

    socket.on("sendMessage", async ({ msg }) => {
      const roomId = socket.currentRoom;
      if (!roomId || !msg?.text) return;
      const room = await getRoom(roomId);
      const m = { text: String(msg.text).slice(0, 2000), user: socket.currentUser }; // can't impersonate
      room.messages.push(m);
      io.to(roomId).emit("newMessage", m);
    });

    socket.on("leaveRoom", () => leaveRoom(io, socket));
    socket.on("disconnect", () => leaveRoom(io, socket));
  });
};

const leaveRoom = async (io, socket) => {
  const roomId = socket.currentRoom;
  socket.currentRoom = null;
  socket.currentUser = null;
  if (!roomId) return;

  socket.leave(roomId);
  const p = rooms.get(roomId);
  if (p) {
    const room = await p;
    room.users.delete(socket.id);
    io.to(roomId).emit("userList", userList(room));
  }
  if (socket.awarenessId != null) {
    const id = socket.awarenessId;
    socket.awarenessId = null;

    // don't remove if a newer socket from the same client is already in the room
    const members = io.sockets.adapter.rooms.get(roomId) ?? new Set();
    const stillPresent = [...members].some(
      (sid) => io.sockets.sockets.get(sid)?.awarenessId === id
    );
    if (!stillPresent) io.to(roomId).emit("awarenessRemove", id);
  }
};