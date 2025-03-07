import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./overview.css";
import chevronRight from "../../../assets/images/layout/chevron-right-icon.svg";
import chevronLeft from "../../../assets/images/layout/chevron-left.svg";
import Bulb from "../../../assets/images/light-bulb.svg";

const DataPublicationGuidelines = () => {
  const [dataPublicationData, setDataPublicationData] = useState(null);
  const [isHidden, setIsHidden] = useState(false);
  const location = useLocation();

  // Define section references, pre-populated with the corresponding section names
  const sectionRefs = {
    guidelines: useRef(null),
    acceptance: useRef(null),
    daacs: useRef(null),
    preparation: useRef(null),
    accession: useRef(null),
    publication: useRef(null),
  };

  useEffect(() => {
    fetch("/data_publication_guidelines.json")
      .then((response) => response.json())
      .then((data) => setDataPublicationData(data))
      .catch((error) => console.error("Error loading data_publication_guidelines.json:", error));
  }, []);

  // Function to scroll smoothly to a section
  const scrollToSection = (id) => {
    const sectionRef = sectionRefs[id]?.current;
    if (sectionRef) {
      sectionRef.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      console.log("Section not found:", id);  // Debugging log
    }
  };

  // Scroll to section if there's a hash in the URL (including navigation from other pages)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", ""); // Get section id from hash
      if (sectionRefs[id]) {
        // Wait for the section to be rendered, then scroll
        const interval = setInterval(() => {
          if (sectionRefs[id]?.current) {
            scrollToSection(id);  // Scroll to the corresponding section
            clearInterval(interval); // Clear the interval once the section is found
          }
        }, 100); // Retry every 100ms until the section is rendered
      } else {
        console.log("Section not found for hash:", id); // Debugging log
      }
    }
  }, [location]);

  // If the data isn't loaded yet, show a loading message
  if (!dataPublicationData || !dataPublicationData.paragraphs) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="getting-started">
      {/* Sidebar (Vertical Navigation Bar) */}
      {!isHidden && (
        <nav className="siderbar-overview">
          <button className="siderbar-overview-toggle openbtn" onClick={() => setIsHidden(true)} id="openButton">
            <img width="40px" src={chevronLeft} />
          </button>
          <ul className="nav flex-column">
            {/* Dynamically create NavLinks based on the sections in the data */}
            {dataPublicationData.paragraphs.map((section, index) => {
              const sectionId = section.heading?.match(/id=['"](.*?)['"]/)?.[1];
              return (
                sectionId && (
                  <li key={index} className="nav-item">
                    <a
                      href={`#${sectionId}`}
                      className="nav-link"
                      onClick={() => scrollToSection(sectionId)} // When clicked, scroll to section
                    >
                      {section.heading ? section.heading.replace(/<[^>]*>/g, "") : `Section ${index + 1}`}
                    </a>
                  </li>
                )
              );
            })}
          </ul>
        </nav>
      )}

      {/* Floating Button to Restore Sidebar */}
      {isHidden && (
        <button className="siderbar-overview-restore closebtn" onClick={() => setIsHidden(false)} id="closeButton">
          <img width="20px" src={chevronRight} />
        </button>
      )}

      {/* Main Content */}
      <main className={`main-content ${isHidden ? "full-width" : ""}`}>
        {dataPublicationData.heading && (
          <div className="get-started" dangerouslySetInnerHTML={{ __html: dataPublicationData.heading }} />
        )}

        {/* Render Sections Dynamically */}
        {dataPublicationData.paragraphs.map((section, index) => {
          const sectionId = section.heading?.match(/id=['"](.*?)['"]/)?.[1];
          return (
            <div
              key={index}
              ref={sectionId ? sectionRefs[sectionId] : null}
              id={sectionId}
              className="mb-4"
            >
              {/* Render Section Heading */}
              {section.heading && (
                <div dangerouslySetInnerHTML={{ __html: section.heading }} className="section-heading" />
              )}

              {/* Render Paragraph Text */}
              {section.text && <p dangerouslySetInnerHTML={{ __html: section.text }} />}

              {/* Render List */}
              {section.list && Array.isArray(section.list) && section.list.length > 0 && (
                <ul className="custom-bullet-list">
                  {section.list.map((item, idx) => (
                    <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ul>
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
                          <div
                            className="tip-box d-flex align-items-center p-2 mt-2 icon-div"
                            style={{ backgroundColor: "#f8f9fa", borderRadius: "5px" }}
                          >
                            <img src={Bulb} alt="Step Icon" className="me-2" width="20" />
                            <span className="icon-text">{'Tip: '}<small>{step.icon_text}</small></span>
                          </div>
                        )}

                        {/* If a step contains multiple paragraphs */}
                        {step.paragraphs && step.paragraphs.map((p, pIndex) => (
                          <p key={pIndex} dangerouslySetInnerHTML={{ __html: p.text }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Render Table if exists */}
              {section.table && (
                <table className="styled-table">
                  {/* Table Caption */}
                  {section.table.caption && <caption className="cap-table">{section.table.caption}</caption>}

                  {/* Table Header - Different Handling for Table 1 and Table 2 */}
                  {section.table.headers && typeof section.table.headers === "string" ? (
                    // If headers are provided as a full <tr> structure (Table 2), render it directly
                    <thead dangerouslySetInnerHTML={{ __html: section.table.headers }} />
                  ) : (
                    // Otherwise, assume single-row headers (Table 1)
                    <thead>
                      <tr>
                        {section.table.heading && Array.isArray(section.table.heading) && section.table.heading.map((heading, idx) => (
                          <th key={idx} dangerouslySetInnerHTML={{ __html: heading }} />
                        ))}
                      </tr>
                    </thead>
                  )}

                  {/* Table Body */}
                  <tbody>
                    {section.table.rows && Array.isArray(section.table.rows) && section.table.rows.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {row.columns && Array.isArray(row.columns) && row.columns.map((col, colIdx) => (
                          <td key={colIdx} dangerouslySetInnerHTML={{ __html: col }} />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default DataPublicationGuidelines;
