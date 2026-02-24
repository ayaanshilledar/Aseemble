import { Router } from "express";
import { createRoomController } from "./room.controller";

const router = Router();

router.post("/create", createRoomController);

export default router;