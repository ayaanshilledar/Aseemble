
import { worker, initMediasoupWorker } from "./src/media/worker";
import { RoomMedia } from "./src/media/roomMedia";

async function runTest() {
    try {
        console.log("Initializing Mediasoup Worker...");
        await initMediasoupWorker();
        console.log("Worker initialized.");

        const roomId = "test-room";
        const roomMedia = new RoomMedia(roomId);

        console.log("Initializing RoomMedia...");
        await roomMedia.init();
        console.log("RoomMedia initialized.");

        const caps = roomMedia.getRtpCapabilities();
        console.log("RTP Capabilities received:", !!caps);

        const peerId = "peer-1";
        const peer = roomMedia.addPeer(peerId);
        console.log("Peer added:", peer.id === peerId);

        console.log("Creating Transport...");
        const transport = await roomMedia.createWebRtcTransport();
        peer.addTransport(transport);
        console.log("Transport created and added to peer.");

        console.log("Test passed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
}

runTest();
