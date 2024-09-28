import React, { useEffect, useState } from 'react';
import { Button } from '../button';

const Sidebar = ({ activePage, setActivePage }) => {
  const [homeVariant, setHomeVariant] = useState("menu");
  const [dashboardVariant, setDashboardVariant] = useState("menu");

  useEffect(() => {
    if (activePage === 'Home') {
      setHomeVariant('reverse_menu');
      setDashboardVariant('menu');
    } else if (activePage === 'Dashboard') {
      setHomeVariant('menu');
      setDashboardVariant('reverse_menu');
    }
  }, [activePage]);

  return (
    <nav className="sidebar fixed left-5 top-5 bottom-5 w-52 bg-volt-background-light-mode shadow-md flex flex-col rounded-lg transition-all duration-300">
      <div className="logo-container flex justify-center my-5 flex-col items-center">
        <img src="/public/logo.svg" alt="Logo" className="logo w-24 h-auto" />
        <div className="text-sm mt-2">Smart Fridge 0.1a</div>
      </div>
      <div className="separator h-0.5 w-40 bg-gray-300 mx-2 self-center"></div>
      <ul className="list-none p-0">
        <li className="m-0">
          <Button size='sidebarbtn' variant={homeVariant} onClick={() => setActivePage('Home')}>
            Home
          </Button>
        </li>
        <li className="m-0">
          <Button size='sidebarbtn' variant={dashboardVariant} onClick={() => setActivePage('Dashboard')}>
            Dashboard
          </Button>
        </li>
      </ul>
      <div className="separator h-0.5 w-40 bg-gray-300 mx-2 self-center"></div>
    </nav>
  );
}

export default Sidebar;
