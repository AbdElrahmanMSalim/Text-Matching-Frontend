import React from "react";
import { Link, NavLink } from "react-router-dom";

const NavBar = ({ user }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <Link className="navbar-brand" to="/">
        Similarity
      </Link>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNavAltMarkup"
        aria-controls="navbarNavAltMarkup"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon" />
      </button>
      <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div className="navbar-nav">
          <NavLink className="nav-item nav-link" to="/upload">
            Upload to DataBase
          </NavLink>
          <NavLink className="nav-item nav-link" to="/test_text">
            Test with text
          </NavLink>
          <NavLink className="nav-item nav-link" to="/test_image">
            Test with image
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
