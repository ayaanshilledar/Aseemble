import { worker } from "./worker";
import * as mediasoup from "mediasoup";

class SFUManager {

  private routers = new Map<string, mediasoup.types.Router>();

  async getRouter(roomId: string) {

    if (this.routers.has(roomId)) {
      return this.routers.get(roomId);
    }

    const router = await worker.createRouter({
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

    this.routers.set(roomId, router);

    return router;
  }
}

export const sfuManager = new SFUManager();