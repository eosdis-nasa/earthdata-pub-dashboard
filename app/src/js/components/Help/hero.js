import React from "react";
import mainLogo from "../../../assets/images/earth-blue-overlay-cropped-40.svg";
import "./overview.css";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-container">
        <h1 className="hero-title">
          Earthdata Pub is the one-stop shop for researchers who want to publish
          their Earth Science data at a NASA Distributed Active Archive Center (DAAC)
        </h1>
        <button className="btn btn-success" onClick={() => (window.location.href = "/getting_started")}>
          Get Started
        </button>
      </div>
      <img src={mainLogo} alt="Background Globe" className="hero-globe" />
    </section>
  );
};

export default Hero;

