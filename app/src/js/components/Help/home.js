import React from "react";
import HomeData from "./home_data";
import "./overview.css";

const Home = () => {
  return (
    <div className="homepage mx-5">
      <div className="row pt-5 justify-content-center">
        {HomeData.map(section => (
          <div key={section.id} id={section.id} className="mb-4">
            {section.content}
          </div>
        ))}
      </div>
      <h2></h2>
    </div>
  );
};

export default Home;
