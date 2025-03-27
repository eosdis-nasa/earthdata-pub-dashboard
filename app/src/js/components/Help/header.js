import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./overview.css";
import Logo from "../../../assets/images/nasa-logo.svg";
import Logo2 from "../../../assets/images/nasa-meatball-new.svg";
import Logo3 from "../../../assets/images/nasa-outline-new.svg";
import Tophat2 from "./top_hat";

const Header = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      <nav className="header">
        <div className="logo-container">
          <img src={Logo3} alt="NASA Logo" className="nasa-logo logo3" />
          <img src={Logo2} alt="NASA Logo 2" className="nasa-logo logo2" />
          <span className="site-title">Earthdata Pub</span>
        </div>

        {isMobile && (
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>
        )}

        <div className={`nav-links ${menuOpen ? "open full-width" : ""}`}>
          <a href={pathValue ? "/help": "/"} className={location.pathname === "/" || location.pathname === "/help" ? "active" : ""}>
            Home
          </a>
          <a href="/getting_started" className={location.pathname === "/getting_started" ? "active" : ""}>
            Getting Started
          </a>
          <a href="/data_publication_guidelines" className={location.pathname === "/data_publication_guidelines" ? "active" : ""}>
            Data Publication Guidelines
          </a>
          <a href={pathValue ? "/": "/dashboard"} className={location.pathname === "/dashboard" ? "active" : ""}>
            Dashboard
          </a>
        </div>
      </nav>

      <style>
        {`
          @media (max-width: 768px) {
            .header {
              display: flex;
              flex-direction: column;
              text-align: center;
              padding: 10px;
              width: 100%;
            }
            .logo-container {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .menu-toggle {
              display: block;
              background: none;
              border: none;
              font-size: 24px;
              cursor: pointer;
              padding: 10px;
            }
            .nav-links {
              display: none;
              flex-direction: column;
              align-items: center;
              gap: 10px;
              width: 100%;
              transition: width 0.3s ease-in-out;
            }
            .nav-links.open {
              display: flex;
              width: 100%;
            }
          }
        `}
      </style>
    </>
  );
};

export default Header;