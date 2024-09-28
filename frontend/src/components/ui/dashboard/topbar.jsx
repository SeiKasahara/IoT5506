import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../button';
import { CSSTransition } from 'react-transition-group';

const MAIN_URL = "/";
const DASHBOARD_URL = "/dashboard";
const SETTING_URL = "/setting";

function TopBar({ tag, fullWidth }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const logout = () => {
    localStorage.setItem("token", "");
    window.location.href = MAIN_URL;
  }

  const Home = () => {
    window.location.href = DASHBOARD_URL;
  }

  const Setting = () => {
    window.location.href = SETTING_URL;
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className={`fixed ${fullWidth ? 'left-0 top-0' : 'left-60 top-5'} h-[65px] ${fullWidth ? 'w-full' : 'w-[calc(100%-260px)]'} bg-volt-background-light-mode flex justify-between items-center px-5 shadow-md rounded-lg z-50`}>
      <div className="text-xl font-bold">
        <h2>{tag}</h2>
      </div>

      <div className="flex items-center gap-4">
        <Button size="topbarbtn">        
          <img
            src="/public/message.svg"
            className="w-5 h-5 filter invert sepia saturate-500 hue-rotate-180"
          />
        </Button>
        <Button size="topbarbtn">          
          <img
            src="/public/notification.svg"
            className="w-5 h-5 filter invert sepia saturate-500 hue-rotate-180"
          />
        </Button>
        <div className="relative cursor-pointer" onClick={toggleDropdown}>
          <img
            src="/public/G-icon02_resize.png"
            alt="Avatar"
            className="w-10 h-10 rounded-full"
          />
        </div>
      </div>
      {showDropdown && (
        <CSSTransition
          in={showDropdown}
          timeout={300}
          classNames={{
            enter: 'opacity-0 transform -translate-y-2',
            enterActive: 'opacity-100 transform translate-y-0 transition-opacity transition-transform duration-300',
            exit: 'opacity-100 transform translate-y-0',
            exitActive: 'opacity-0 transform -translate-y-2 transition-opacity transition-transform duration-300',
          }}
          unmountOnExit
        >
        <div className="absolute w-24 top-20 right-0 bg-volt-background-light-mode shadow-lg rounded-lg overflow-hidden z-50 flex flex-col" ref={dropdownRef}>
          <Button size="sidebarbtn" variant="menu" onClick={Home}>Home</Button>
          <Button size="sidebarbtn" variant="menu" onClick={Setting}>Settings</Button>
          <Button size="sidebarbtn" variant="menu" onClick={logout}>Logout</Button>
        </div>
        </CSSTransition>
      )}
    </div>
  );
}

export default TopBar;
