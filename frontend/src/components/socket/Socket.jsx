import socketIO from "socket.io-client";
const url = process.env.REACT_APP_URL;
const token = localStorage.getItem("token");
let socket = socketIO.connect(url, {
  auth: { token },
});
export default socket;