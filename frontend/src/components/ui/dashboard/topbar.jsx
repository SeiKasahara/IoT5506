import React from 'react';
import '../../../styles/topbar.css';
import { Button } from '../button';

function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <h2>Smart Fridge</h2>
      </div>

      <div className="topbar-center">
        <Button>Messages</Button>
        <Button>Notifications</Button>
      </div>

      <div className="topbar-right">
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
