import { PubSub } from "@libp2p/interface-pubsub";
import {Libp2p as ILibp2p} from "libp2p";
import {PeerId} from "@libp2p/interface-peer-id";
import { DOMAIN_CHAT_MESSAGE, MESSAGE_MAX_LEN, VALIDATOR_CHATROOM_TOPIC } from "./constants.js";
import { ChatMessage, Message, MessageWithPubKey, SignedChatMessage } from "../types.js";
import { getBLSSecretKey } from "./utils.js";
import {ByteListType, ByteVectorType, ContainerType, UintNumberType} from "@chainsafe/ssz";
import {computeSigningRoot} from "@lodestar/state-transition";
import {fromHexString} from "@chainsafe/ssz";
import bls from "@chainsafe/bls";

export const ChatMessageSSZ = new ContainerType(
  {
    timestamp: new UintNumberType(8),
    body: new ByteListType(100000),
  },
  {typeName: "ChatMessage"}
);

export const SignedChatMessageSSZ = new ContainerType(
  {
    message: ChatMessageSSZ,
    //validatorIndex: new UintNumberType(8),
    pubkey: new ByteVectorType(48), // extra bytes but don't need to query beacon api
    signature: new ByteVectorType(96),
  },
  {typeName: "SignedChatMessage"}
);

/**
 * Class to Handle gossip functionalites of the p2p chat app
 * eg. subscribe/unsubscribe to topic 
 * TODO: add validation Queue to prevent DDOS (a node can keep sending many messages)
 */
export class Gossip {
  private peerId: PeerId
  private pubsub: PubSub;
  private messages: Message[] // we can also persist permanently using a local db (maybe level-db?)

  constructor (node: ILibp2p) {
    this.peerId = node.peerId;
    this.pubsub = node.pubsub;
    this.messages = [];

    // subscribe to the validator chatroom topic
    const topics = node.pubsub.getTopics();
    if (!topics.includes(VALIDATOR_CHATROOM_TOPIC)) {
      this.pubsub.subscribe(VALIDATOR_CHATROOM_TOPIC);
    }
    this.listenToIncomingValidatorMessages();
  }
  
  /**
   * Publishes a new message to the network
   * + fetch secret key from the imported keystores
   * + validates message length
   * + sign message
   * + attach signature & send message
   * @param msgWithPubKey contains message & pubkey string
   */
  async publishMessageToValidators(msgWithPubKey: MessageWithPubKey): Promise<void> {
    const pubKey = msgWithPubKey.publicKey;
    const secretKey = await getBLSSecretKey(pubKey);

    // ques: can this be a dos vector (computing length of an infinitely large message)?
    const messageBytes = new Uint8Array(Buffer.from(msgWithPubKey.message));
    if (messageBytes.length > MESSAGE_MAX_LEN) {
      throw new Error("Max 100kb message is allowed");
    }

    // compute signing root & signature
    const chatMessage: ChatMessage = {
      timestamp: Math.floor((new Date()).getTime() / 1000),
      body: messageBytes
    };
    const signingRoot = computeSigningRoot(ChatMessageSSZ, chatMessage, DOMAIN_CHAT_MESSAGE);
    const signature = secretKey.sign(signingRoot).toBytes();

    // serialize & publish signed message
    const signedChatMessage: SignedChatMessage = {
      message: chatMessage,
      pubkey: fromHexString(pubKey),
      //validatorIndex: 1, // todo
      signature
    }

    const sszType = SignedChatMessageSSZ;
    const messageData = (sszType.serialize as (object: SignedChatMessage) => Uint8Array)(signedChatMessage);
    const result = await this.pubsub.publish(VALIDATOR_CHATROOM_TOPIC, messageData);
    console.log(`Sent message to ${result.recipients.length} peers`);
  }

  /**
   * Listens to incoming messages on the validator topic
   * + deserialize message
   * + verify signature 
   * + store message locally in this.messages array
   */
  private listenToIncomingValidatorMessages() {
    this.pubsub.addEventListener('message', async (event) => {
      if (event.detail.topic === VALIDATOR_CHATROOM_TOPIC) {
        // validate incoming message
        const deserializedMessage: SignedChatMessage = SignedChatMessageSSZ.deserialize(event.detail.data);
        const signingRoot = computeSigningRoot(ChatMessageSSZ, deserializedMessage.message, DOMAIN_CHAT_MESSAGE);
        const isValid = bls.verify(
          deserializedMessage.pubkey,
          signingRoot,
          deserializedMessage.signature
        );
          
        if (!isValid) {
          throw new Error("Could not verify incoming message. Invalid signature.");
        }
        
        const message: Message = {
          message: {
            ...deserializedMessage.message,
            body: Buffer.from(deserializedMessage.message.body).toString("utf8")
          },
          pubkey: deserializedMessage.pubkey,
          from: (event.detail as any).from.toString() // type hack since event.detail doesn't recognize "from" field
        }
        this.messages.push(message);

        console.info("Message received: ", message);
      }
    });
  }

  /**
   * Returns last 'n' messages 
   * @param count number of messages to return (from last)
   */
  getRecentMessages(count: number) {
    return this.messages.slice(-count);
  }
}

