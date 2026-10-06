
Readme · MD
# Real-Time Collaborative Code Editor
 
A browser-based code editor where multiple users can write, run, and discuss code together in real time. Users join shared rooms, see each other's edits and cursors as they happen, chat alongside the editor, and execute code in multiple languages with custom input. Work is saved automatically to MongoDB so nothing is lost when a session ends.
 
## Features
 
- **Real-time collaboration.** Edits are synchronized across all users in a room using Socket.io with minimal latency.
- **Live cursor tracking.** Each participant's cursor and selection is shown to others, labeled by username.
- **Multi-language code execution.** Run code in several languages through an online compiler API, with support for custom stdin and viewing stdout/stderr.
- **Room-based sessions.** Create or join a room with a room ID; state and participants are isolated per room.
- **Integrated chat.** Per-room messaging so collaborators can discuss code without leaving the editor.
- **Auto-save.** Code files are persisted to MongoDB automatically, debounced to avoid excessive writes.
- **Secure authentication.** JWT-based sessions with bcrypt-hashed passwords.
- **Monaco Editor.** The same editor core that powers VS Code, with syntax highlighting, bracket matching, and multi-language support.
## Tech Stack
 
| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Frontend       | React, Monaco Editor                    |
| Backend        | Node.js, Express.js                     |
| Real-time      | Socket.io                               |
| Database       | MongoDB (Mongoose)                      |
| Auth           | JSON Web Tokens, bcrypt                 |
| Code execution | Online Compiler API (REST)              |
 
## Architecture  
- The REST API handles registration, login, file CRUD, and code execution requests.
- The Socket.io server manages rooms and broadcasts code changes, cursor positions, and chat messages to everyone in the same room.
- Socket connections are authenticated with the same JWT used for REST calls.
- Code execution requests are proxied through the backend so the compiler API key is never exposed to the client.