import Login from "./components/login/Login";
import Register from "./components/register/Register";
import Dashboard from "./components/dashboard/Dashboard";
import Auth from "./components/auth/Auth";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Invite from "./components/invite/Invite";
import NotificationListener from "./components/notifications/NotificationListener";
import { AnimatePresence } from "framer-motion";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />}></Route>
        <Route element={<Auth />}>
          <Route path="/channels/:server_id" element={<Dashboard />}></Route>
          <Route path="/invite/:invite_link" element={<Invite />}></Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div>
      <Router>
        <NotificationListener />
        <AnimatedRoutes />
      </Router>
    </div>
  );
}

export default App;
