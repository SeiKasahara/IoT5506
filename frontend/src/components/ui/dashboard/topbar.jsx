import React from 'react';
import '../../../styles/topbar.css';
import { Button } from '../button';

function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <h2>Smart Fridge</h2>
      </div>

      <div className="topbar-right">
        <Button size="topbarbtn">        
          <img
          src="/public/message.svg"
          className="btnlogo"
          />
        </Button>
        <Button size="topbarbtn">          
          <img
          src="/public/notification.svg"
          className="btnlogo"
          />
        </Button>
        <img
          src="/public/G-icon02_resize.png"
          alt="Avatar"
          className="avatar"
        />
      </div>
    </div>
  );
}

export default TopBar;
