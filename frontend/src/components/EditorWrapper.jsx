import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import {
  Awareness,
  encodeAwarenessUpdate,
  applyAwarenessUpdate,
  removeAwarenessStates,
} from "y-protocols/awareness";

const PALETTE = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee", "#60a5fa", "#a78bfa", "#f472b6"];
const colorFor = (s = "") => {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
};
const safeName = (n = "User") => String(n).replace(/[^\w .-]/g, "").slice(0, 20);

const EditorWrapper = ({ language, handleCodeChange, socket, user }) => {
  const [editor, setEditor] = useState(null);
  const [session, setSession] = useState(null); // { ydoc, awareness }

  // 1. create the Yjs doc + awareness and wire them to the socket
  useEffect(() => {
    const ydoc = new Y.Doc();
    const awareness = new Awareness(ydoc);
    awareness.setLocalStateField("user", {
      name: safeName(user?.name),
      color: colorFor(user?.name),
    });

    const toU8 = (d) => new Uint8Array(d);
    const sendMyAwareness = () =>
      socket.emit("awarenessUpdate", {
        clientID: ydoc.clientID,
        update: encodeAwarenessUpdate(awareness, [ydoc.clientID]),
      });

    const onDocUpdate = (update, origin) => {
      if (origin !== "remote") socket.emit("yjsUpdate", update);
    };
    const onAwarenessChange = (_c, origin) => {
      if (origin !== "remote") sendMyAwareness();
    };
    const onRemoteDoc = (u) => Y.applyUpdate(ydoc, toU8(u), "remote");

    const onSync = (u) => {
        const serverUpdate = toU8(u);
        Y.applyUpdate(ydoc, serverUpdate, "remote");
        // send back only what the server doesn't have (offline edits)
        socket.emit(
          "yjsUpdate",
          Y.encodeStateAsUpdate(ydoc, Y.encodeStateVectorFromUpdate(serverUpdate))
        );
        sendMyAwareness(); // re-announce my cursor/name
    };
    const onRemoteAwareness = (u) => applyAwarenessUpdate(awareness, toU8(u), "remote");
    const onAwarenessRemove = (id) => removeAwarenessStates(awareness, [id], "remote");

    ydoc.on("update", onDocUpdate);
    awareness.on("update", onAwarenessChange);
    socket.on("yjsSync", onSync);
    socket.on("yjsUpdate", onRemoteDoc);
    socket.on("awarenessUpdate", onRemoteAwareness);
    socket.on("awarenessRemove", onAwarenessRemove);
    socket.on("awarenessQuery", sendMyAwareness);

    // per-user cursor colors / name tags
    const styleEl = document.createElement("style");
    document.head.appendChild(styleEl);
    const renderStyles = () => {
      let css = "";
      awareness.getStates().forEach((state, id) => {
        if (id === ydoc.clientID || !state.user) return;
        const color = /^#[0-9a-f]{6}$/i.test(state.user.color) ? state.user.color : "#999999";
        const name = safeName(state.user.name);
        css += `
          .yRemoteSelection-${id} { background-color: ${color}40; }
          .yRemoteSelectionHead-${id} {
            position: absolute; border-left: 2px solid ${color};
            height: 100%; box-sizing: border-box;
          }
          .yRemoteSelectionHead-${id}::after {
            content: "${name}"; position: absolute; bottom: 100%; left: -2px;
            background: ${color}; color: #000; font-size: 10px; line-height: 1.3;
            padding: 0 4px; white-space: nowrap; border-radius: 3px 3px 3px 0; z-index: 10;
          }`;
      });
      styleEl.textContent = css;
    };
    awareness.on("change", renderStyles);

    setSession({ ydoc, awareness });

    return () => {
      socket.off("yjsSync", onSync);
      socket.off("yjsUpdate", onRemoteDoc);
      socket.off("awarenessUpdate", onRemoteAwareness);
      socket.off("awarenessRemove", onAwarenessRemove);
      socket.off("awarenessQuery", sendMyAwareness);
      styleEl.remove();
      awareness.destroy();
      ydoc.destroy();
      setSession(null);
    };
  }, [socket, user?.name]);

  // 2. bind the Monaco model to the Y.Text of the current language
  useEffect(() => {
    if (!editor || !session) return;
    const ytext = session.ydoc.getText(language);
    const binding = new MonacoBinding(ytext, editor.getModel(), new Set([editor]), session.awareness);
    return () => binding.destroy();
  }, [editor, session, language]);

  return (
    <div className="h-full w-full bg-[#0d0f16]">
      <Editor
        height="100%"
        language={language}
        onChange={(v) => handleCodeChange?.(v ?? "")}
        onMount={(ed) => setEditor(ed)}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          padding: { top: 10 },
          wordWrap: "on",
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
};

export default EditorWrapper;