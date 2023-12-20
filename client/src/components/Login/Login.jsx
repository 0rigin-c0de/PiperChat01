import React, { useState } from "react";
import login_css from "../Login/login.module.css";
import discord_logo from "../../images/discord_logo.svg";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CloseIcon from "@mui/icons-material/Close";
import Alert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";

function Login() {
  const Navigate = useNavigate();
  const [user_values, setuser_values] = useState({ email: "", password: "" });
  const [alert_box, setalert_box] = React.useState(false);
  const [alert_message, setalert_message] = useState("");
  const url = process.env.REACT_APP_URL;

  const handle_user_values = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setuser_values({ ...user_values, [name]: value });
  };

  const login_req = async (e) => {
    e.preventDefault();
    const { email, password } = user_values;

    const res = await fetch(`${url}/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    // to check if data is coming perfectly or not
    const data = await res.json();

    if (data.status === 442) {
      console.log("invalid username or password");
      setalert_message("invalid username or password");
      setalert_box(true);
    } else if (data.status === 201) {
      localStorage.setItem("token", data.token);
      console.log("succesfully logged in");

      Navigate("/channels/@me");
    } else if (data.status === 422) {
      console.log("not verified yet");
      setalert_message("not verified yet");
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
      {/*Sign in form here  */}
      <form className={login_css.main} action="" onSubmit={login_req}>
        <div className={login_css.login_box}>
          <div className={login_css.wrapper}>
            <div className={login_css.logo}>
              <img src={discord_logo} alt="" />
            </div>
            <h2 className={login_css.components} id={login_css.item_1}>
              PiperChat!
            </h2>
            <div className={login_css.components} id={login_css.item_2}>
              We're so excited to see you again
            </div>
            <div
              className={`${login_css.components} ${login_css.font_styles} ${login_css.input_labels}`}
              id={login_css.item_3}
            >
              EMAIL
            </div>
            <div
              className={`${login_css.components} ${login_css.text_input_fields}`}
              id={login_css.item_4}
            >
              <input
                onChange={handle_user_values}
                name="email"
                value={user_values.email}
                type="email"
                required
              />
            </div>
            <div
              className={`${login_css.components} ${login_css.font_styles} ${login_css.input_labels}`}
              id={login_css.item_5}
            >
              PASSWORD
            </div>
            <div
              className={`${login_css.components} ${login_css.text_input_fields}`}
              id={login_css.item_6}
            >
              <input
                onChange={handle_user_values}
                name="password"
                value={user_values.password}
                type="password"
                required
              />
            </div>
            <div
              className={`${login_css.components} ${login_css.font_styles}`}
              id={login_css.item_7}
            >
              Forgot your password?
            </div>
            <div className={login_css.components} id={login_css.item_8}>
              <button id={login_css.login_button}> Log In</button>
            </div>
            <div
              className={`${login_css.components} ${login_css.font_styles}`}
              id={login_css.item_9}
            >
              <div id={login_css.item_9_1}>Need an account?</div>
              <Link to="/register" id={login_css.item_9_2}>
                Register
              </Link>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

export default Login;
