import React from "react";
import rightnav_chatcss from "../rightnav_chat/rightnav_chat.module.css";
import { useSelector } from "react-redux";

function Rightnav_chat() {
  const all_users = useSelector((state) => state.current_page.members);

  return (
    <div className={rightnav_chatcss.main_wrap}>
      <div className={rightnav_chatcss.main}>
        <div className={rightnav_chatcss.members_length}>
          ALL MEMBERS - {all_users.length}
        </div>
        <div className={rightnav_chatcss.members}>
          {all_users.map((elem, key) => {
            return (
              <div className={rightnav_chatcss.individual_member} key={key}>
                <img src={elem.user_profile_pic} alt="" />

                {elem.user_name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Rightnav_chat;
