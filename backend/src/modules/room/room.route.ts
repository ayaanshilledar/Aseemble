import { validate } from "../../middleware/validate.middleware";
import { Router } from "express";
import { createRoomController,
    deleteRoomController,
    getRoomController,
    joinRoomController,
    leaveRoomController
 } from "./room.controller";
import { createRoomSchema,
    deleteRoomSchema,
    getRoomSchema,
    joinRoomSchema,
    leaveRoomSchema
 } from "./room.schema";

const router = Router();

router.post("/create", validate(createRoomSchema), createRoomController);
router.delete("/delete", validate(deleteRoomSchema), deleteRoomController);
router.get("/:id", validate(getRoomSchema), getRoomController);
router.post("/join", validate(joinRoomSchema), joinRoomController);
router.delete("/leave", validate(leaveRoomSchema), leaveRoomController);


export default router;