import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./overview.css";
import chevronRight from '../../../assets/images/layout/chevron-right-icon.svg';
import chevronLeft from '../../../assets/images/layout/chevron-left.svg';
import Bulb from '../../../assets/images/light-bulb.svg';
import Note from '../../../assets/images/sticky-note.svg';
import GettingStartedData from "./getting_started_data";

const GettingStarted = () => {
  const [gettingStartedData, setGettingStartedData] = useState(null);
  const [isHidden, setIsHidden] = useState(false); 
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Get current URL location
  const location = useLocation();

  // Define section references
  const sectionRefs = {
    account: useRef(null),
    accession: useRef(null),
    publication: useRef(null),
    status: useRef(null),
    communicate: useRef(null),
  };

  useEffect(() => {
    setGettingStartedData(GettingStartedData);
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to scroll smoothly to a section
  const scrollToSection = (id) => {
    if (sectionRefs[id]?.current) {
      sectionRefs[id].current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Scroll to section if there's a hash in the URL
useEffect(() => {
  if (location.hash) {
    const id = location.hash.replace("#", ""); // Remove the #
    const interval = setInterval(() => {
      if (sectionRefs[id]?.current) {
        scrollToSection(id);
        clearInterval(interval);
      }
    }, 100);
    setTimeout(() => clearInterval(interval), 5000);
  }
}, [location]);


  if (!gettingStartedData) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="getting-started">
      {/* siderbar-overview (Vertical Navigation Bar) */}
      {!isHidden && (
        <nav className="siderbar-overview">
          {!isMobile && <button className='siderbar-overview-toggle openbtn' onClick={() => setIsHidden(true)} id="openButton"><img width="40px" src={chevronLeft} /></button>}
          <ul className="nav flex-column">
            <li className="nav-item">
              <a href="#account" className="nav-link" onClick={() => scrollToSection("account")}>
                Create an Earthdata Pub Account
              </a>
            </li>
            <li className="nav-item">
              <a href="#accession" className="nav-link" onClick={() => scrollToSection("accession")}>
                Data Accession Request
              </a>
            </li>
            <li className="nav-item">
              <a href="#evaluation" className="nav-link" onClick={() => scrollToSection("evaluation")}>
                Data Evaluation Request
              </a>
            </li>
            <li className="nav-item">
              <a href="#publication" className="nav-link" onClick={() => scrollToSection("publication")}>
                Data Publication Request
              </a>
            </li>
            <li className="nav-item">
              <a href="#status" className="nav-link" onClick={() => scrollToSection("status")}>
                Track Your Request Status
              </a>
            </li>
            <li className="nav-item">
              <a href="#communicate" className="nav-link" onClick={() => scrollToSection("communicate")}>
                Communicate with the DAAC
              </a>
            </li>
          </ul>
        </nav>
      )}

      {/* Floating Button to Restore siderbar-overview */}
      {isHidden && (
        <button className="siderbar-overview-restore closebtn" onClick={() => setIsHidden(false)} id="closeButton"><img width="20px" src={chevronRight} /></button>
      )}

      {/* Main Content (Expands to 100% when siderbar-overview is hidden) */}
      <main className={`main-content ${isHidden ? "full-width" : ""}`}>
        {/* Main Heading */}
        {gettingStartedData.heading && (
          <div className="get-started" dangerouslySetInnerHTML={{ __html: gettingStartedData.heading }} />
        )}

        {/* Render Sections Dynamically */}
        {gettingStartedData.paragraphs &&
          gettingStartedData.paragraphs.map((section, index) => {
            // Extract ID from the section heading
            const sectionId = section.heading?.match(/id=['"](.*?)['"]/)?.[1];

            return (
              <div key={index} ref={sectionId ? sectionRefs[sectionId] : null} id={sectionId} className="mb-4">
                {/* Render Section Heading (If exists) */}
                {section.heading && (
                  <div dangerouslySetInnerHTML={{ __html: section.heading }} className="section-heading" />
                )}

                {/* Render Paragraph Text */}
                {section.text && (
                  <p dangerouslySetInnerHTML={{ __html: section.text }} />
                )}

                {/* Render Steps (If exists) */}
                {section.step && Array.isArray(section.step) ? (
            <div className="mt-4">
              {section.step.map((step, stepIndex) => (
                <div key={stepIndex} className="step-container d-flex align-items-start mb-4">
                  {/* Circle Number */}
                  <div className="step-number d-flex align-items-center justify-content-center me-3">
                    {step.number}
                  </div>

                  {/* Step Content */}
                  <div>
                    <h5 dangerouslySetInnerHTML={{ __html: step.heading }} />
                    <p dangerouslySetInnerHTML={{ __html: step.text }} />
                    
                    {/* If step has an icon */}
                    {step.icon && (
                      <div className="tip-box d-flex align-items-center p-2 mt-2 icon-div" style={{ backgroundColor: "#f8f9fa", borderRadius: "5px", width: "550px"  }}>
                        <div className="icon_box_bulb">
                          <img src={Bulb} alt="Step Icon" className="me-2" width="20" />
                        </div>
                        <span className="icon-text">{'Tip: '}<small>{step.icon_text}</small></span>
                      </div>
                    )}
                    
                    {/* If a step contains multiple paragraphs */}
                    {step.paragraphs && step.paragraphs.map((p, pIndex) => (
                      <React.Fragment key={pIndex}>
                        <p dangerouslySetInnerHTML={{ __html: p.text }} />
                        {p.icon && (
                          <div className="tip-box d-flex align-items-center p-2 mt-2 icon-div" style={{ backgroundColor: "#f8f9fa", borderRadius: "5px", width: "650px" }}>
                            <div className="icon_box">
                              <img src={Note} alt="Step Icon" className="me-2" width="20" />
                            </div>
                            <span className="icon-text">{'Note: '}<small>{p.icon_text}</small></span>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
              </div>
            );
          })}
      </main>
    </div>
  );
};

export default GettingStarted;
