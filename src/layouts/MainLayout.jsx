import { Outlet } from "react-router-dom" 
import NavBar from "../components/Navbar";
import "./MainLayout.css";

const MainLayout = () => {
    return (
        <div className="web-container">
            <NavBar/>
            <main className="page-container">
                <Outlet/>
            </main>
        </div>
    )
}

export default MainLayout; 