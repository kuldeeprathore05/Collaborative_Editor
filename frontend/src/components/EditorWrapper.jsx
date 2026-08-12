import Editor from "@monaco-editor/react";

const EditorWrapper = ({ code, language, handleCodeChange }) => {
  return (
    <div className="h-full w-full bg-[#0d0f16]">
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={handleCodeChange}
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

