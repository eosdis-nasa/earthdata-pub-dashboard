import React from "react";
import { useLocation } from "react-router-dom"; // Import useLocation to get the current path
import "./overview.css"; // Import styling
import Logo from "../../../assets/images/nasa-logo.svg";
import Tophat2 from "./top_hat"
const Header = () => {
  const location = useLocation(); // Get the current URL path
  const url = window.location.href;
  const parts = url.split("/").filter((part, index) => index !== 0 && part !== ""); 
  let pathValue = false;
  if (
    parts[0].includes("localhost") &&
    (!parts[1] || ["getting_started", "data_publication_guidelines", "help", "/"].some(prefix => parts[1]?.startsWith(prefix)))
  ) {
    pathValue = true;
  }  
  
  return (
    <>
      <Tophat2 />
      {/* Blue Logo Bar */}
      <nav className="header">
        <div className="logo-container">
          <img src={Logo} alt="NASA Logo" className="nasa-logo" />
          <span className="site-title">Earthdata Pub</span>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <a href={pathValue ? "/help": "/"} className={location.pathname === "/" || location.pathname === "/help"? "active" : ""}>
            Home
          </a>
          <a
            href="/getting_started"
            className={location.pathname === "/getting_started" ? "active" : ""}
          >
            Getting Started
          </a>
          <a
            href="/data_publication_guidelines"
            className={location.pathname === "/data_publication_guidelines" ? "active" : ""}
          >
            Data Publication Guidelines
          </a>
          <a
            href={pathValue ? "/": "/dashboard"}
            className={location.pathname === "/dashboard" ? "active" : ""}
          >
            Dashboard
          </a>
        </div>
      </nav>
    </>
  );
};

export default Header;
