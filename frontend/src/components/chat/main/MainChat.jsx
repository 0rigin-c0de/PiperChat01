import InvalidChat from "../invalidMain/InvalidChat";
import ValidChat from "../messages/ValidChat";
import { useSelector } from "react-redux";
import Loading from "../../loading/Loading";

function MainChat() {
  const server_exists = useSelector(
    (state) => state.currentPage.server_exists
  );

  return (
    <>
      {server_exists == null ? (
        <Loading></Loading>
      ) : server_exists == false ? (
        <InvalidChat></InvalidChat>
      ) : (
        <ValidChat key={"Valid_Chat"}></ValidChat>
      )}
    </>
  );
}

export default MainChat;
