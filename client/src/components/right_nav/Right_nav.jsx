import React from "react";
import rightcss from "../right_nav/right_nav.module.css";
import { useParams } from "react-router-dom";
import Rightnav_chat from "../chat_components/rightnav_chat/Rightnav_chat";
import Rightnav_dashboard from "../dashboard_components/rightnav_dashboard/Rightnav_dashboard";

function Right_nav() {
  const { server_id } = useParams();

  return (
    <div id={rightcss.main_wrap}>
      <div id={rightcss.main}>
        {server_id === "@me" || server_id === undefined ? (
          <Rightnav_dashboard key="rightnav-dashboard" />
        ) : (
          <Rightnav_chat key="rightnav-chat" />
        )}
      </div>
    </div>
  );
}

export default Right_nav;
