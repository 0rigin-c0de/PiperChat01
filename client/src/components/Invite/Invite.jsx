import React, { useEffect, useState } from "react";
import invitecss from "../Invite/invite.module.css";
import logo from "../../images/discord_logo_3.png";
import { useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import invalid_link_image from "../../images/invalid_invite.svg";
import { useSelector } from "react-redux";
import jwt from "jwt-decode";
import { useNavigate } from "react-router-dom";

function Invite() {
  // had to use token here because redux get the values when dashboard component runs and it doesnt run when this route is fired
  let Navigate = useNavigate();
  let token1 = localStorage.getItem("token");
  let user_creds = jwt(token1);
  const { username, tag, profile_pic, id } = user_creds;

  const { invite_link } = useParams();
  const url = process.env.REACT_APP_URL;
  const [invite_details, setinvite_details] = useState(null);
  const [invalid_invite_link, setinvalid_invite_link] = useState(null);

  const accept_invite = async () => {
    const res = await fetch(`${url}/accept_invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        user_details: { username, tag, profile_pic, id },
        server_details: { invite_details },
      }),
    });
    const data = await res.json();
    if (data.status == 200 || data.status == 403) {
      console.log("going");
      Navigate("/channels/@me");
    } else {
      console.log("something went wrong");
    }
  };

  const invite_link_info = async () => {
    const res = await fetch(`${url}/invite_link_info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        invite_link,
      }),
    });
    const data = await res.json();
    if (data.status == 200) {
      setinvite_details(data);
      setinvalid_invite_link(false);
    } else {
      setinvalid_invite_link(true);
    }
  };

  useEffect(() => {
    invite_link_info();
  }, []);

  return (
    <div id={invitecss.main}>
      <div id={invitecss.invite_box}>
        {invalid_invite_link == null ? (
          <CircularProgress />
        ) : invalid_invite_link == false ? (
          invite_details == null ? (
            <CircularProgress />
          ) : (
            <>
              <div
                className={`${invitecss.invite_box_comps} ${invitecss.logo}`}
                id={invitecss.comp_1}
              >
                <img src={logo} alt="" />
              </div>
              <div className={invitecss.invite_box_comps} id={invitecss.comp_2}>
                {invite_details.inviter_name} invited you to join
              </div>
              <div className={invitecss.invite_box_comps} id={invitecss.comp_3}>
                <div
                  className={invitecss.server_details}
                  id={invitecss.server_icon}
                >
                  {invite_details.server_pic == "" ? (
                    invite_details.server_name[0]
                  ) : (
                    <img
                      className={invitecss.actual_image}
                      src={invite_details.server_pic}
                      alt=""
                    />
                  )}
                </div>
                <div className={invitecss.server_details}>
                  {invite_details.server_name}
                </div>
              </div>
              <div className={invitecss.invite_box_comps} id={invitecss.comp_4}>
                <div className={invitecss.server_member_details}>
                  <div className={invitecss.dot_wrap}>
                    <div
                      className={invitecss.dot}
                      style={{ background: "#3BA55D" }}
                    ></div>
                  </div>
                  <div id={invitecss.online}>1 Online</div>
                </div>

                <div className={invitecss.server_member_details}>
                  <div className={invitecss.dot_wrap}>
                    <div
                      className={invitecss.dot}
                      style={{ background: "#B9BBBE" }}
                    ></div>
                  </div>
                  <div id={invitecss.members}>1 Member</div>
                </div>
              </div>
              <div className={invitecss.invite_box_comps} id={invitecss.comp_5}>
                <button
                  id={invitecss.accept_button}
                  onClick={() => {
                    if (invite_details.inviter_id == id) {
                      Navigate("/channels/@me");
                    } else accept_invite();
                  }}
                >
                  Accept Invite
                </button>
              </div>
            </>
          )
        ) : (
          <>
            <div className={invitecss.invite_box_comps}>
              <img src={invalid_link_image} alt="" />
            </div>
            <div
              className={invitecss.invite_box_comps}
              id={invitecss.invalid_link_comp_2}
            >
              Invite Invalid
            </div>
            <div
              className={invitecss.invite_box_comps}
              id={invitecss.invalid_link_comp_3}
            >
              This invite may be expired or you might not have permission to
              join.
            </div>
            <div className={invitecss.invite_box_comps}>
              <button id={invitecss.continue_button}>
                Continue to PiperChat
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Invite;
