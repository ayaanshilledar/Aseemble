import { Router } from "express";
import { createRoomController, deleteRoomController, getRoomController } from "./room.controller";
import { validate } from "../../middleware/validate.middleware";
import { createRoomSchema, deleteRoomSchema, getRoomSchema } from "./room.schema";

const router = Router();

router.post("/create", validate(createRoomSchema), createRoomController);
router.delete("/delete", validate(deleteRoomSchema), deleteRoomController);
router.get("/:id", validate(getRoomSchema), getRoomController);
export default router;