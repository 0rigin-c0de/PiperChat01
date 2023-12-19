import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Login from "../Login/Login";
import { useState } from "react";
import Loading from "../Loading_page/Loading";

const Auth = (props) => {
  const Navigate = useNavigate();
  // reading data from redux store
  const [auth_check, setauth_check] = useState(null);

  const url = process.env.REACT_APP_URL;

  const private_routes = async () => {
    const res = await fetch(`${url}/verify_route`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
    });
    const data = await res.json();

    if (data.status === 201) {
      setauth_check(true);
    } else {
      setauth_check(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token") === "") {
      setauth_check(false);
    } else {
      private_routes();
    }
  }, [private_routes]);

  return (
    <>
      {auth_check === true ? (
        window.location.pathname === "/" ? (
          Navigate("/channels/@me")
        ) : (
          <Outlet />
        )
      ) : auth_check === false ? (
        <Login />
      ) : (
        <Loading />
      )}
    </>
  );
};

export default Auth;
