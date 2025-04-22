import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserNavbar from "./components/UserNavbar";

const App = () => {
  return (
    <>
      <UserNavbar />

      <div className="layout">
        <div className="main-content">
          <Outlet />
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};
export default App;
