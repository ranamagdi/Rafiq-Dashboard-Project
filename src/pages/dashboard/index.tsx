import Sidebar from "../../components/common/SideBar/SideBar";
import SidebarBottom from "../../components/common/SideBar/SidebarBottom";
import { useAppSelector } from "../../hooks/reduxHooks";
import useIsMobile from "../../hooks/useIsMobile";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  const isMobile = useIsMobile();
  const isOpen = useAppSelector((state) => state.slider.isSidebarOpen);
  return (
    <div className="h-screen ">
    <div className="grid grid-cols-12">
      <div className="col-span-12 md:col-span-2">
        <Sidebar />
      </div>

    
      <div className="col-span-12 md:col-span-10 ">
        <Outlet />
        </div>
     
          {isMobile && !isOpen && (
        <SidebarBottom
          collapsed={false}
          isMobile={isMobile}
          activeIndex={0}
          onItemClick={(i) => console.log(i)}
        />
      )}
   
    </div>
    </div>
  );
};
export default Dashboard;
