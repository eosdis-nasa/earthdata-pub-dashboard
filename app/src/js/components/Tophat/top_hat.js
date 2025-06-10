import { useEffect } from "react";
import React from "react";

const Tophat2 = () => {
  useEffect(() => {

    if (!document.getElementById("feedback-script")) {
        const fbmScript = document.createElement("script");
        fbmScript.src = "https://fbm.earthdata.nasa.gov/for/EDPub/feedback.js";
        fbmScript.id = "feedback-script";
        fbmScript.async = true;
        document.body.appendChild(fbmScript);
  
        fbmScript.onload = () => {
          if (window.feedback) {
            window.feedback.init();
          }
        };
      }
      
    // Check if the script is already present
    if (!document.getElementById("earthdata-tophat-script")) {
      const script = document.createElement("script");
      script.src = "https://cdn.earthdata.nasa.gov/tophat2/tophat2.js";
      script.id = "earthdata-tophat-script";
      script.async = true;

      // Set configuration attributes
      script.setAttribute("data-show-fbm", "true"); // Enable Feedback Module
      script.setAttribute("data-fbm-subject-line", "Help with my app"); // Custom subject
      script.setAttribute("data-show-status", "true"); // Enable Status App
      script.setAttribute("data-status-polling-interval", "10"); // Poll every 10 minutes
      script.setAttribute("data-use-fontawesome", "false"); // Disable FontAwesome (if conflicts occur)

      document.body.appendChild(script);
    }
  }, []);

  return <div id="earthdata-tophat2"></div>;
};

export default Tophat2;
