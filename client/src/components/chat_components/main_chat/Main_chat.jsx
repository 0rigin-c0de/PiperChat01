import React, { useEffect, useState } from "react";
import Invalid_chat from "../invalid_main_chat/Invalid_chat";
import Valid_chat from "../valid_main_chat/Valid_chat";
import { useSelector } from "react-redux";
import Loading from "../../Loading_page/Loading";

function Main_chat() {
  const server_exists = useSelector(
    (state) => state.current_page.server_exists
  );

  return (
    <>
      {server_exists == null ? (
        <Loading></Loading>
      ) : server_exists == false ? (
        <Invalid_chat></Invalid_chat>
      ) : (
        <Valid_chat key={"Valid_Chat"}></Valid_chat>
      )}
    </>
  );
}

export default Main_chat;
