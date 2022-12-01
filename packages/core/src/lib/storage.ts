import { Libp2p as ILibp2p } from "libp2p";

/**
 * Class to handle data of libp2p (persisting data through hypercore append only logs)
 */
export class Store {
  protected libp2p: ILibp2p;

  /**
   * Initializes zchain-db (hypercore append only log)
   * @param libp2p libp2p node
   */
  constructor (libp2p: ILibp2p) {
  }
}
