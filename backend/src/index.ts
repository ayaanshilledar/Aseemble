import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import authRoutes from "./modules/auth/auth.routes";
import roomRoutes from "./modules/room/room.route";
import { GameRoom } from "./realtime/rooms/GameRoom";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/room", roomRoutes);

const server = http.createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({ server })
});

// unique room id
gameServer
  .define("room", GameRoom)
  .filterBy(["roomId"]);

server.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});