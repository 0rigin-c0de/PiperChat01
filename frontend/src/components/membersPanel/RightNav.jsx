import { useParams } from "react-router-dom";
import RightnavChat from "../chat/members/RightnavChat";
import RightnavDashboard from "../friends/members/RightnavDashboard";

function RightNav() {
  const { server_id } = useParams();

  return (
    <div className="h-full border-l border-white/10 bg-black/20">
      <div className="h-full">
        {server_id === "@me" || server_id === undefined ? (
          <RightnavDashboard key="rightnav-dashboard" />
        ) : (
          <RightnavChat key="rightnav-chat" />
        )}
      </div>
    </div>
  );
}

export default RightNav;
