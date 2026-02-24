import * as mediasoup from "mediasoup";

export let worker: mediasoup.types.Worker;

export const initMediasoupWorker = async () => {

  worker = await mediasoup.createWorker({
    rtcMinPort: 40000,
    rtcMaxPort: 40100
  });

  worker.on("died", () => {
    console.error("Mediasoup worker died");
    process.exit(1);
  });

  console.log("Mediasoup Worker started");
};