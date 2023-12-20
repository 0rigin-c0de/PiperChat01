import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import Main_dashboard from '../dashboard_components/main_dashboard/Main_dashboard';
import Main_chat from '../chat_components/main_chat/Main_chat';
import socket from '../Socket/Socket';
import { update_options } from '../../Redux/options_slice';
import { useDispatch, useSelector } from 'react-redux';
import maincss from '../main/main.module.css'
import CloseIcon from '@mui/icons-material/Close';
import discord_logo from '../../images/discord_logo_3.png'


function Main({user_relations}) {
  const dispatch = useDispatch()
  const id = useSelector(state => state.user_info.id)

  const [req_popup, setreq_popup] = useState({state:'none' , value:false})
  const [req_popup_data, setreq_popup_data] = useState({profile_pic:'' , name:'' , notif_message:'' , id:null})

  const url = process.env.REACT_APP_URL
  const {server_id} = useParams()

  useEffect(()=>{
    if(id!=0){
      socket.emit('get_userid' , id)
    }
  },[id])

  useEffect(()=>{
    if(req_popup_data.id!=null){
      dispatch(update_options())
      setreq_popup({...req_popup , value:false})
    }
    // have to add this condition because otherwise useeffect will run once when the component will load without change in the dependency
    
  },[req_popup_data.id])

  socket.on('recieve_req' ,message=>{
      const {sender_name , sender_profile_pic , sender_id} =  message
      setreq_popup_data({name:sender_name , profile_pic:sender_profile_pic , id:sender_id , notif_message:'Sent you a friend Request'})
      setreq_popup({state:'flex' , value:true})
  })

  socket.on('req_accepted_notif' ,message=>{
    const {sender_id, friend_id , friend_profile_pic ,friend_name} =  message
    setreq_popup_data({name:friend_name , profile_pic:friend_profile_pic , id:sender_id , notif_message:'Accepted your friend Request'})
    setreq_popup({state:'flex' , value:true})
  })

    
  return (
    <div className={maincss.main}>

    <>
        {
            server_id=='@me' ||server_id==undefined?<Main_dashboard user_relations={user_relations}></Main_dashboard>:<Main_chat ></Main_chat>

        }


    </>
      <div className={maincss.notification} style={{display:req_popup.state}}>
        <div className={maincss.notif_top}>
          <div className={maincss.notif_top_left}> <img src={discord_logo} alt="" /> Discord</div>
          <div className={maincss.notif_top_right}><CloseIcon onClick={()=>{setreq_popup({...req_popup , state:'none'})}} fontSize='small'></CloseIcon></div>
        </div>
        <div className={maincss.notif_bottom}>
          <div className={maincss.bottom_left}><img src={req_popup_data.profile_pic} alt="" /></div>
          <div className={maincss.bottom_right}>
            <div className={maincss.bottom_right_comps}>{req_popup_data.name}</div>
            <div className={maincss.bottom_right_comps}>{req_popup_data.notif_message}</div>
          </div>
        </div>
      </div>
    </div>


  )
}

export default Main