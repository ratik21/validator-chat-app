# Ringer

Peer to peer chat application for validators from the beacon chain where validators can broadcast chat messages b/w one another using the gossip protocol. By default all data is stored at `~/.ringer`

## Notes

+ For the signed message I have included the `publicKey` in the message instead of the validator index. I understand it adds extra bytes (48) to the message but as per my discussion with Cayman he told me that you can just run this app without running a node. So did that accordingly. Otherwise we can use a `validatorIndex` and have the beacon node url, using which we can query the beacon api (using `@lodestar/api`) for the state which has the validator's publickey and index. Please let me know and we can do it that way. 

+ Not able to add unit tests :( Feel bad about this one, but I feel i had exhausted the time limit for the assignment in setting up the code (api, cli, core), adding node config, gossip class, message validation, rest api routes, cli commands (start & import), and metrics(*wip*). But happy to add them if you allow more time, please let me know that as well :)

+ *wip* state of metrics. I was able to port the code from `lodestar` and start the metrics server and setup prometheus, but wasn't able to see the global metrics. Will definitely be looking more into that.


## Requirements

+ Node 14+
+ Yarn `v1.2+`. Use `npm install -g yarn` to install `yarn`
+ Git

## Setup

First clone the git repo:
```sh
git clone https://github.com/ratik21/validator-chat-app.git
cd validator-chat-app/
```

After cloning the git repo, simply run:
```sh
sh install.sh
```

This shell script will install, build and link the `ringer` cli file globally. Try running `ringer --help` to check if the installation was proper. You should see something like:

<img width="1012" alt="image" src="https://user-images.githubusercontent.com/33264364/204995385-fb958927-81b6-4ce2-9575-e705b4d1977c.png">


## Clean

To remove *node_modules* & all *build/* folders run
```sh
sh clean.sh
```


## Packages

The repo has mainly been divided into 3 packages

+ `packages/core`: Contains code for setting up the node, route implementation, message handling & metrics. Read more [here](./packages/core/README.md).
+ `packages/api`: REST api for the libp2p node. Supports publishing a new message (via http `POST`) and getting recent messages by a count (via http `GET`). Read more [here](packages/api/README.md).
+ `packages/cli`: CLI for ringer app. Currently supports `start` & `import` commands. Read more [here](packages/cli/README.md).


## Usage

+ First follow the setup and make sure `ringer --help` works.
+ Generate one or more validator keystores using the ethereum `staking-deposit-cli` - [https://github.com/ethereum/staking-deposit-cli#introduction](https://github.com/ethereum/staking-deposit-cli#introduction).

+ After generating the keys, you can import them using `ringer import` command. Use `ringer import --keystores /path/to/validator_keys`. This will import the keystores & secrets to `~/.ringer/keystores` & `~/.ringer/secrets` respectively.
  <img width="1240" alt="image" src="https://user-images.githubusercontent.com/33264364/205002661-f8237830-ec26-4f2d-a530-fafb9740da93.png">

  *NOTE:* Referenced from [lodestar validator import](https://github.com/ChainSafe/lodestar/blob/unstable/packages/cli/src/cmds/validator/import.ts).

+ After importing the keystores, you can start/initialize the node. Use `ringer start --name ratik` to start the node (identified by name "ratik"). This will also start the Rest api server at port `9796` & metrics server at port `8008`.
  <img width="1072" alt="image" src="https://user-images.githubusercontent.com/33264364/205004571-3c13d17e-e0f3-49e2-9513-d3c2539b0a4b.png">

+ Now you can send & receive messages from other validators you're connected to. For testing you can start another node locally (make sure to specify a different restPort using `--restPort <port>` to avoid address already in use error). The enpoint is `ringer/v1/validator/chat/publish/message`. Example POST req:
  ```bash
  curl -X POST -H "Content-Type: application/json" --data '{"message":"this is my message","public_key":"0x82592f5b7f91a2f05101c2ef9c897eb245dd6107a97087105b2e827f82fa623d4f5e6ca3146e628d647b4fd51fc381b5"}' http://localhost:9596/ringer/v1/validator/chat/publish/message
  ```

  The payload consists of the "message" (in string) & "public_key" (in string). The public key must be valid or an error will be thrown. After POSTing this is how the screen looks like

  <img width="992" alt="image" src="https://user-images.githubusercontent.com/33264364/205005330-615d905b-edb7-47dd-bcf6-cd911dcda8ea.png">

  **NOTE:** If we're running a beacon node, we can also verify that the validator is an active validator from the beacon chain (by querying the beacon api's state validators).

+ You can also retrieve recent messages (only upto 50) using `GET` endpoint `ringer/v1/validator/chat/get/messages/:count`. Example GET req:
  ```sh
  // retrieves last message received
  curl http://localhost:9596/ringer/v1/validator/chat/get/messages/1
  ```

  Response:
  <img width="1278" alt="image" src="https://user-images.githubusercontent.com/33264364/205005997-5b43be22-033d-4beb-b37e-797d36146235.png">



## Improvements

This project was implemented keeping the time constraint in mind, so i kept things minimal. There are improvements which can be made here (open to feedback to add more):-

+ **Persistance**: Instead of storing messages in a local array, we can use a database to persist chat messages. So when a node "reloads", it still has those messages persisted.
+ **CRDT**: This is related to chat messages. Since chat messages have a specific order in group, and let's say a peer lost a connection and came back after some time, then it would lose the messages, or even with persistance it would lose the "ordering" of messages. We need some form of crdt to sync messages in the order which they were sent.
+ Add more api routes (eg. `getNodePeers`, `getNodeMetaData`, `getConnections`, ..etc)
+ Handling more DOS vectors
  * **gossip queues**: implementing a job queue in order to limit some attacker continously sending a lot of messages at the same time.
  * use [`fail2Ban`](https://docs.libp2p.io/concepts/security/dos-mitigation/#how-to-automate-blocking-with-fail2ban)
  * better monitering & alerting
+ cli could be improved (can be made more flexible by providing end user more configuration options).
+ generate api docs

## References

References taken to build this project:
+ (libp2p docs) [https://docs.libp2p.io/concepts/security/dos-mitigation/](https://docs.libp2p.io/concepts/security/dos-mitigation/)
+ (lodestar cli) [https://chainsafe.github.io/lodestar/reference/cli/](https://chainsafe.github.io/lodestar/reference/cli/)
+ (zchain - a project which i am working on) [https://github.com/zer0-os/zChain](https://github.com/zer0-os/zChain)
+ (lodestar rest api) [https://github.com/ChainSafe/lodestar/tree/unstable/packages/api](https://github.com/ChainSafe/lodestar/tree/unstable/packages/api)
+ (js-ipfs cli) [https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-cli](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-cli)
+ (ipfs camp debugging js-ipfs) [https://www.youtube.com/watch?v=sHHJAVVFYAA&ab_channel=IPFS](https://www.youtube.com/watch?v=sHHJAVVFYAA&ab_channel=IPFS)
+ (ipfs camp lodestar intro) [https://www.youtube.com/watch?v=1DStPz32k_4&ab_channel=IPFS](https://www.youtube.com/watch?v=1DStPz32k_4&ab_channel=IPFS)
+ (ipfs camp DOS defence) [https://www.youtube.com/watch?v=jZrAnnFO-2c&ab_channel=IPFS](https://www.youtube.com/watch?v=jZrAnnFO-2c&ab_channel=IPFS)