"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = void 0;
const prisma_1 = require("../../config/prisma");
const createRoom = async ({ name, ownerId }) => {
    return prisma_1.prisma.room.create({
        data: {
            name,
            ownerId
        }
    });
};
exports.createRoom = createRoom;
