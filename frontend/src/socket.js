import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  autoConnect: false, // we'll connect manually once we have a token
});

export default socket;