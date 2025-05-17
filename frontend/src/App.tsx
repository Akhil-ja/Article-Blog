import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserNavbar from "./components/UserNavbar";

const App = () => {
  return (
    <>
      <UserNavbar />
      <div className="flex min-h-screen">
        <div className="flex-1 bg-gray-100 p-4">
          <Outlet />
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default App;
