import React from "react";
import navbar2_chatcss from "../navbar_2_chat/navbar2_chatcss.module.css";
import { useSelector } from "react-redux";
import Invalid_navbar from "../navbar_2_chat_invalid/Navbar2_chat_invalid";
import Valid_navbar from "../navbar_2_chat_valid/Navbar2_chat_valid";
import Loading from "../../Loading_page/Loading";

function Navbar2_chat() {
  const server_exists = useSelector(
    (state) => state.current_page.server_exists
  );

  return (
    <div className={navbar2_chatcss.main}>
      {server_exists == null ? (
        <Loading></Loading>
      ) : server_exists == false ? (
        <Invalid_navbar></Invalid_navbar>
      ) : (
        <Valid_navbar></Valid_navbar>
      )}
    </div>
  );
}

export default Navbar2_chat;
