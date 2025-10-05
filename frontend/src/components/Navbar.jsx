import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="nav-tabs">
      <div className="tab-container">
        <NavLink 
          to="/" 
          className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
        >
          Distributions
        </NavLink>
        <NavLink 
          to="/hypothesis" 
          className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
        >
          Hypothesis Testing
        </NavLink>
        <NavLink 
          to="/regression" 
          className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
        >
          Regression Analysis
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;