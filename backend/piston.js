import axios from "axios";
 
const COMPILER_MAP = {
  javascript: "typescript-deno", 
  python: "python-3.14",
  cpp: "g++-15",
  java: "openjdk-25",
  rust: "rust-1.93",
  go: "go-1.26"
};

export const executeCode = async ({code,language,input})=>{
  try {
    const compiler = COMPILER_MAP[language] || "typescript-deno";

    const response = await axios.post(
      "https://api.onlinecompiler.io/api/run-code-sync/",
      {
        compiler: compiler,
        code: code,
        input: input || "",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.ONLINE_COMPILER_API_KEY,
        },
      }
    );

    const {output,error} = response.data; 
    let finalOutput = "";
    if (error && error.trim() !== "") {
      finalOutput = output ? `${output}\n${error}` : error;
    } else {
      finalOutput = output || "Program executed successfully (no output generated).";
    }
 
    return {run:{output:finalOutput}};

  } catch (err) {
    console.error("OnlineCompiler API Error:", err.response?.data || err.message);
    return { 
      run: { 
        output: "Execution error. check your backend API key or network connection." 
      } 
    };
  }
};