import {routes} from "api";
import {ApiModules} from "../types.js";
import {IApiOptions} from "../../options.js";
import { MessageWithPubKey } from "../../../types.js";
import { node } from "api/gossip/routes";
import { MAX_QUERY_MESSAGES } from "../../../lib/constants.js";

export function getGossipApi(_opts: IApiOptions, {gossip}: Pick<ApiModules, "gossip">): routes.node.Api {
  return {
    async publishToValidatorChatRoom(messageWithPubKey: MessageWithPubKey) {
      await gossip.publishMessageToValidators(messageWithPubKey);
    },

    async getRecentMessages(count: number): Promise<{ data: node.GossipMessage[] }> {
      // limit max no. of messages retrieval (could be a dos vector)
      if (count > MAX_QUERY_MESSAGES) {
        throw new Error(`You can request upto last ${count} messages at a time`);
      }
      
      const messages = gossip.getRecentMessages(count);
      return { data: messages };
    },
  };
}
