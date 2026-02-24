"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const colyseus_1 = require("colyseus");
const ws_transport_1 = require("@colyseus/ws-transport");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const room_route_1 = __importDefault(require("./modules/room/room.route"));
const GameRoom_1 = require("./realtime/rooms/GameRoom");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/auth", auth_routes_1.default);
app.use("/room", room_route_1.default);
const server = http_1.default.createServer(app);
const gameServer = new colyseus_1.Server({
    transport: new ws_transport_1.WebSocketTransport({ server })
});
// unique room id
gameServer
    .define("room", GameRoom_1.GameRoom)
    .filterBy(["roomId"]);
server.listen(4000, () => {
    console.log("Server running on http://localhost:4000");
});
