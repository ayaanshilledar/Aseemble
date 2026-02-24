import { Router } from "express";
import { createRoomController, deleteRoomController } from "./room.controller";
import { validate } from "../../middleware/validate.middleware";
import { createRoomSchema , deleteRoomSchema} from "./room.schema";

const router = Router();

router.post("/create", validate(createRoomSchema), createRoomController);
router.delete("/delete", validate(deleteRoomSchema), deleteRoomController);
export default router;