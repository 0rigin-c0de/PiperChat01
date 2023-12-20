import * as React from "react";
import registercss from "../Register/register.module.css";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useState, useEffect } from "react";
import discord_logo from "../../images/discord_logo.svg";
import plane from "../../images/plane.png";
import { Link } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

function Register() {
  const Navigate = useNavigate();
  const [days, setdays] = useState([]);
  const [year, setyear] = useState([]);
  const [otp_value, setotp_value] = useState("");
  const [modalShow, setModalShow] = React.useState(false);
  const [alert_box, setalert_box] = React.useState(false);
  const [alert_message, setalert_message] = useState("");
  const [date_validation, setdate_validation] = useState({
    display: "none",
  });
  const [user_values, setuser_values] = useState({
    date_value: "",
    year_value: "",
    month_value: "",
    username: "",
    password: "",
    email: "",
  });
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const url = process.env.REACT_APP_URL;

  const register_req = async (e) => {
    e.preventDefault();
    // here we compare the day that we enter with that of getdate() if  user enter 31 june then getdate() will increment to next month and date will be 1 so it will not be equal to that we enter and the condition will be false
    var dob = `${user_values.month_value} ${user_values.date_value} , ${user_values.year_value}`;
    const d = new Date(dob);
    let day = d.getDate();

    if (user_values.date_value !== day) {
      setdate_validation({
        display: "flex",
      });
    } else {
      console.log("inside here");
      setdate_validation({
        display: "none",
      });

      const { email, password, username } = user_values;

      const res = await fetch(`${url}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          username,
          dob,
        }),
      });

      const data = await res.json();
      console.log(data);

      if (data.status === 201) {
        setModalShow(true);
      } else if (data.status === 202) {
        setalert_message("User Already Exists");
        setalert_box(true);
      } else if (data.status === 204) {
        setalert_message("Field is empty");
        setalert_box(true);
      } else if (data.status === 400) {
        setalert_message("Password must be atleast 7 characters long");
        setalert_box(true);
      }
    }
  };

  const handle_user_values = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setuser_values({ ...user_values, [name]: value });
  };

  const handle_otp = (e) => {
    setotp_value(e.target.value);
  };

  useEffect(() => {
    var min_date = `${new Date().getFullYear()}`;

    console.log("run this use effect");

    if (year.length < 100) {
      for (let index = min_date - 18; index > min_date - 118; index--) {
        setyear((year) => [...year, index]);
      }
    }

    if (days.length < 32) {
      for (let index = 1; index < 32; index++) {
        setdays((days) => [...days, index]);
      }
    }
  }, []);

  const verify_req = async (e) => {
    e.preventDefault();

    const res = await fetch(`${url}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        otp_value,
        email: user_values.email,
      }),
    });

    // to check if data is coming perfectly or not
    const data = await res.json();
    console.log(data);

    if (data.status === 201) {
      Navigate("/");
    } else if (data.status === 432) {
      setalert_message("Incorrect OTP try again");
      setalert_box(true);
    } else if (data.status === 442) {
      setalert_message(
        "Your current OTP has been expired , New otp is sent to your email"
      );
      setalert_box(true);
    }
  };

  return (
    <>
      {/* Alert Box */}
      <Box sx={{ width: "100%", height: "0px" }}>
        <Collapse in={alert_box}>
          <Alert
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setalert_box(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            {alert_message}
          </Alert>
        </Collapse>
      </Box>
      <form className={registercss.main} action="" onSubmit={register_req}>
        <div className={registercss.login_box}>
          <div className={registercss.wrapper}>
            <div className={registercss.logo}>
              <img src={discord_logo} alt="" />
            </div>
            <h2 className={registercss.components} id={registercss.item_1}>
              Create an account
            </h2>
            <div
              className={`${registercss.components} ${registercss.font_styles} ${registercss.input_labels}`}
              id={registercss.item_3}
            >
              EMAIL
            </div>
            <div
              className={`${registercss.components} ${registercss.text_input_fields}`}
              id={registercss.item_4}
            >
              <input
                name="email"
                type="email"
                onChange={handle_user_values}
                value={user_values.email}
                required
              />
            </div>
            <div
              className={`${registercss.components} ${registercss.font_styles} ${registercss.input_labels}`}
              id={registercss.item_33}
            >
              USERNAME
            </div>
            <div
              className={`${registercss.components} ${registercss.text_input_fields}`}
              id={registercss.item_34}
            >
              <input
                name="username"
                onChange={handle_user_values}
                value={user_values.username}
                type="text"
                required
              />
            </div>
            <div
              className={`${registercss.components} ${registercss.font_styles} ${registercss.input_labels}`}
              id={registercss.item_5}
            >
              PASSWORD
            </div>
            <div
              className={`${registercss.components} ${registercss.text_input_fields}`}
              id={registercss.item_6}
            >
              <input
                name="password"
                onChange={handle_user_values}
                value={user_values.password}
                type="password"
                required
              />
            </div>

            <div
              className={`${registercss.components} ${registercss.font_styles} ${registercss.input_labels}`}
              id={registercss.item_7}
            >
              DATE OF BIRTH
            </div>
            <div
              className={`${registercss.components} ${registercss.text_input_fields}`}
              id={registercss.item_8}
            >
              {/* days drop down here */}
              <Box className={registercss.dropdown_box}>
                <FormControl fullWidth required>
                  <InputLabel id={registercss.label}>Date</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id={registercss.select}
                    value={user_values.date_value}
                    onChange={handle_user_values}
                    label="Date"
                    name="date_value"
                  >
                    {days.map((elem, index) => {
                      return (
                        <MenuItem
                          key={`day-${index}`}
                          value={elem}
                          className={registercss.dropdown_color}
                        >
                          {elem}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>

              {/* months drop down here */}
              <Box className={registercss.dropdown_box}>
                <FormControl fullWidth required>
                  <InputLabel id={registercss.label}>Month</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id={registercss.select}
                    onChange={handle_user_values}
                    value={user_values.month_value}
                    name="month_value"
                    label="Month"
                    // onChange={}
                  >
                    {months.map((elem, index) => {
                      return (
                        <MenuItem
                          className={registercss.dropdown_color}
                          value={index + 1}
                        >
                          {elem}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>

              {/* years drop down here */}
              <Box className={registercss.dropdown_box}>
                <FormControl fullWidth required>
                  <InputLabel id={registercss.label}>Year</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id={registercss.select}
                    onChange={handle_user_values}
                    value={user_values.year_value}
                    label="Year"
                    name="year_value"
                    // onChange={handleChange}
                  >
                    {year.map((elem, index) => {
                      return (
                        <MenuItem key={`year-${index}`} value={elem}>
                          {elem}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
            </div>

            <div
              className={registercss.components}
              id={registercss.item_8_1}
              style={date_validation}
            >
              Please enter a valid date of birth
            </div>

            <div className={registercss.components} id={registercss.item_9}>
              <button type="submit" id={registercss.login_button}>
                {" "}
                Continue
              </button>
            </div>
            <div
              className={`${registercss.components} ${registercss.font_styles}`}
              id={registercss.item_10}
            >
              <div id={registercss.item_10_1}>Already have an account?</div>
              <Link to="/" id={registercss.item_10_2}>
                Log in
              </Link>
            </div>
          </div>
        </div>
      </form>

      <Modal
        id={registercss.outer_modal}
        show={modalShow}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <div id={registercss.modal}>
          <div id={registercss.plane_div}>
            <img id={registercss.plane_img} src={plane} alt="paper plane pic" />
          </div>
          <div className={registercss.modal_content}>
            <div className={registercss.header}>Verification for Email</div>
            <div className={registercss.modal_message}>
              We have sent a verification code on your email that you used to
              register kindly check.
            </div>
            <div
              className={`${registercss.components} ${registercss.otp_fiels}`}
            >
              <input
                type="text"
                onChange={handle_otp}
                name="otp"
                placeholder="enter OTP here"
                value={otp_value}
              />
            </div>
            <div className={registercss.verify_button}>
              <button onClick={verify_req} id={registercss.actual_button}>
                Verify
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Register;
