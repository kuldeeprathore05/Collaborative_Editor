import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomId: {type: String, required:true,unique: true},
  currentLanguage: {type:String, default: "cpp" },
   
  codeSnippets:{
    type: Map,
    of: String,  
    default: {
      javascript: "// start coding in JavaScript...",
      python: "# start coding in Python...",
      cpp: "// start coding in C++...",
      java: "// start coding in Java..."
    }
  }
});

export default mongoose.model("Room", roomSchema);