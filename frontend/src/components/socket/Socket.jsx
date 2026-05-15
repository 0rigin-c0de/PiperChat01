import socketIO from "socket.io-client";

const url = process.env.REACT_APP_URL;

let socket = socketIO.connect(url, {
  transports: ["websocket"],
});

export default socket;