import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { Player } from "./Player";
import { Message } from "./Message";
import { RoomObjectState } from "./RoomObjectState";

export class GameState extends Schema {

  @type("string")
  roomName: string = "";

  @type("number")
  maxCapacity: number = 25;

  @type("boolean")
  isLocked: boolean = false;

  @type({ map: Player })
  players = new MapSchema<Player>();

  @type({ map: RoomObjectState })
  objects = new MapSchema<RoomObjectState>();

  @type([Message])
  messages = new ArraySchema<Message>();

}