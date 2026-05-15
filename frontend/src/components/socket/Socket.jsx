import socketIO from "socket.io-client";
const url = import.meta.env.VITE_APP_URL;
let socket = socketIO.connect(url);
export default socket;
