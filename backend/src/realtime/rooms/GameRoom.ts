import { Room, Client } from "colyseus";
import { GameState } from "../schema/GameState";
import { Player } from "../schema/Player";
import { Message } from "../schema/Message";
import { RoomObjectState } from "../schema/RoomObjectState";
import { prisma } from "../../config/prisma";
import { verifyToken } from "../../utils/jwt";
import { RoomMedia } from "../../media/roomMedia";

export class GameRoom extends Room<{ state: GameState }> {

  private dbRoomId!: string;
  private media!: RoomMedia;


  async onCreate(options: any) {
    try {
      this.dbRoomId = options.roomId;
      if (!this.dbRoomId) {
        throw new Error("No roomId provided");
      }

      const room = await prisma.room.findUnique({
        where: { id: this.dbRoomId }
      });

      this.media = new RoomMedia(this.dbRoomId);
      await this.media.init();

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

      this.registerMessageHandlers();
    } catch (error) {
      console.error("[Room.onCreate]", error);
      throw error; // Colyseus will handle this and reject room creation
    }
  }

  private registerMessageHandlers() {
    // Movement
    this.onMessage("move", (client, data: { x: number; y: number }) => {
      try {
        if (typeof data.x !== "number" || typeof data.y !== "number") return;

        const player = this.state.players.get(client.sessionId);
        if (!player) return;

        player.x = data.x;
        player.y = data.y;
      } catch (error) {
        console.error("[Room.onMessage:move]", error);
      }
    });

    // Chat
    this.onMessage("chat", async (client, content: string) => {
      try {
        if (!content || typeof content !== "string" || content.trim().length === 0) return;

        const player = this.state.players.get(client.sessionId);
        if (!player) return;

        await prisma.chatMessage.create({
          data: {
            roomId: this.dbRoomId,
            userId: player.id,
            content: content.substring(0, 500)
          }
        });

        const message = new Message();
        message.userId = player.id;
        message.content = content.substring(0, 500);

        this.state.messages.push(message);


        if (this.state.messages.length > 50) {
          this.state.messages.shift();
        }
      } catch (error) {
        console.error("[Room.onMessage:chat]", error);
      }
    });

    // Add Object (owner/admin only)
    this.onMessage("addObject", async (client, data: any) => {
      try {
        const player = this.state.players.get(client.sessionId);
        if (!player) return;

        if (player.role !== "owner" && player.role !== "admin") {
          client.send("error", { message: "Unauthorized to add objects" });
          return;
        }

        if (!data.objectType || !data.internalId) return;

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
      } catch (error) {
        console.error("[Room.onMessage:addObject]", error);
        client.send("error", { message: "Failed to add object" });
      }
    });

    // --- Meeting Handlers ---

    // Toggle Mic State
    this.onMessage("toggleMic", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (player) player.isMuted = !player.isMuted;
    });

    // Toggle Camera State
    this.onMessage("toggleCamera", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (player) player.isCameraOff = !player.isCameraOff;
    });

    // Raise/Lower Hand
    this.onMessage("toggleHand", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (player) player.isHandRaised = !player.isHandRaised;
    });

    // --- Host Controls (Owner/Admin only) ---

    // Lock/Unlock Room
    this.onMessage("toggleLock", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (player?.role === "owner" || player?.role === "admin") {
        this.state.isLocked = !this.state.isLocked;
      }
    });

    // Kick Participant
    this.onMessage("kickPlayer", (client, targetSessionId: string) => {
      const host = this.state.players.get(client.sessionId);
      if (host?.role === "owner" || host?.role === "admin") {
        const targetClient = this.clients.find(c => c.sessionId === targetSessionId);
        if (targetClient) targetClient.leave();
      }
    });

    // --- WebRTC Signaling Handlers ---

    // 1️⃣ Get Router RTP Capabilities
    this.onMessage("getRtpCapabilities", (client: Client, _) => {
      return this.media.getRtpCapabilities();
    });

    // 2️⃣ Create Transport
    this.onMessage("createTransport", async (client: Client, _) => {
      try {
        const peer = this.media.getPeer(client.sessionId);
        const transport = await this.media.createWebRtcTransport();
        peer?.addTransport(transport);

        return {
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters
        };
      } catch (error) {
        console.error("[Room.onMessage:createTransport]", error);
        return { error: "Failed to create transport" };
      }
    });

    // 3️⃣ Produce (Send media)
    this.onMessage("produce", async (client: Client, data: any) => {
      try {
        const peer = this.media.getPeer(client.sessionId);
        const transport = peer?.getTransport(data.transportId);

        if (!transport) {
          return { error: "Transport not found" };
        }

        const producer = await transport.produce({
          kind: data.kind,
          rtpParameters: data.rtpParameters
        });

        peer?.addProducer(producer);

        return { id: producer.id };
      } catch (error) {
        console.error("[Room.onMessage:produce]", error);
        return { error: "Failed to produce media" };
      }
    });

    // 4️⃣ Consume (Receive media)
    this.onMessage("consume", async (client: Client, data: any) => {
      try {
        if (!this.media.router.canConsume({
          producerId: data.producerId,
          rtpCapabilities: data.rtpCapabilities
        })) {
          return { error: "Cannot consume" };
        }

        const peer = this.media.getPeer(client.sessionId);
        const transport = peer?.getTransport(data.transportId);

        if (!transport) {
          return { error: "Transport not found" };
        }

        const consumer = await transport.consume({
          producerId: data.producerId,
          rtpCapabilities: data.rtpCapabilities,
          paused: false
        });

        peer?.addConsumer(consumer);

        return {
          id: consumer.id,
          producerId: data.producerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters
        };
      } catch (error) {
        console.error("[Room.onMessage:consume]", error);
        return { error: "Failed to consume media" };
      }
    });
  }

  async onJoin(client: Client, options: any) {
    try {
      if (!options.token) {
        throw new Error("Authentication token required");
      }

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

      if (this.state.isLocked) {
        throw new Error("Room is locked by host");
      }

      const player = new Player();
      player.id = userId;
      player.role = membership.role;

      this.media.addPeer(client.sessionId);
      this.state.players.set(client.sessionId, player);


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
    } catch (error: any) {
      console.error("[Room.onJoin]", error.message);
      throw error;
    }
  }


  onLeave(client: Client) {
    this.media.removePeer(client.sessionId);
    this.state.players.delete(client.sessionId);
  }

}