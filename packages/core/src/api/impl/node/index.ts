import {routes} from "api";
import {ApiModules} from "../types.js";
import {IApiOptions} from "../../options.js";
import { MessageWithPubKey, Message } from "../../../types.js";

export function getGossipApi(opts: IApiOptions, {gossip}: Pick<ApiModules, "gossip">): routes.node.Api {
  return {
    async publishToValidatorChatRoom(messageWithPubKey: MessageWithPubKey) {
      await gossip.publishMessageToValidators(messageWithPubKey);
    },

    async getRecentMessages(): Promise<{ data: Message[] }> {
      const messages = await gossip.getRecentMessages();
      // const messageData: Message[] = [];
      // for (const m of messages) {
      //   messageData.push({
      //     "message": {
      //       timestamp: m.message.timestamp,
      //       body: m.message.body
      //     },
      //     "from": m.from,
      //     "pubkey": m.pubkey
      //   })
      // }
      return { data: messages };
    },
  };
}
