import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import Room from "../models/Room.js";

const router = express.Router();
 
router.get("/my-rooms",protectRoute,async (req, res) => {
  try {
    const rooms = await Room.find({createdBy:req.userId }).sort({updatedAt:-1});
    res.json({rooms});
  } catch (err) {
    res.status(500).json({message: "Server error fetching rooms"});
  }
});
 
router.post("/create",protectRoute,async(req,res)=>{
  try{
    const {roomId} = req.body;
    const existing = await Room.findOne({roomId});
    if (existing) return res.status(409).json({ message:"Room ID already exists"});

    const room = await Room.create({roomId,createdBy:req.userId});
    res.status(201).json({room });
  } catch (err) {
    res.status(500).json({message:"Server error creating room" });
  }
});

export default router;