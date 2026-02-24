import { Router } from "express";
import { createRoomController } from "./room.controller";
import { validate } from "../../middleware/validate.middleware";
import { createRoomSchema } from "./room.schema";

const router = Router();

router.post("/create", validate(createRoomSchema), createRoomController);

export default router;