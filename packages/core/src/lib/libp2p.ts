import { Libp2p as ILibp2p } from "libp2p";
import {PeerId} from "@libp2p/interface-peer-id";
import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { mplex } from '@libp2p/mplex'
import { noise } from '@chainsafe/libp2p-noise'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { mdns } from '@libp2p/mdns'
import { webRTCStar } from "@libp2p/webrtc-star";
import wrtc from "@koush/wrtc";

export async function createLibp2pNode(peerId: PeerId): Promise<ILibp2p> {
  const star = webRTCStar({ wrtc: wrtc });
  return await createLibp2p({
    peerId,
    addresses: {
      listen: [
        '/ip4/0.0.0.0/tcp/0',
        //'/ip4/0.0.0.0/tcp/0/ws',
        // custom deployed webrtc-star signalling server
        //'/dns4/vast-escarpment-62759.herokuapp.com/tcp/443/wss/p2p-webrtc-star/',
        '/dns4/sheltered-mountain-08581.herokuapp.com/tcp/443/wss/p2p-webrtc-star/',
      ]
    },
    connectionManager: {
      // dialer config
      maxParallelDials: 100,
      maxAddrsToDial: 4,
      maxDialsPerPeer: 2,
      dialTimeout: 30_000,

      autoDial: true,

      // dos mitigation
      /**
       * The total number of connections allowed to be open at one time
       */
      maxConnections: 200,

      /**
        * If the number of open connections goes below this number, the node
        * will try to connect to nearby peers from the peer store
        */
      minConnections: 20,
  
      /**
        * How many connections can be open but not yet upgraded
        */
      maxIncomingPendingConnections: 10,

      /**
       * A remote peer may attempt to open up to this many connections per second,
       * any more than that will be automatically rejected
       */
      inboundConnectionThreshold: 5,

      /**
       * If the node transfers more than this amount of data in bytes/second
       * low value connections may be closed
       */
      maxData: 1024 * 1024,

      /**
       * If the node sends more than this amount of data in bytes/second
       * low value connections may be closed
       */
      maxSentData: 1024 * 1024,

      /**
       * If the node receives more than this amount of data in bytes/second
       * low value connections may be closed
       */
      maxReceivedData: 1024 * 1024,

      /**
       * If the event loop takes longer than this many ms to run,  low value
       * connections may be closed
       */
      maxEventLoopDelay: 1000
    },
    transports: [
      tcp(
        {
          /**
           * Inbound connections with no activity in this timeframe (ms) will be closed
           */
          inboundSocketInactivityTimeout: 30000,

          /**
           * Outbound connections with no activity in this timeframe (ms) will be closed
           */
          outboundSocketInactivityTimeout: 60000,

          /**
           * Once this many connections are open on this listener any further connections
           * will be rejected - this will have no effect if it is larger than the value
           * configured for the ConnectionManager maxConnections parameter
           */
          maxConnections: 200
        }
      ),
      star.transport
    ],
    streamMuxers: [
      // https://github.com/libp2p/js-libp2p/blob/master/doc/LIMITS.md#connection-limits
      mplex({
      /**
       * The total number of inbound protocol streams that can be opened on a given connection
       */
       maxInboundStreams: 256,

       /**
        * The total number of outbound protocol streams that can be opened on a given connection
        */
       maxOutboundStreams: 256,
 
       /**
        * How much incoming data to buffer before resetting the stream
        */
       maxStreamBufferSize: 4 * 256 * 1024,
 
       /**
        * Mplex does not support backpressure so to protect ourselves, if `maxInboundStreams` is
        * hit and the remote opens more than this many streams per second, close the connection
        */
       disconnectThreshold: 5
      })
    ],
    peerDiscovery: [
      mdns({
        interval: 1000
      }),
      star.discovery
    ],
    connectionEncryption: [
      noise()
    ],
    pubsub: gossipsub({
      allowPublishToZeroPeers: true,
      emitSelf: true,
      enabled: true
    }),
    nat: {
      enabled: false,
    },
    relay: {
      enabled: false,
      hop: {
        enabled: false,
        active: false,
      },
      advertise: {
        enabled: false,
        ttl: 0,
        bootDelay: 0,
      },
      autoRelay: {
        enabled: false,
        maxListeners: 0,
      },
    },
  });
}