import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./overview.css";
import chevronRight from "../../../assets/images/layout/chevron-right-icon.svg";
import chevronLeft from "../../../assets/images/layout/chevron-left.svg";
import GettingStartedData from "./getting_started_data";

const GettingStarted = () => {
  const [isHidden, setIsHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  // Section refs for scroll
  const sectionRefs = GettingStartedData.reduce((acc, section) => {
    acc[section.id] = useRef(null);
    return acc;
  }, {});

  // Resize handling
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll helper
  const scrollToSection = (id) => {
    const sectionRef = sectionRefs[id]?.current;
    if (sectionRef) {
      sectionRef.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Scroll to section if there's a hash in the URL
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      if (sectionRefs[id]) {
        const interval = setInterval(() => {
          if (sectionRefs[id]?.current) {
            scrollToSection(id);
            clearInterval(interval);
          }
        }, 100);
        setTimeout(() => clearInterval(interval), 5000);
      }
    }
  }, [location]);

  return (
    <div className="getting-started">
      {/* Sidebar */}
      {!isHidden && (
        <nav className="siderbar-overview">
          {!isMobile && (
            <button
              className="siderbar-overview-toggle openbtn"
              onClick={() => setIsHidden(true)}
              id="openButton"
            >
              <img width="40px" src={chevronLeft} alt="Collapse Sidebar" />
            </button>
          )}
          <ul className="nav flex-column">
            {GettingStartedData.slice(1).map((section) => (
              <li key={section.id} className="nav-item">
                <a
                  href={`#${section.id}`}
                  className="nav-link"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(section.id);
                  }}
                >
                  {section.id.charAt(0).toUpperCase() + section.id.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Restore Sidebar Button */}
      {isHidden && (
        <button
          className="siderbar-overview-restore closebtn"
          onClick={() => setIsHidden(false)}
          id="closeButton"
        >
          <img width="20px" src={chevronRight} alt="Expand Sidebar" />
        </button>
      )}

      {/* Main Content */}
      <main className={`main-content ${isHidden ? "full-width" : ""}`}>
        {GettingStartedData.map((section) => (
          <div
            key={section.id}
            id={section.id}
            ref={sectionRefs[section.id]}
            className="mb-4"
          >
            {section.content}
          </div>
        ))}
      </main>
    </div>
  );
};

export default GettingStarted;
