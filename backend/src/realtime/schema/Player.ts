import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") id!: string;
  @type("string") role!: string;
  @type("number") x: number = 200;
  @type("number") y: number = 200;
}