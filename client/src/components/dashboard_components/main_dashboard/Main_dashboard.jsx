import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import main_dashboardcss from "../main_dashboard/main_dashboard.module.css";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useDispatch, useSelector } from "react-redux";
import online_wumpus from "../../../images/online.svg";
import friends_wumpus from "../../../images/friends_2.svg";
import pending_wumpus from "../../../images/pending.svg";
import blocked_wumpus from "../../../images/blocked.svg";
import add_friend_wumpus from "../../../images/friends_2.svg";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import { update_options } from "../../../Redux/options_slice";
import socket from "../../Socket/Socket";

function Main_dashboard({ user_relations }) {
  const dispatch = useDispatch();
  const option_check = useSelector((state) => state.selected_option.value);
  const option_name_check = useSelector(
    (state) => state.selected_option.option_name
  );
  const option_status = useSelector((state) => state.selected_option.status);
  const option_text = useSelector((state) => state.selected_option.text);

  // user details from redux
  const username = useSelector((state) => state.user_info.username);
  const profile_pic = useSelector((state) => state.user_info.profile_pic);
  const id = useSelector((state) => state.user_info.id);

  const [button_state, setbutton_state] = useState(true);
  const [option_data, setoption_data] = useState([
    { username: "", tag: "", profile_pic: "", status: "" },
  ]);
  const [input, setinput] = useState("");
  let images_arr = [
    online_wumpus,
    friends_wumpus,
    pending_wumpus,
    blocked_wumpus,
    add_friend_wumpus,
  ];
  const [image, setimage] = useState(images_arr[0]);
  const [alert, setalert] = useState({ style: "none", message: "none" });

  const { incoming_reqs, outgoing_reqs, friends } = user_relations;
  let pending_reqs = [...incoming_reqs, ...outgoing_reqs];
  const url = process.env.REACT_APP_URL;

  useEffect(() => {
    if (option_check === 2) {
      setoption_data(pending_reqs);
    } else if (option_check === 1) {
      setoption_data(friends);
    }
  }, [pending_reqs, friends, option_check]);

  const button_clicked = async (message, friend_data) => {
    const res = await fetch(`${url}/process_req`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        friend_data: friend_data,
        message: message,
      }),
    });
    const data = await res.json();

    if (data.status === 200 || data.status === 404) {
      dispatch(update_options());
      if (data.status === 200) {
        socket.emit("req_accepted", id, friend_data.id, username, profile_pic);
      }
      // this is to update props and send the value back to parent element to update some states
    }
  };

  function buttons(message, Icon, friend_data) {
    return (
      <div
        key={friend_data.id} // Add a unique key to each mapped element
        className={main_dashboardcss.item_3_comps_wrap}
        onClick={() => {
          button_clicked(message, friend_data);
        }}
      >
        <div className={main_dashboardcss.item_3_comps}>
          <OverlayTrigger placement="top" overlay={tooltips(message)}>
            {<Icon />}
          </OverlayTrigger>
        </div>
      </div>
    );
  }

  const add_friend = async (e) => {
    e.preventDefault();

    const res = await fetch(`${url}/add_friend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        friend: input,
      }),
    });
    const data = await res.json();

    if (
      data.status === 404 ||
      data.status === 201 ||
      data.status === 202 ||
      data.status === 203
    ) {
      setalert({ style: "flex", message: data.message });
    }

    if (data.status === 201 || data.status === 203) {
      dispatch(update_options());
      if (data.status === 203) {
        socket.emit("send_req", data.receiver_id, id, profile_pic, username);
      }
    } else if (data.status === 400) {
      setalert({ style: "flex", message: data.message });
    }
  };

  useEffect(() => {
    if (input.length >= 1) {
      setbutton_state(false);
    } else {
      setbutton_state(true);
    }
  }, [input]);

  function handle_input(e) {
    setinput(e.target.value);
    setalert({ ...alert, style: "none" });
    let current_key = e.nativeEvent.data;
    let input_size = input.length;
    if (
      input[input_size - 1] === "#" &&
      /[0-9]/.test(current_key) === false &&
      current_key != null
    ) {
      // i had to add this null condition because for some reason whenever i try to press backspace with only the regex and specifically the regex for lowercase letters , the condition was getting true for even backspace
      setinput(input);
    } else if (
      (input[input_size - 5] === "#" &&
        /[a-zA-z0-9]/.test(current_key) === true &&
        current_key != null) ||
      (input[input_size - 5] === "#" &&
        /[^a-zA-z0-9]/.test(current_key) === true &&
        current_key != null)
    ) {
      setinput(input);
    }
  }

  useEffect(() => {
    setimage(images_arr[option_check]);
  }, [option_check]);

  const tooltips = (value, props) => (
    <Tooltip id="button-tooltip" {...props}>
      {value}
    </Tooltip>
  );
  return (
    <>
      {option_status === false ? (
        <>
          {option_check === 4 ? (
            <>
              <div className={main_dashboardcss.add_friend_wrap}>
                <div className={main_dashboardcss.add_friend}>
                  <div
                    id={main_dashboardcss.add_friend_1}
                    className={main_dashboardcss.add_friend_comps}
                  >
                    ADD FRIEND
                  </div>
                  <div
                    id={main_dashboardcss.add_friend_2}
                    className={main_dashboardcss.add_friend_comps}
                  >
                    You can add a friend with their Discord Tag. It's
                    cAsE-sEnSitIvE!
                  </div>
                  <div
                    id={main_dashboardcss.add_friend_3}
                    className={main_dashboardcss.add_friend_comps}
                  >
                    <input
                      onChange={handle_input}
                      value={input}
                      type="text"
                      placeholder="Enter a Username#0000"
                    />
                    <button
                      onClick={add_friend}
                      disabled={button_state}
                      id={main_dashboardcss.add_friend_3_button}
                    >
                      Send Friend Request
                    </button>
                  </div>
                  {/* this will work when i put display flex instead of display none for this */}
                  <div
                    id={main_dashboardcss.friend_req_response}
                    style={{ display: alert.style }}
                  >
                    {alert.message}
                  </div>
                </div>
                <div className={main_dashboardcss.add_friend_image}>
                  <div className={main_dashboardcss.offline_image}>
                    <img src={image} alt="" />
                    {option_text}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={main_dashboardcss.main} style={{ display: "flex" }}>
              <div className={main_dashboardcss.offline_image}>
                <img src={image} alt="" />
                {option_text}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* search bar */}
          <div id={main_dashboardcss.search_wrap}>
            <div id={main_dashboardcss.search}>
              <input type="text" placeholder="Search" />
              <div id={main_dashboardcss.search_icon}>
                <SearchIcon fontSize="medium"></SearchIcon>
              </div>
            </div>
          </div>

          <div id={main_dashboardcss.online_users_count_wrap}>
            <div id={main_dashboardcss.online_users_count}>
              {option_name_check}-{option_data.length}
            </div>
          </div>
          {option_data.map((elem) => {
            return (
              <div
                key={elem.id}
                className={main_dashboardcss.online_users_wrap}
              >
                <div className={main_dashboardcss.online_users}>
                  <div
                    className={main_dashboardcss.online_comps}
                    id={main_dashboardcss.item_1_wrap}
                  >
                    <div id={main_dashboardcss.item_1}>
                      <img src={elem.profile_pic} alt="" />
                    </div>
                  </div>
                  <div className={main_dashboardcss.item_2_main}>
                    <div
                      className={main_dashboardcss.online_comps}
                      id={main_dashboardcss.item_2}
                    >
                      <div className={main_dashboardcss.item_2_comps}>
                        {elem.username}
                      </div>
                      <div
                        className={main_dashboardcss.item_2_comps}
                        id={main_dashboardcss.item_2_2}
                      >
                        Online
                      </div>
                    </div>
                    <div
                      className={main_dashboardcss.online_comps}
                      id={main_dashboardcss.item_2_3}
                    >
                      <div
                        className={main_dashboardcss.item_2_comps}
                        id={main_dashboardcss.item_2_3_1}
                      >
                        #{elem.tag}
                      </div>
                    </div>
                  </div>
                  <div
                    className={main_dashboardcss.online_comps}
                    id={main_dashboardcss.item_3}
                  >
                    {option_check === 2 ? (
                      <>
                        {elem.status === "incoming" ? (
                          <>
                            {buttons("Accept", DoneIcon, elem)}
                            {buttons("Ignore", CloseIcon, elem)}
                          </>
                        ) : (
                          <>{buttons("Cancel", CloseIcon, elem)}</>
                        )}
                      </>
                    ) : (
                      <>
                        {option_check === 3 ? (
                          <>{buttons("Unblock", PersonRemoveIcon, elem)}</>
                        ) : (
                          <>
                            {buttons("Message", ChatBubbleIcon, elem)}
                            {buttons("More", MoreVertIcon, elem)}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </>
  );
}

export default Main_dashboard;
