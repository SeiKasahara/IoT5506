import { useState } from "react";
import Sidebar from "../components/ui/dashboard/sidebar.jsx";
import UserInformation from "../components/ui/dashboard/userinformation.jsx";
import Board from "../components/ui/dashboard/board.jsx"
import '../styles/dashboard.css';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import TopBar from "../components/ui/dashboard/topbar.jsx";

const Dashboard = () => {
    const [activePage, setActivePage] = useState("userInformation");
    return (
        <div className="app-container">
          <Sidebar setActivePage={setActivePage} />
          <div className="main-content">
            <TopBar />
            <main className="content">
              <TransitionGroup>
                <CSSTransition
                  key={activePage}
                  timeout={300}
                  classNames="page"
                >
                  <div>
                    {activePage === 'userInformation' && <UserInformation />}
                    {activePage === 'dashboard' && <Board />}
                  </div>
                </CSSTransition>
              </TransitionGroup>
            </main>
          </div>
        </div>
      );
};

export default Dashboard;