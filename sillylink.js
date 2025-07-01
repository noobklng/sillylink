(function(Scratch) {
  const extension = {
    name: "MyCloud",
    id: "mycloud",
    description: "Custom CloudLink-like extension with rooms and messaging",
    blocks: [
      {
        opcode: "connect",
        blockType: Scratch.BlockType.COMMAND,
        text: "connect as [ID]",
        arguments: {
          ID: { type: Scratch.ArgumentType.STRING, defaultValue: "guest123" }
        }
      },
      {
        opcode: "joinRoom",
        blockType: Scratch.BlockType.COMMAND,
        text: "join room [ROOM]",
        arguments: {
          ROOM: { type: Scratch.ArgumentType.STRING, defaultValue: "main" }
        }
      },
      {
        opcode: "sendMessage",
        blockType: Scratch.BlockType.COMMAND,
        text: "send [MSG]",
        arguments: {
          MSG: { type: Scratch.ArgumentType.STRING, defaultValue: "hello" }
        }
      },
      {
        opcode: "pingServer",
        blockType: Scratch.BlockType.COMMAND,
        text: "ping server"
      },
      {
        opcode: "onMessage",
        blockType: Scratch.BlockType.HAT,
        text: "when message received"
      },
      {
        opcode: "getMessage",
        blockType: Scratch.BlockType.REPORTER,
        text: "message data"
      },
      {
        opcode: "getSender",
        blockType: Scratch.BlockType.REPORTER,
        text: "message sender"
      }
    ],

    // Extension class
    menus: {},

    _ws: null,
    _latestMessage: "",
    _latestSender: "",

    connect(args) {
      const self = this;
      this._ws = new WebSocket("ws://localhost:3000");

      this._ws.onopen = () => {
        self._ws.send(JSON.stringify({
          action: "connect",
          id: args.ID
        }));
      };

      this._ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "message") {
          self._latestMessage = msg.data;
          self._latestSender = msg.from;
          Scratch.vm.runtime.startHats("mycloud_onMessage");
        }
      };

      this._ws.onerror = (e) => console.error("WebSocket error:", e);
      this._ws.onclose = () => console.warn("WebSocket connection closed.");
    },

    joinRoom(args) {
      if (this._ws && this._ws.readyState === WebSocket.OPEN) {
        this._ws.send(JSON.stringify({
          action: "join",
          room: args.ROOM
        }));
      }
    },

    sendMessage(args) {
      if (this._ws && this._ws.readyState === WebSocket.OPEN) {
        this._ws.send(JSON.stringify({
          action: "send",
          message: args.MSG
        }));
      }
    },

    pingServer() {
      if (this._ws && this._ws.readyState === WebSocket.OPEN) {
        this._ws.send(JSON.stringify({ action: "ping" }));
      }
    },

    onMessage() {
      return true;
    },

    getMessage() {
      return this._latestMessage;
    },

    getSender() {
      return this._latestSender;
    }
  };

  Scratch.extensions.register(extension);
})(Scratch);
