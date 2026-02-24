import * as mediasoup from "mediasoup";
import { PeerMediaData } from "./types";

export class Peer {

  public id: string;
  public transports = new Map<string, mediasoup.types.WebRtcTransport>();
  public producers = new Map<string, mediasoup.types.Producer>();
  public consumers = new Map<string, mediasoup.types.Consumer>();

  constructor(id: string) {
    this.id = id;
  }

  addTransport(transport: mediasoup.types.WebRtcTransport) {
    this.transports.set(transport.id, transport);
  }

  getTransport(id: string) {
    return this.transports.get(id);
  }

  addProducer(producer: mediasoup.types.Producer) {
    this.producers.set(producer.id, producer);
  }

  addConsumer(consumer: mediasoup.types.Consumer) {
    this.consumers.set(consumer.id, consumer);
  }

  close() {
    this.transports.forEach(t => t.close());
    this.producers.forEach(p => p.close());
    this.consumers.forEach(c => c.close());

    this.transports.clear();
    this.producers.clear();
    this.consumers.clear();
  }
}