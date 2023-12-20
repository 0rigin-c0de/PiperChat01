import React from "react";
import topnavcss from "../top_nav/top_nav.module.css";
import Topnav_chat from "../chat_components/topnav_chat/Topnav_chat";
import Topnav_dashboard from "../dashboard_components/top_nav_dashboard/Topnav_dashboard";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

function Top_nav({ button_status }) {
  const page_check = useSelector((state) => state.current_page.is_dashboard);
  const { server_id } = useParams();

  return (
    <div id={topnavcss.main}>
      {server_id == "@me" ? (
        <Topnav_dashboard button_status={button_status}></Topnav_dashboard>
      ) : (
        <Topnav_chat></Topnav_chat>
      )}
    </div>
  );
}

export default Top_nav;
