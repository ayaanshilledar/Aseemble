import { Room, Client } from "colyseus";
import { GameState } from "../schema/GameState";
import { Player } from "../schema/Player";
import { Message } from "../schema/Message";
import { RoomObjectState } from "../schema/RoomObjectState";
import { prisma } from "../../config/prisma";
import { verifyToken } from "../../utils/jwt";

export class GameRoom extends Room<{ state: GameState }> {

  private dbRoomId!: string;

  async onCreate(options: any) {
    this.dbRoomId = options.roomId;

    const room = await prisma.room.findUnique({
      where: { id: this.dbRoomId }
    });

    if (!room || !room.isActive) {
      throw new Error("Room not found or inactive");
    }

    this.setState(new GameState());

    // Load existing objects from DB
    const objects = await prisma.roomObject.findMany({
      where: { roomId: this.dbRoomId }
    });

    objects.forEach((obj) => {
      const stateObj = new RoomObjectState();
      stateObj.id = obj.id;
      stateObj.objectType = obj.objectType;
      stateObj.internalId = obj.internalId;

      this.state.objects.set(obj.id, stateObj);
    });

    // Movement
    this.onMessage("move", (client, data: { x: number; y: number }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      player.x = data.x;
      player.y = data.y;
    });

    // Chat
    this.onMessage("chat", async (client, content: string) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      await prisma.chatMessage.create({
        data: {
          roomId: this.dbRoomId,
          userId: player.id,
          content
        }
      });

      const message = new Message();
      message.userId = player.id;
      message.content = content;

      this.state.messages.push(message);
    });

    // Add Object (owner/admin only)
    this.onMessage("addObject", async (client, data: any) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      if (player.role !== "owner" && player.role !== "admin") return;

      const obj = await prisma.roomObject.create({
        data: {
          roomId: this.dbRoomId,
          objectType: data.objectType,
          internalId: data.internalId
        }
      });

      const stateObj = new RoomObjectState();
      stateObj.id = obj.id;
      stateObj.objectType = obj.objectType;
      stateObj.internalId = obj.internalId;

      this.state.objects.set(obj.id, stateObj);
    });
  }

  async onJoin(client: Client, options: any) {
    const { userId } = verifyToken(options.token);

    const membership = await prisma.roomMember.findUnique({
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

    const room = await prisma.room.findUnique({
      where: { id: this.dbRoomId }
    });

    if (this.clients.length >= (room?.maxCapacity || 25)) {
      throw new Error("Room full");
    }

    const player = new Player();
    player.id = userId;
    player.role = membership.role;

    this.state.players.set(client.sessionId, player);

    // Load last 20 chat messages
    const history = await prisma.chatMessage.findMany({
      where: { roomId: this.dbRoomId },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    history.reverse().forEach((msg) => {
      const message = new Message();
      message.userId = msg.userId || "system";
      message.content = msg.content;

      this.state.messages.push(message);
    });
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }
}