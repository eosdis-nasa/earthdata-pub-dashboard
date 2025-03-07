import React, { useState, useEffect } from "react";
import Paragraph from "./paragraph"; // Paragraph Component
import List from "./list"; // List Component
import "./overview.css";

const Home = () => {
  const [home, setHome] = useState(null);

  useEffect(() => {
    // Fetch JSON from public/assets/home.json
    fetch("/home.json")
      .then((response) => response.json())
      .then((data) => setHome(data))
      .catch((error) => console.error("Error loading home.json:", error));
  }, []);

  if (!home) {
    return <p>Loading...</p>; // Display loading state while fetching
  }

  return (
    <>
      <div className="homepage">
        <div className="mx-5">
          <div className="row pt-5 justify-content-center">
            {/* Main Heading */}
            {home.heading && (
              <h1 className="display-4">
                {home.heading}
                <hr />
              </h1>
            )}

            {/* Render paragraphs dynamically */}
            {home.paragraphs &&
              home.paragraphs.map((section, index) => (
                <React.Fragment key={index}>
                  {/* Sub Heading */}
                  {section.heading && (
                    <h2 className="display-4">
                      {section.heading}
                      <hr />
                    </h2>
                  )}
                  {/* Paragraph Text */}
                  <Paragraph text={section.text} />
                  {/* Bullet List */}
                  {section.list && <List list={section.list} />}
                </React.Fragment>
              ))}
              <h2></h2>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
