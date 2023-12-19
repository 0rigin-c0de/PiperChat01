import React, { useEffect, useState } from "react";
import dashboardcss from "../dashboard/dashboard.module.css";
import Navbar from "../navbar/Navbar";
import Navbar_2 from "../navbar_2/Navbar_2";
import Top_nav from "../top_nav/Top_nav";
import Main from "../main/Main";
import Right_nav from "../right_nav/Right_nav";
import jwt from "jwt-decode";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  change_username,
  change_tag,
  option_profile_pic,
  option_user_id,
} from "../../Redux/user_creds_slice";
import { server_existence } from "../../Redux/current_page";

function Dashboard() {
  const dispatch = useDispatch();
  const { server_id } = useParams();
  const option_state = useSelector(
    (state) => state.selected_option.updated_options
  );
  const url = process.env.REACT_APP_URL;
  const server_exists = useSelector(
    (state) => state.current_page.server_exists
  );

  let token1 = localStorage.getItem("token");
  let user_creds = jwt(token1);
  const { username, tag, profile_pic, id } = user_creds;
  const [user_data, setuser_data] = useState({
    incoming_reqs: "",
    outgoing_reqs: "",
    friends: "",
    servers: "",
  });
  const [status, setstatus] = useState({
    pending_status: false,
    online_status: false,
    all_friends_status: false,
    blocked_staus: false,
  });
  const [new_req, setnew_req] = useState(1);

  const new_req_recieved = (new_req_value) => {
    setnew_req(new_req + new_req_value);
  };

  const [grid_layout, setgrid_layout] = useState("70px 250px auto auto 370px");

  useEffect(() => {
    user_relations();
  }, [new_req, option_state]);

  useEffect(() => {
    if (server_id === "@me" || server_id === undefined) {
      setgrid_layout("70px 250px auto auto 370px");
    } else {
      if (server_exists === false) {
        setgrid_layout("70px 250px auto");
      } else {
        setgrid_layout("70px 250px auto auto 300px");
      }

      let does_exists = false;
      if (server_id !== "@me") {
        for (let index = 0; index < user_data.servers.length; index++) {
          if (server_id === user_data.servers[index].server_id) {
            does_exists = true;
          }
        }
      }
      dispatch(server_existence(does_exists));
    }
  }, [server_id, user_data.servers]);

  useEffect(() => {
    dispatch(change_username(username));
    dispatch(change_tag(tag));
    dispatch(option_profile_pic(profile_pic));
    dispatch(option_user_id(id));
  }, []);

  const user_relations = async () => {
    const res = await fetch(`${url}/user_relations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
    });
    const data = await res.json();

    const { incoming_reqs, outgoing_reqs, friends, servers } = data;
    let pending = incoming_reqs.length + outgoing_reqs.length;
    let status_2 = {
      pending_status: false,
      online_status: false,
      all_friends_status: false,
      blocked_staus: false,
    };

    if (pending !== 0) {
      status_2 = { ...status_2, pending_status: true };
    } else {
      status_2 = { ...status_2, pending_status: false };
    }

    if (friends.length !== 0) {
      status_2 = { ...status_2, all_friends_status: true };
    } else {
      status_2 = { ...status_2, all_friends_status: false };
    }

    setstatus(status_2);
    setuser_data({
      incoming_reqs: incoming_reqs,
      outgoing_reqs: outgoing_reqs,
      friends: friends,
      servers: servers,
    });
  };

  return (
    <div
      className={dashboardcss.main}
      style={{ gridTemplateColumns: grid_layout }}
    >
      <div className={dashboardcss.components} id={dashboardcss.component_1}>
        <Navbar
          user_cred={{ username: username, user_servers: user_data.servers }}
          new_req_recieved={new_req_recieved}
        />
      </div>
      <div className={dashboardcss.components} id={dashboardcss.component_2}>
        <Navbar_2 />
      </div>
      {server_exists === false && server_id !== "@me" ? (
        <div
          style={{ gridArea: "1 / 3 / 6 / 6" }}
          className={dashboardcss.components}
          id={dashboardcss.component_4}
        >
          <Main
            user_relations={{
              incoming_reqs: user_data.incoming_reqs,
              outgoing_reqs: user_data.outgoing_reqs,
              friends: user_data.friends,
            }}
          />
        </div>
      ) : (
        <>
          <div
            className={dashboardcss.components}
            id={dashboardcss.component_3}
          >
            <Top_nav
              button_status={{
                pending: status.pending_status,
                all_friends: status.all_friends_status,
              }}
            />
          </div>
          <div
            className={dashboardcss.components}
            id={dashboardcss.component_4}
          >
            <Main
              user_relations={{
                incoming_reqs: user_data.incoming_reqs,
                outgoing_reqs: user_data.outgoing_reqs,
                friends: user_data.friends,
              }}
            />
          </div>
          <div
            className={dashboardcss.components}
            id={dashboardcss.component_5}
          >
            <Right_nav />
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
