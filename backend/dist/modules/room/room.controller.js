"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoomController = void 0;
const room_service_1 = require("./room.service");
const createRoomController = async (req, res) => {
    const room = await (0, room_service_1.createRoom)(req.body);
    res.json(room);
};
exports.createRoomController = createRoomController;
