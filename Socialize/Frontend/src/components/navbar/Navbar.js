import React from "react";
import logo from "../../logo.svg";

function Navbar({ userName }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light container-fluid">
      <a className="navbar-brand" href="/">
      <img className="logo" src={logo} style={{height: "8vh"}}/>
      </a>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNavDropdown"
        aria-controls="navbarNavDropdown"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNavDropdown">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <a className="nav-link" href="event">
              Event
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/meetup">
              Meetup
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/studygroup">
              Study Group
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/create">
              Create
            </a>
          </li>
          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle"
              id="navbarDropdownMenuLink"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {userName}
            </a>
            <ul
              className="dropdown-menu"
              aria-labelledby="navbarDropdownMenuLink"
            >
              <li>
                <a className="dropdown-item" href="/user">
                  Profile
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="/logout">
                  Logout
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
