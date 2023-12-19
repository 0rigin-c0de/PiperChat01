import React from "react";
import invalid_chat_css from "../invalid_main_chat/invalid_chat_css.module.css";
import invalid_chat_image from "../../../images/invalid_server.svg";

function Invalid_chat() {
  return (
    <div className={invalid_chat_css.main_wrapper}>
      <div id={invalid_chat_css.main}>
        <div
          className={invalid_chat_css.main_comps}
          id={invalid_chat_css.top_comp}
        >
          <img src={invalid_chat_image} alt="invalid-chat" />
        </div>
        <div
          className={invalid_chat_css.main_comps}
          id={invalid_chat_css.bottom_comp}
        >
          <div id={invalid_chat_css.bottom_comps_1}>NO TEXT CHANNELS</div>
          <div id={invalid_chat_css.bottom_comps_2}>
            You find yourself in a strange place. You don't have access to any
            text channels or there are none in this server.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Invalid_chat;
