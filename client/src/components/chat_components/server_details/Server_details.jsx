import React, { useState } from "react";
import servercss from "../server_details/server_details.module.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddIcon from "@mui/icons-material/Add";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import TagIcon from "@mui/icons-material/Tag";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useDispatch, useSelector } from "react-redux";
import { change_page_id, change_page_name } from "../../../Redux/current_page";
import Modal from "react-bootstrap/Modal";
import Radio from "@mui/material/Radio";
import { useParams } from "react-router-dom";
import socket from "../../Socket/Socket";
import { update_options } from "../../../Redux/options_slice";

function Server_details({ new_req_recieved, elem }) {
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [selectedValue, setSelectedValue] = React.useState("");
  const [category_name, setcategory_name] = useState("");
  const [new_channel_name, setnew_channel_name] = useState("");
  const url = process.env.REACT_APP_URL;
  const [channel_creation_progess, setchannel_creation_progess] = useState({
    text: "Create Channel",
    disabled: false,
  });
  const { server_id } = useParams();

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };
  const handleClose = () => {
    setShow(false);
    setchannel_creation_progess({ text: "Create Channel", disabled: false });
  };
  const handleShow = () => setShow(true);

  const [show_channels, setshow_channels] = useState("true");

  function make_channels_visible() {
    if (show_channels == "none") {
      setshow_channels("flex");
    } else {
      setshow_channels("none");
    }
  }

  const create_channel = async () => {
    const res = await fetch(`${url}/add_new_channel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        channel_name: new_channel_name,
        category_id: elem._id,
        channel_type: selectedValue,
        server_id: server_id,
      }),
    });
    const data = await res.json();
    if (data.status == 200) {
      new_req_recieved(1);
      handleClose();
    }
  };

  function change_channel(channel_type, channel_name, channel_id) {
    if (channel_type == "text") {
      dispatch(change_page_name(channel_name));
      dispatch(change_page_id(channel_id));
    }
  }

  return (
    <>
      <div className={servercss.categories}>
        <div
          className={servercss.categories_left}
          onClick={make_channels_visible}
        >
          {show_channels == "none" ? (
            <KeyboardArrowDownIcon fontSize="small"></KeyboardArrowDownIcon>
          ) : (
            <KeyboardArrowUpIcon fontSize="small"></KeyboardArrowUpIcon>
          )}
          {elem.category_name}
        </div>
        <div className={servercss.categories_left}>
          <AddIcon
            onClick={() => {
              handleShow();
              setcategory_name(elem.category_name);
            }}
            fontSize="small"
          ></AddIcon>
        </div>
      </div>
      {elem.channels.map((channel_elem, indexes) => {
        return (
          <div
            key={channel_elem._id}
            className={servercss.channels_wrap}
            style={{ display: show_channels }}
          >
            <div
              className={servercss.channels}
              onClick={() => {
                change_channel(
                  channel_elem.channel_type,
                  channel_elem.channel_name,
                  channel_elem._id
                );
              }}
            >
              {channel_elem.channel_type == "text" ? (
                <TagIcon fontSize="small"></TagIcon>
              ) : (
                <VolumeUpIcon fontSize="small"></VolumeUpIcon>
              )}
              <div className={servercss.channel_name}>
                {channel_elem.channel_name}
              </div>
            </div>
          </div>
        );
      })}

      <Modal
        show={show}
        centered
        onHide={handleClose}
        id={servercss.modal_main_wrap}
      >
        <div className={servercss.modal_main}>
          {/* Header */}
          <div className={servercss.modal_comps} id={servercss.modal_header}>
            <div
              id={servercss.primary_heading}
              className={servercss.header_comps}
            >
              Create Channel
            </div>
            <div
              id={servercss.secondary_heading}
              className={servercss.header_comps}
            >
              in {category_name}
            </div>
          </div>

          {/* Select Channel Type */}
          <div className={servercss.modal_comps} id={servercss.channel_type}>
            CHANNEL TYPE
            <div className={servercss.channel_type_comps}>
              <div className={servercss.channel_type_wrap}>
                <div
                  id={servercss.channel_type_icon}
                  className={servercss.channel_type_comps}
                >
                  <TagIcon></TagIcon>
                </div>
                <div
                  id={servercss.channel_type_disc}
                  className={servercss.channel_type_comps}
                >
                  <div
                    className={`${servercss.channel_type_disc_comps} ${servercss.channel_type_text}`}
                  >
                    Text
                  </div>
                  <div
                    className={`${servercss.channel_type_disc_comps} ${servercss.channel_type_disc_text}`}
                  >
                    Send messages,images,GIFs,emoji
                  </div>
                </div>
                <div className={servercss.select_button}>
                  <Radio
                    checked={selectedValue === "text"}
                    onChange={handleChange}
                    value="text"
                    className={servercss.radio_button}
                    name="radio-buttons"
                  />
                </div>
              </div>
            </div>
            <div className={servercss.channel_type_comps}>
              <div className={servercss.channel_type_wrap}>
                <div
                  id={servercss.channel_type_icon}
                  className={servercss.channel_type_comps}
                >
                  <VolumeUpIcon />
                </div>
                <div
                  id={servercss.channel_type_disc}
                  className={servercss.channel_type_comps}
                >
                  <div
                    className={`${servercss.channel_type_disc_comps} ${servercss.channel_type_text}`}
                  >
                    Voice
                  </div>
                  <div
                    className={`${servercss.channel_type_disc_comps} ${servercss.channel_type_disc_text}`}
                  >
                    Hang out together with voice and screen share
                  </div>
                </div>
                <div className={servercss.select_button}>
                  <Radio
                    checked={selectedValue === "voice"}
                    onChange={handleChange}
                    value="voice"
                    className={servercss.radio_button}
                    name="radio-buttons"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={servercss.modal_comps} id={servercss.channel_name}>
            <div>CHANNEL NAME</div>
            <div className={servercss.input_div}>
              {selectedValue == "text" ? (
                <TagIcon></TagIcon>
              ) : (
                <VolumeUpIcon></VolumeUpIcon>
              )}
              <input
                type="text"
                value={new_channel_name}
                onChange={(e) => {
                  setnew_channel_name(e.target.value);
                }}
                placeholder="new-channel"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className={servercss.modal_comps} id={servercss.modal_buttons}>
            <div>
              <button
                className={servercss.buttons}
                id={servercss.cancel_button}
                disabled={channel_creation_progess.disabled}
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
            <div>
              <button
                className={servercss.buttons}
                disabled={channel_creation_progess.disabled}
                onClick={() => {
                  create_channel();
                  setchannel_creation_progess({
                    ...channel_creation_progess,
                    text: "Creating",
                    disabled: true,
                  });
                }}
                id={servercss.create_button}
              >
                {channel_creation_progess.text}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Server_details;
