import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import valid_chat_css from "../valid_main_chat/valid_chat_css.module.css";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import TagIcon from "@mui/icons-material/Tag";
import socket from "../../Socket/Socket";
import { useParams } from "react-router-dom";

function Valid_chat() {
  const url = process.env.REACT_APP_URL;
  const { server_id } = useParams();

  // channel creds from redux
  const channel_id = useSelector((state) => state.current_page.page_id);
  const channel_name = useSelector((state) => state.current_page.page_name);

  // user creds from redux
  const username = useSelector((state) => state.user_info.username);
  const tag = useSelector((state) => state.user_info.tag);
  const profile_pic = useSelector((state) => state.user_info.profile_pic);
  const id = useSelector((state) => state.user_info.id);

  // message
  const [chat_message, setchat_message] = useState("");
  const [all_messages, setall_messages] = useState(null);
  const [latest_message, setlatest_message] = useState(null);

  useEffect(() => {
    socket.emit("join_chat", channel_id);
  }, [channel_id]);

  function send_message(e) {
    if (e.code === "Enter") {
      let message_to_send = chat_message;
      let timestamp = Date.now();
      setchat_message("");
      if (all_messages != null) {
        setall_messages([
          ...all_messages,
          {
            content: message_to_send,
            sender_id: id,
            sender_name: username,
            sender_pic: profile_pic,
            timestamp: timestamp,
          },
        ]);
      } else {
        setall_messages([
          {
            content: message_to_send,
            sender_id: id,
            sender_name: username,
            sender_pic: profile_pic,
            timestamp: timestamp,
          },
        ]);
      }
      socket.emit(
        "send_message",
        channel_id,
        message_to_send,
        timestamp,
        username,
        tag,
        profile_pic
      );
      store_message(message_to_send, timestamp);
    }
  }

  const store_message = async (chat_message, timestamp) => {
    const res = await fetch(`${url}/store_message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        message: chat_message,
        server_id,
        channel_id,
        channel_name,
        timestamp,
        username,
        tag,
        id,
        profile_pic,
      }),
    });
    const data = await res.json();
    if (data.status === 200) {
      console.log("message stored");
    }
  };

  useEffect(() => {
    if (channel_id !== "") {
      setall_messages(null);
      get_messages();
    }
    // eslint-disable-next-line
  }, [channel_id]);

  const get_messages = async () => {
    const res = await fetch(`${url}/get_messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        channel_id,
        server_id,
      }),
    });
    const data = await res.json();
    if (data.chats.length !== 0) {
      setall_messages(data.chats);
    }
  };

  useEffect(() => {
    if (latest_message != null) {
      let { message, timestamp, sender_name, sender_pic } =
        latest_message.message_data;
      setall_messages([
        ...all_messages,
        {
          content: message,
          sender_id: sender_pic,
          sender_name: sender_name,
          sender_pic: sender_pic,
          timestamp: timestamp,
        },
      ]);
    }
    // eslint-disable-next-line
  }, [latest_message]);

  socket.on("recieve_message", (message_data) => {
    console.log(message_data, "this is message");
    setlatest_message(message_data);
  });

  return (
    <div className={valid_chat_css.mainchat}>
      <div id={valid_chat_css.top}>
        <div id={valid_chat_css.welcome_part}>
          <div id={valid_chat_css.tag}>
            {" "}
            <TagIcon fontSize="large"></TagIcon>
          </div>
          <div
            className={valid_chat_css.welcome_comps}
            id={valid_chat_css.welcome_comp_1}
          >
            Welcome to #{channel_name}
          </div>
          <div
            className={valid_chat_css.welcome_comps}
            id={valid_chat_css.welcome_comp_2}
          >
            This is the start of the #{channel_name} channel
          </div>

          {all_messages != null ? (
            all_messages.map((elem, index) => {
              let timestamp_init = parseInt(elem.timestamp, 10);
              const date = new Date(timestamp_init);
              var timestamp =
                date.toDateString() +
                ", " +
                date.getHours() +
                ":" +
                date.getMinutes();
              return (
                <div key={elem.timestamp}  id={valid_chat_css.message_box}>
                  <div
                    className={valid_chat_css.message_box_comps}
                    id={valid_chat_css.message_left}
                  >
                    <div className={valid_chat_css.user_image_wrap}>
                      <img
                        id={valid_chat_css.user_image}
                        src={elem.sender_pic}
                        alt=""
                        srcSet=""
                      />
                    </div>
                  </div>
                  <div
                    className={valid_chat_css.message_box_comps}
                    id={valid_chat_css.message_right}
                  >
                    <div
                      className={valid_chat_css.message_right_comps}
                      id={valid_chat_css.message_right_top}
                    >
                      <div id={valid_chat_css.message_username}>
                        {elem.sender_name}
                      </div>
                      <div id={valid_chat_css.message_timestamp}>
                        {timestamp}
                      </div>
                    </div>
                    <div
                      className={valid_chat_css.message_right_comps}
                      id={valid_chat_css.message_right_bottom}
                    >
                      {elem.content}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <></>
          )}
        </div>
        <div id={valid_chat_css.chat_part}></div>
      </div>

      <div id={valid_chat_css.bottom}>
        <div id={valid_chat_css.message_input}>
          <AddCircleIcon htmlColor="#B9BBBE"></AddCircleIcon>
          <input
            type="text"
            onKeyDown={(e) => {
              send_message(e);
            }}
            value={chat_message}
            onChange={(e) => {
              setchat_message(e.target.value);
            }}
            placeholder={`Message #${channel_name}`}
          />
        </div>
      </div>
    </div>
  );
}

export default Valid_chat;
