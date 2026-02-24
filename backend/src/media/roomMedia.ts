import * as mediasoup from "mediasoup";
import { worker } from "./worker";
import { Peer } from "./peer";

export class RoomMedia {

  public roomId: string;
  public router!: mediasoup.types.Router;
  private peers = new Map<string, Peer>();

  constructor(roomId: string) {
    this.roomId = roomId;
  }

  async init() {
    this.router = await worker.createRouter({
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000
        }
      ]
    });
  }

  getRtpCapabilities() {
    return this.router.rtpCapabilities;
  }

  addPeer(peerId: string) {
    const peer = new Peer(peerId);
    this.peers.set(peerId, peer);
    return peer;
  }

  getPeer(peerId: string) {
    return this.peers.get(peerId);
  }

  removePeer(peerId: string) {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.close();
      this.peers.delete(peerId);
    }
  }

  async createWebRtcTransport() {
    const transport = await this.router.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0", announcedIp: undefined }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true
    });

    return transport;
  }
}