import {allForks, ssz, StringType} from "@lodestar/types";
import {ByteListType, ContainerType, UintNumberType} from "@chainsafe/ssz";
import {
  ArrayOf,
  ContainerData,
  reqEmpty,
  jsonType,
  ReturnTypes,
  RoutesData,
  Schema,
  ReqSerializers,
  ReqEmpty,
  sameType,
  reqOnlyBody,
} from "../../utils/index.js";

interface Message {
  message: string,
  publicKey: string
}

interface UserMsg {
  timestamp: number,
  body: string
}

// user facing message
export interface GossipMessage {
  message: UserMsg,
  from: string, // peerId
  pubkey: Uint8Array // validator public key
}

/**
 * Read information about the beacon node.
 */
export type Api = {
  getRecentMessages(): Promise<{data: GossipMessage[]}>;

  /**
   * Publish message to the validator chat room
   */
  publishToValidatorChatRoom(message: Message): Promise<void>;
};

export const routesData: RoutesData<Api> = {
  getRecentMessages: {url: "/ringer/v1/validator/chat/get/messages", method: "GET"},
  publishToValidatorChatRoom: {url: "/ringer/v1/validator/chat/publish/message", method: "POST"},
};

/* eslint-disable @typescript-eslint/naming-convention */

export type ReqTypes = {
  getRecentMessages: ReqEmpty;
  publishToValidatorChatRoom: {body: unknown};
};

export function getReqSerializers(): ReqSerializers<Api, ReqTypes> {
  const messageSSZ = new ContainerType(
    {
      message: new StringType(),
      publicKey: new StringType(),
    },
    {jsonCase: "snake"}
  );

  return {
    getRecentMessages: reqEmpty,
    publishToValidatorChatRoom: reqOnlyBody(messageSSZ, Schema.Object),
  };
}

export function getReturnTypes(): ReturnTypes<Api> {
  const stringType = new StringType();
  const userMessage = new ContainerType(
    {
      timestamp: new UintNumberType(8),
      body: stringType, // peerId
    },
    {jsonCase: "eth2"}
  )
  const message = new ContainerType(
    {
      message: userMessage,
      from: stringType, // peerId
      pubkey: new ByteListType(48), // validator public key
    },
    {jsonCase: "eth2"}
  );

  return {
    getRecentMessages: ContainerData(ArrayOf(message)),
  };
}
