import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") id!: string;
  @type("string") role!: string;
  @type("boolean") isMuted: boolean = false;
  @type("boolean") isCameraOff: boolean = false;
  @type("boolean") isHandRaised: boolean = false;
  @type("number") x: number = 200;
  @type("number") y: number = 200;
}