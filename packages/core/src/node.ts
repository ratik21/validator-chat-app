import { Libp2p as ILibp2p } from "libp2p";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { PeerManager } from "./lib/peer-manager.js";
import { createPeerIdFromName } from "./lib/peer-id.js";
import {PeerId} from "@libp2p/interface-peer-id";
import chalk from 'chalk';
import { PEER_ID_PATH } from './lib/constants.js';
import fs from "fs";
import { BeaconRestApiServer, beaconRestApiServerOpts, getApi } from "./api/index.js";
import { createLibp2pNode } from "./lib/libp2p.js";
import { Gossip } from "./lib/gossip.js";
import { NodeInitOpts } from "./types.js";
import { createMetrics } from "./metrics/metrics.js";
import { createLibp2pMetrics } from "./metrics/metrics/libp2p.js";
import { defaultMetricsServerOpts, HttpMetricsServer } from "./metrics/index.js";


export class P2PNode {
  node: ILibp2p;
  peerId: PeerId;
  peerManager: PeerManager;
  gossip: Gossip

  constructor() {}

  /**
   * Initializes a new (local) node
   * @param nodeInitOpts node initialization options (name, REST port & address)
   * @returns libp2p node instance
   */
  async initialize (nodeInitOpts: NodeInitOpts): Promise<ILibp2p> {
    fs.mkdirSync(PEER_ID_PATH, { recursive: true });

    // setup peerID
    this.peerId = await createPeerIdFromName(nodeInitOpts.name);

    // initialize libp2p node
    this.node = await createLibp2pNode(this.peerId);

    // initialize manager class & register handlers
    this.peerManager = new PeerManager(this.node);
    this.peerManager.onDiscover();
    this.peerManager.onConnect();
    this.peerManager.onDisconnect();

    // start libp2p node
    await this.node.start();

    // initialize Gossip class (handling pubsub related events and api's)
    this.gossip = new Gossip(this.node);

    console.log("\nā ", chalk.cyan('p2p Node Activated: ' + this.node.peerId.toString()) + " ā\n");
  
    // start rest api server
    const restApiOpts = { ...beaconRestApiServerOpts, ...nodeInitOpts.rest };
    const api = getApi({ rest: restApiOpts }, { gossip: this.gossip });
    const restApi = new BeaconRestApiServer(restApiOpts, {
      api,
    } as any);
    await restApi.listen();

    // start metrics server
    const metrics = createMetrics();
    const metricsServer = new HttpMetricsServer({ 
      port: defaultMetricsServerOpts.port, 
      address: defaultMetricsServerOpts.host
    }, {
      register: metrics.register
    })
    await metricsServer.start();
    createLibp2pMetrics(this.node, metrics.register);

    return this.node;
  }
}
