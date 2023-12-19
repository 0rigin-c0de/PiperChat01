import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Dashboard from "./components/dashboard/Dashboard";
import Auth from "./components/auth/Auth";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Invite from "./components/Invite/Invite";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route element={<Auth />}>
            <Route path="/" element={<Login />} />
            <Route
              exact
              path="/channels/:server_id"
              element={<Dashboard />}
            ></Route>
            <Route
              exact
              path="/invite/:invite_link"
              element={<Invite />}
            ></Route>
          </Route>
          <Route exact path="/register" element={<Register />}></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
