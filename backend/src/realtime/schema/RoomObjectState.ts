import { Schema, type } from "@colyseus/schema";

export class RoomObjectState extends Schema {
  @type("string") id!: string;
  @type("string") objectType!: string;
  @type("string") internalId!: string;
}