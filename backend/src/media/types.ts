import * as mediasoup from "mediasoup";

export type TransportMap = Map<string, mediasoup.types.WebRtcTransport>;
export type ProducerMap = Map<string, mediasoup.types.Producer>;
export type ConsumerMap = Map<string, mediasoup.types.Consumer>;

export interface PeerMediaData {
  id: string; // sessionId
  transports: TransportMap;
  producers: ProducerMap;
  consumers: ConsumerMap;
}