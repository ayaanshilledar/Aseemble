import { Room, Client } from "colyseus";
import jwt from "jsonwebtoken";
import { GameState } from "../schema/GameState";
import { Player } from "../schema/Player";

export class GameRoom extends Room<{ state: GameState }>{

  onCreate() {
    this.setState(new GameState());

    this.onMessage("move", (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      player.x = data.x;
      player.y = data.y;
    });
  }

  onJoin(client: Client, options: any) {
    try {
      const decoded: any = jwt.verify(options.token, "secret");

      const player = new Player();
      player.id = decoded.userId;

      this.state.players.set(client.sessionId, player);

    } catch {
      throw new Error("Unauthorized");
    }
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }
}