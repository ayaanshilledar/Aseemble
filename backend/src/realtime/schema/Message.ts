import { Schema, type } from "@colyseus/schema";

export class Message extends Schema {
  @type("string") userId!: string;
  @type("string") content!: string;
}