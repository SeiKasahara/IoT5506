import React from 'react';
import { Button } from '../button';

const Sidebar = ({ setActivePage }) => {
  return (
    <nav className="sidebar">
      <div className="logo-container">
        <img src="/public/logo.svg" alt="Logo" className="logo" />
      </div>
      <ul>
        <li>
          <Button size='sidebarbtn' onClick={() => setActivePage('userInformation')}>
            Home
          </Button>
        </li>
        <li>
          <Button size='sidebarbtn' onClick={() => setActivePage('dashboard')}>
            Dashboard
          </Button>
        </li>
      </ul>
    </nav>
  );
}

export default Sidebar;
