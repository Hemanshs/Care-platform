import React from 'react';
import { Link } from 'react-router-dom';
import "./css/Sidebar.css";

function Sidebar({ userRole }) {
  return (
    <nav className="sidebar">
      <button className="sidebar-button">
        <Link to="/dashboard">Dashboard</Link>
      </button>
      <button className="sidebar-button">
        <Link to="/profile">Profile</Link>
      </button>
      {userRole === 'seeker' && (
        <button className="sidebar-button">
          <Link to="/create-request">Create a Request</Link>
        </button>
      )}
    </nav>
  );
}

export default Sidebar;
