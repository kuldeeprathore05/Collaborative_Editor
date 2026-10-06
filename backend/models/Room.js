import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomId: {type: String, required:true,unique: true},
    currentLanguage: {type:String, default: "cpp" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }, 
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
  },
  {timestamps:true}
);

export default mongoose.model("Room", roomSchema);