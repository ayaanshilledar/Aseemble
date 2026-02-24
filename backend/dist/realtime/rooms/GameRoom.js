"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoom = void 0;
const colyseus_1 = require("colyseus");
const GameState_1 = require("../schema/GameState");
const Player_1 = require("../schema/Player");
const Message_1 = require("../schema/Message");
const RoomObjectState_1 = require("../schema/RoomObjectState");
const prisma_1 = require("../../config/prisma");
const jwt_1 = require("../../utils/jwt");
class GameRoom extends colyseus_1.Room {
    async onCreate(options) {
        this.dbRoomId = options.roomId;
        const room = await prisma_1.prisma.room.findUnique({
            where: { id: this.dbRoomId }
        });
        if (!room || !room.isActive) {
            throw new Error("Room not found or inactive");
        }
        this.setState(new GameState_1.GameState());
        // Load existing objects from DB
        const objects = await prisma_1.prisma.roomObject.findMany({
            where: { roomId: this.dbRoomId }
        });
        objects.forEach((obj) => {
            const stateObj = new RoomObjectState_1.RoomObjectState();
            stateObj.id = obj.id;
            stateObj.objectType = obj.objectType;
            stateObj.internalId = obj.internalId;
            this.state.objects.set(obj.id, stateObj);
        });
        // Movement
        this.onMessage("move", (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (!player)
                return;
            player.x = data.x;
            player.y = data.y;
        });
        // Chat
        this.onMessage("chat", async (client, content) => {
            const player = this.state.players.get(client.sessionId);
            if (!player)
                return;
            await prisma_1.prisma.chatMessage.create({
                data: {
                    roomId: this.dbRoomId,
                    userId: player.id,
                    content
                }
            });
            const message = new Message_1.Message();
            message.userId = player.id;
            message.content = content;
            this.state.messages.push(message);
        });
        // Add Object (owner/admin only)
        this.onMessage("addObject", async (client, data) => {
            const player = this.state.players.get(client.sessionId);
            if (!player)
                return;
            if (player.role !== "owner" && player.role !== "admin")
                return;
            const obj = await prisma_1.prisma.roomObject.create({
                data: {
                    roomId: this.dbRoomId,
                    objectType: data.objectType,
                    internalId: data.internalId
                }
            });
            const stateObj = new RoomObjectState_1.RoomObjectState();
            stateObj.id = obj.id;
            stateObj.objectType = obj.objectType;
            stateObj.internalId = obj.internalId;
            this.state.objects.set(obj.id, stateObj);
        });
    }
    async onJoin(client, options) {
        const { userId } = (0, jwt_1.verifyToken)(options.token);
        const membership = await prisma_1.prisma.roomMember.findUnique({
            where: {
                roomId_userId: {
                    roomId: this.dbRoomId,
                    userId
                }
            }
        });
        if (!membership) {
            throw new Error("Not a member of this room");
        }
        const room = await prisma_1.prisma.room.findUnique({
            where: { id: this.dbRoomId }
        });
        if (this.clients.length >= (room?.maxCapacity || 25)) {
            throw new Error("Room full");
        }
        const player = new Player_1.Player();
        player.id = userId;
        player.role = membership.role;
        this.state.players.set(client.sessionId, player);
        // Load last 20 chat messages
        const history = await prisma_1.prisma.chatMessage.findMany({
            where: { roomId: this.dbRoomId },
            orderBy: { createdAt: "desc" },
            take: 20
        });
        history.reverse().forEach((msg) => {
            const message = new Message_1.Message();
            message.userId = msg.userId || "system";
            message.content = msg.content;
            this.state.messages.push(message);
        });
    }
    onLeave(client) {
        this.state.players.delete(client.sessionId);
    }
}
exports.GameRoom = GameRoom;
