import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/signup", async(req, res)=>{ 
  try {
    const {name,email,password} = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({message:"All fields are required"});
    }
    if (password.length<6) {
      return res.status(400).json({message:"Password must be at least 6 characters"});
    }

    const existingUser = await User.findOne({email});
    if (existingUser) {
      return res.status(409).json({message:"Email already registered"});
    }

    const hashP = await bcrypt.hash(password, 10);
    const newUser = await User.create({name,email,password:hashP });

    const token = jwt.sign(
      {userId:newUser._id,name:newUser.name},
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {id:newUser._id,name: newUser.name,email: newUser.email},
    });
  }catch(err){
    console.error(err);
    res.status(500).json({message:"Server error during signup"});
  }
});

router.post("/login", async(req, res)=>{
  try {
    const {email,password} = req.body;

    if (!email || !password) {
      return res.status(400).json({message:"Email and password are required"});
    }

    const user = await User.findOne({email});
    if (!user) {
      return res.status(401).json({message:"Invalid email or password" });
    }

    const isok = await bcrypt.compare(password, user.password);
    if (!isok) {
      return res.status(401).json({message:"Invalid email or password"});
    }

    const token = jwt.sign(
      {userId:user._id,name:user.name},
      process.env.JWT_SECRET,
      {expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {id:user._id,name:user.name,email:user.email},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
});
 
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({message:"User not found"});
    res.json({ user });
  } catch (err) {
    res.status(401).json({message:"Invalid or expired token"});
  }
});

export default router;