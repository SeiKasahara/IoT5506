import React, { useEffect, useState } from 'react';
import { Button } from '../button';

const SidebarSetting = ({ activePage, setActivePage }) => {
  const [homeVariant, setHomeVariant] = useState("menu");
  const [dashboardVariant, setDashboardVariant] = useState("menu");
  const [IoTVariant, setIoTVariant] = useState("menu");

  useEffect(() => {
    if (activePage === 'Account') {
      setHomeVariant('reverse_menu');
      setDashboardVariant('menu');
      setIoTVariant('menu');
    } else if (activePage === 'Message') {
      setHomeVariant('menu');
      setDashboardVariant('reverse_menu');
      setIoTVariant('menu');
    } else if (activePage === 'BindIOT') {
      setIoTVariant('reverse_menu');
      setHomeVariant('menu');
      setDashboardVariant('menu');
    }
  }, [activePage]);

  return (
    <nav className="w-full bg-volt-background-light-mode shadow-md flex flex-col rounded-lg space-y-4 transition-all duration-300">
        <div className="grid justify-items-center mt-10 p-10">
          <img
            src="/public/G-icon02_resize.png"
            alt="Avatar"
            className="w-20 h-20 rounded-full"
          />
        </div>
      <div className="separator h-0.5 w-40 bg-gray-300 mx-2 self-center"></div>
      <ul className="list-none p-0">
        <li>
          <Button 
            size="sidebarbtn" 
            variant={homeVariant} 
            onClick={() => setActivePage('Account')}
          >
            Account Settings
          </Button>
        </li>
        <li>
          <Button 
            size="sidebarbtn" 
            variant={IoTVariant} 
            onClick={() => setActivePage('BindIOT')}
          >
            Bind your IoT device
          </Button>
        </li>
        <li>
          <Button 
            size="sidebarbtn" 
            variant={dashboardVariant} 
            onClick={() => setActivePage('Message')}
          >
            Message and Mail
          </Button>
        </li>
      </ul>
    </nav>
  );
};

export default SidebarSetting;
