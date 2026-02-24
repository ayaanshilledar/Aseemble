import { Request, Response } from "express";
import { createRoom } from "./room.service";

export const createRoomController = async(req: Request, res: Response)=>{
    const room = await createRoom(req.body);
    res.json(room);
};

