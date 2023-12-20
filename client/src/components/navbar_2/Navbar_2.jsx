import React from "react";
import nav2css from "../navbar_2/navbar2.module.css";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import SettingsIcon from "@mui/icons-material/Settings";
import HeadsetIcon from "@mui/icons-material/Headset";
import MicOffIcon from "@mui/icons-material/MicOff";
import Navbar2_dashboard from "../dashboard_components/navbar2_dashboard/Navbar2_dashboard";
import Navbar2_chat from "../chat_components/navbar_2_chat/Navbar2_chat";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

function Navbar_2({ user_cred }) {
  const { server_id } = useParams();

  // user details from redux
  const username = useSelector((state) => state.user_info.username);
  const tag = useSelector((state) => state.user_info.tag);
  const profile_pic = useSelector((state) => state.user_info.profile_pic);

  function buttons(message, Icon) {
    return (
      <div className={nav2css.icons}>
        {/* headset tooltip and icon */}
        <OverlayTrigger placement="top" overlay={tooltips(message)}>
          {<Icon fontSize="small" />}
        </OverlayTrigger>
      </div>
    );
  }

  const tooltips = (value, props) => (
    <Tooltip id="button-tooltip" {...props}>
      {value}
    </Tooltip>
  );

  return (
    <div className={nav2css.main}>
      <div>
        {server_id == "@me" || server_id == undefined ? (
          <Navbar2_dashboard></Navbar2_dashboard>
        ) : (
          <Navbar2_chat></Navbar2_chat>
        )}
      </div>
      {/* this div above is here just to seprate above part with the lower part using a grid */}
      <div id={nav2css.footer}>
        <div id={nav2css.profile} className={nav2css.footer_comps}>
          <img src={profile_pic} alt="" />
        </div>
        <div id={nav2css.profile_name_wrap} className={nav2css.footer_comps}>
          <div id={nav2css.profile_name} className={nav2css.profile_name_comps}>
            {username}
          </div>
          <div id={nav2css.tag} className={nav2css.profile_name_comps}>
            #{tag}
          </div>
        </div>
        <div id={nav2css.profile_options} className={nav2css.footer_comps}>
          {buttons("Unmute", MicOffIcon)}
          {buttons("Deafen", HeadsetIcon)}
          {buttons("User Settings", SettingsIcon)}
        </div>
      </div>
    </div>
  );
}

export default Navbar_2;
