import { useState } from "react";
import Sidebar from "../components/ui/dashboard/sidebar.jsx";
import UserInformation from "../components/ui/dashboard/userinformation.jsx";
import Board from "../components/ui/dashboard/board.jsx";
import '../styles/dashboard.css';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import TopBar from "../components/ui/dashboard/topbar.jsx";

const Dashboard = () => {
    const [activePage, setActivePage] = useState("Home");

    return (
        <div className="app-container">
          <Sidebar
            activePage={activePage}
            setActivePage={setActivePage} 
          />
          <div className="main-content">
            <TopBar fullWidth={false} tag={activePage}/>
            <main className="content">
              <TransitionGroup>
                <CSSTransition
                  key={activePage}
                  timeout={300}
                  classNames="page"
                >
                  <div className="flex-1 flex w-full h-full">
                    {activePage === 'Home' && <UserInformation />}
                    {activePage === 'Dashboard' && <Board />}
                  </div>
                </CSSTransition>
              </TransitionGroup>
            </main>
          </div>
        </div>
      );
};

export default Dashboard;
