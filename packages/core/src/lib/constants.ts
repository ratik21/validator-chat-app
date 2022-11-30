import os from 'os'
import path from 'path'

export const ROOT_DIR = '.ringer';
export const ROOT_DIR_PATH = path.join(os.homedir(), ROOT_DIR);
export const PEER_ID_PATH = path.join(os.homedir(), ROOT_DIR, 'peerId')


// maybe we can add a uuid to make the topic unique?
export const VALIDATOR_CHATROOM_TOPIC = '/beacon-validators/chat/1.0.0';

// max 100Kb 
export const MESSAGE_MAX_LEN = 100000;

// This domain is used to separate messages signed for this purpose
// from other purposes
export const DOMAIN_CHAT_MESSAGE = Uint8Array.from([99, 104, 97, 117]);