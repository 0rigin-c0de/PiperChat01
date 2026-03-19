import { useSelector } from "react-redux";
import Invalid_navbar from "../invalidSidebar/Navbar2ChatInvalid";
import Valid_navbar from "../serverSidebar/Navbar2ChatValid";
import Loading from "../../loading/Loading";

function Navbar2Chat({ onNavigate }) {
  const server_exists = useSelector(
    (state) => state.currentPage.server_exists
  );

  return (
    <div className="h-full">
      {server_exists == null ? (
        <Loading></Loading>
      ) : server_exists == false ? (
        <Invalid_navbar></Invalid_navbar>
      ) : (
        <Valid_navbar onNavigate={onNavigate}></Valid_navbar>
      )}
    </div>
  );
}

export default Navbar2Chat;
