"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const room_controller_1 = require("./room.controller");
const router = (0, express_1.Router)();
router.post("/create", room_controller_1.createRoomController);
exports.default = router;
