# api

REST api server for the p2p chat app.

## Routes

1. `/ringer/v1/validator/chat/publish/message` (**POST**): Publish a new chat message to the network. Request body params:
  * `message` (*string*): message to publish
  * `public_key` (*string*): validator keystore public key hex.
  eg.
  ```sh
  curl -X POST -H "Content-Type: application/json" --data '{"message":"this is my message","public_key":"0x82592f5b7f91a2f05101c2ef9c897eb245dd6107a97087105b2e827f82fa623d4f5e6ca3146e628d647b4fd51fc381b5"}' http://localhost:9596/ringer/v1/validator/chat/publish/message
  ```

2. `/ringer/v1/validator/chat/get/messages/:n` (**GET**): Get a list of last "n" received chat messages by this node. Req params:
  * `n` (*number*): number of messages to return (max 50).
  eg.
  ```sh
  curl http://localhost:9596/ringer/v1/validator/chat/get/messages/5
  ```
