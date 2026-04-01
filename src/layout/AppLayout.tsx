import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const AppLayout = () => {
  return (
    <div style={{ display: "flex" }}>
      
      <Sidebar />

      <div style={{ flex: 1 }}>
        <Outlet />
      </div>

    </div>
  );
};

export default AppLayout;