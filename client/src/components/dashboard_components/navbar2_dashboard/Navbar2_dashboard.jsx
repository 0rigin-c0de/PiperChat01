import React from "react";
import navbar_chat_css from "./navbar2_dashboardcss.module.css";
import person_icon from "../../../images/friends.svg";
import AddIcon from "@mui/icons-material/Add";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import offline_icon from "../../../images/offline_status.svg";
import { useSelector } from "react-redux";

function Navbar_2_dashboard() {
  const profile_pic = useSelector((state) => state.user_info.profile_pic);

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Create DM
    </Tooltip>
  );

  return (
    <div>
      <div className={navbar_chat_css.search_wrap}>
        <div className={navbar_chat_css.search}>
          Find or start a conversation
        </div>
      </div>
      <div className={navbar_chat_css.friends_wrap}>
        <div className={navbar_chat_css.friends}>
          <img
            className={navbar_chat_css.friends_icon}
            src={person_icon}
            alt=""
          />
          Friends
        </div>
      </div>
      <div className={navbar_chat_css.heading}>
        <div
          className={navbar_chat_css.heading_components}
          id={navbar_chat_css.text}
        >
          DIRECT MESSAGES
        </div>
        <div
          className={navbar_chat_css.heading_components}
          id={navbar_chat_css.plus}
        >
          <OverlayTrigger placement="top" overlay={renderTooltip}>
            <AddIcon fontSize="small"></AddIcon>
          </OverlayTrigger>
        </div>
      </div>
      {/* this area shows any dm which you have done to anyone in past time whether friend or not */}
      <div className={navbar_chat_css.friend_details_wrap}>
        <div className={navbar_chat_css.friend_details}>
          <div
            className={navbar_chat_css.friend_details_comps}
            id={navbar_chat_css.profile_wrap}
          >
            <div className={navbar_chat_css.profile_pic}>
              <img src={profile_pic} alt="" />
              <div className={navbar_chat_css.online_status}>
                <img
                  src={offline_icon}
                  className={navbar_chat_css.offline_icon}
                  alt=""
                />
              </div>
            </div>
          </div>
          <div
            className={`${navbar_chat_css.friend_details_comps} ${navbar_chat_css.name}`}
          >
            Dummy friend
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar_2_dashboard;
