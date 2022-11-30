import * as Y from 'yjs';

export interface MessageWithPubKey {
  message: string,
  publicKey: string
}

// typescript interface definition
export interface ChatMessage {
  /**
  * Timestamp
  */
  timestamp: number;
  /**
  * Message contents, utf-8 encoded
  *
  * Max length: 100KB
  */
  body: Uint8Array;
}

// user facing message
export interface Message {
  message: {
    timestamp: number,
    body: string
  },
  from: string, // peerId
  pubkey: Uint8Array // validator public key
}

export interface SignedChatMessage {
  message: ChatMessage;
  
  // todo: need to run the beacon node, and query the beacon state to get the validator
  // index from the public key using @lodestar/api
  // validatorIndex: number;

  pubkey: Uint8Array;
  signature: Uint8Array;
}

export interface NodeInitOpts {
  name: string,
  rest: {
    port: number
    address: string
  }
}

export interface PubSubMessage {
  topicIDs: string[]
  from: string
  data: Buffer | Uint8Array
  seqno: Buffer | Uint8Array
  signature: Buffer | Uint8Array
  key: Buffer | Uint8Array
  receivedFrom: string
}