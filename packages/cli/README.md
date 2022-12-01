# cli

Command line interface for the peer to peer chat app (ringer). 

## Commands

Available commands:
 
1. `import`: Imports validator keystores and secrets (using a passphrase via a `password.txt` file or taking as an input from the user). Takes 2 arguments
  + `--keystores` (*string*, **required**): Path to the keystores generated with the Ethereum Foundation Staking Launchpad
  + `--password` (*string*, **optional**): Path to the keystores password.txt file.

2. `start`: Initializes a libp2p node. Takes 4 arguments
  + `--name` (*string*, **required**): Name associated with the node. You can restart the node using the same name. The peerId is stored by the name of this node at `~/.ringer/peerId/<name>.json`.
  + `--restPort` (*number*, **optional**): REST api server port. eg. `9767`.
  + `--restAddr` (*number*, **optional**): TCP port for the HTTP REST server.
  + `--force` (*boolean*, **optional**): If true, REMOVES any previous config present at `~/.ringer`.