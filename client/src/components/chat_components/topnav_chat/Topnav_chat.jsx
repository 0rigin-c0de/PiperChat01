import React from 'react'
import topnav_chatcss from '../topnav_chat/topnav_chat.module.css'
import TagIcon from '@mui/icons-material/Tag';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PushPinIcon from '@mui/icons-material/PushPin';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import InboxIcon from '@mui/icons-material/Inbox';
import HelpIcon from '@mui/icons-material/Help';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { useSelector } from 'react-redux';
import LogoutIcon from '@mui/icons-material/Logout';


function Topnav_chat() {

  const channel_name = useSelector(state=>state.current_page.page_name)

    function buttons(message,Icon){
        return(
          <div className={topnav_chatcss.right_comps} onClick={()=>{
            if(message=='Logout'){
              localStorage.clear();     
              window.location.reload();
            }
          }}>
          <OverlayTrigger
            
            placement="bottom"
            overlay={tooltips(message)}>
            {<Icon/>}
          </OverlayTrigger>
        </div>
        )
    }
    
      const tooltips = (value,props) => (
        <Tooltip id="button-tooltip" {...props}>
          {value}
        </Tooltip>
      );
  return (
    <>
        <div className={topnav_chatcss.main_wrap}>
            <div id={topnav_chatcss.left}>
                <TagIcon></TagIcon>
                <div id={topnav_chatcss.channel_name}>
                    {channel_name}
                </div>
            </div>
            <div id={topnav_chatcss.right}>
                {buttons('Notification Settings' , NotificationsIcon)}
                {buttons('Pinned Messages' , PushPinIcon)}
                {buttons('Hide Member List' , PeopleAltIcon)}
                <input placeholder='Search' type="text" />
                {buttons('Inbox' , InboxIcon)}
                {buttons('Logout' , LogoutIcon)}
            </div>
        </div>
    </>
  )
}

export default Topnav_chat