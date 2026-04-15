import Sidebar from "../../components/common/SideBar/SideBar"
const Dashboard=()=>{
     return (
    <div className="grid grid-cols-12">
          <div className="col-span-12 md:col-span-6">
            <Sidebar/>
          </div>
    </div>
     )


}
export default Dashboard