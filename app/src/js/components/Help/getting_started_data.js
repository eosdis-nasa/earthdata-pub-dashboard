// src/components/getting_started_data.js
import React from "react";
import Bulb from "../../../assets/images/light-bulb.svg";
import Note from "../../../assets/images/sticky-note.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle  } from "@fortawesome/free-solid-svg-icons";

const GettingStartedData = [
  {
    id: "intro",
    content: (
      <>
         <div className="get-started">   
            <h1>Getting Started</h1>
         </div>
        <hr />
        <p>
          The steps below will guide you through how to use Earthdata Pub to
          publish your data with a{" "}
          <a
            title="List of NASA DAACs"
            href="data_publication_guidelines#daacs"
          >
            NASA Distributed Active Archive Center (DAAC)
          </a>.
        </p>
        <p>
          For more information on the data publication process, see the{" "}
          <a
            title="data publication process"
            href="data_publication_guidelines#publication"
          >
            Data Publication Process
          </a>{" "}
          section of the{" "}
          <a href="data_publication_guidelines">
            Data Publication Guidelines
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "Create an Earthdata Pub Account",
    content: (
      <>
        <h2 className="display-4">Create an Earthdata Pub Account</h2>
        <hr />
        <p>
          To create an Earthdata Pub account, please{" "}
          <a
            href="#"
            onClick={(e) => {
               e.preventDefault();
               if (window.feedback && typeof window.feedback.showForm === "function") {
                  window.feedback.showForm();
               }
            }}
            >
            contact us
            </a>. If you know
          at which{" "}
          <a href="data_publication_guidelines#daacs">DAAC</a> you would like to
          publish your data, please include that in your request.
        </p>
        <p>
          When your account has been created, you will receive an email with your username and temporary password. 
          You then need to log in and change your password, as the temporary passwords will expire. 
          When you first log in, you will receive instructions on setting up Multi-Factor Authentication (MFA) 
        
        {/* MFA Tooltip */}
        <span className="mfa-tooltip">
         <FontAwesomeIcon
            icon={faInfoCircle }
            style={{ color: "#2276ac", marginLeft: "5px", width: "15px", height: "15px" }}
         />
         <span className="mfa-tooltiptext">
            Earthdata Pub uses MFA, a security system that requires users to provide two or more verification factors to gain access to an account or system. 
            These factors typically include something you know (like a password) and something you have (like a smartphone or security token). 
            MFA is important because it adds an extra layer of protection, significantly reducing the risk of unauthorized access even if one factor, such as a password, is compromised. 
            Please contact us if you have problems setting up or using MFA.
         </span>
         </span>

        </p>
      </>
    ),
  },
  {
    id: "Data Accession Request",
    content: (
      <>
        <h2 className="display-4">Data Accession Request</h2>
        <hr />
        <p>
          If your data have not been assigned to a DAAC, you will need to have
          your data approved through the Data Accession process. For more
          information on this process, see the{" "}
          <a href="/data_publication_guidelines#accession">
            Data Accession Process
          </a>{" "}
          section of the{" "}
          <a href="data_publication_guidelines">
            Data Publication Guidelines
          </a>
          . If your data have already been assigned to a DAAC, and you have
          received a publication code, you can skip to the Data Publication
          Request section. If your data have already been assigned to a DAAC and you have <b>not</b> received a publication code, please <a
            href="#"
            onClick={(e) => {
               e.preventDefault();
               if (window.feedback && typeof window.feedback.showForm === "function") {
                  window.feedback.showForm();
               }
            }}
            >
            contact us
            </a>.
        </p>

        {/* Steps */}
        <div className="step-container">
          <div className="step-number">1</div>
          <div>
            <h5>Start a new Data Accession Request</h5>
            <p>
              Log into the{" "}
              <a href="/dashboard">Earthdata Pub Dashboard</a> with your Earthdata Pub account. To create a Data Accession request, click on “New Request” and select “Data Accession Request”.
            </p>
          </div>
        </div>

        <div className="step-container">
          <div className="step-number">2</div>
          <div>
            <h5>Fill in the Data Accession Request form</h5>
            <p>
              In the <a href="/dashboard">Earthdata Pub Dashboard</a>, click on the “Data Accession Request Form” button in the Next Action column. 
              The information you provide will be used to review and approve your Data Accession Request.
            </p>
            <div className="tip-box d-flex align-items-center p-2 mt-2 icon-div" style={{ backgroundColor: "#f8f9fa", borderRadius: "5px", width: "550px" }}>
               <span className="icon_box_bulb"><img src={Bulb} alt="Tip" width="20" /></span>{" "}
               <span className="icon-text">Tip: You can save your progress and return to the form later.</span>
            </div>
          </div>
        </div>

        <div className="step-container">
          <div className="step-number">3</div>
          <div>
            <h5>Submit your request</h5>
            <p>After you have filled in the Data Accession Request form, click on “Submit” to submit the request. 
               This will initiate the Data Accession process. For more information on this process, see the {''}
               <a href="/data_publication_guidelines#accession">
                  Data Accession Process
               </a>{" "}
               section of the{" "}
               <a href="data_publication_guidelines">
                  Data Publication Guidelines
               </a>.</p>
          </div>
        </div>

        <div className="step-container">
          <div className="step-number">4</div>
          <div>
            <h5>Accession request is completed</h5>
            <p>Your data will be evaluated by NASA Earth Science Data and Information Systems (ESDIS) personnel who will determine whether your data are approved to be published at a DAAC. 
               The decision will be documented in the Earthdata Pub Dashboard, and you will receive an email explaining the decision.</p>
            <p>If your Data Accession request has been approved, you will be assigned to one or more {''} 
               <a href="/data_publication_guidelines#daacs">
                  ESDIS DAACs
               </a>{" "}, and you can move to the data publication process.
            </p>

            <p>In some cases, ESDIS may require an additional DAAC-led evaluation of your request, to determine if the ESDIS archive is the appropriate place for your data. 
               If so, you will be asked to complete a Data Evaluation Request, 
               which you will need to complete and submit to the designated DAAC. For more information on the data evaluation process, please see the {''}
               <a href="/data_publication_guidelines#evaluation">
                   Data Evaluation Process
               </a>{" "}
               section of the{" "}
               <a href="data_publication_guidelines">
                  Data Publication Guidelines
               </a>.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "Data Evaluation Request",
    content: (
      <>
        <h2 className="display-4">Data Evaluation Request</h2>
        <hr />
        <div className="step-container">
          <div className="step-number">1</div>
          <div>
            <h5>Fill in the Data Evaluation Request form if requested to do so by NASA ESDIS staff. Otherwise, this step will be skipped</h5>
            <p>
              In the <a href="/dashboard">Earthdata Pub Dashboard</a>,  click on the “Data Evaluation Request” button in the Next Action column. 
              This button will only appear if NASA ESDIS staff require additional information to evaluate your Data Accession Request. 
              In most cases, this step is not necessary. The information you provide will be used to review and approve your Data Accession Request.
            </p>
          </div>
        </div>
        <div className="step-container">
          <div className="step-number">2</div>
          <div>
            <h5>Upload sample data files</h5>
            <p>
              Use the file upload feature in the Data Evaluation Form to upload at least one sample data file, if available.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "Data Publication Request",
    content: (
      <>
        <h2 className="display-4">Data Publication Request</h2>
        <hr />
        <p>
          Once your data have been assigned to a DAAC, you will receive a publication code that will allow you to complete and submit a Data Publication request form when you are ready to work with the DAAC to prepare and publish your data product(s). 
          If you have been assigned to more than one DAAC, you will be given a separate authorization code for each DAAC you are assigned to. You will need to complete a Data Publication Request for each data product you wish to publish. 
          If you are assigned to more than one DAAC, 
          DAAC staff will contact you with instructions on which data to submit to which DAAC. 
          For more information on the data publication process, 
          please see the {''}
         <a href="/data_publication_guidelines#publication">
               Data Publication Process
         </a>{" "}
         section of the{" "}
         <a href="data_publication_guidelines">
            Data Publication Guidelines
         </a>.
        </p>

        <div className="step-container">
          <div className="step-number">1</div>
          <div>
            <h5>Fill in the Data Publication Request form</h5>
            <p>
              In the{" "}
              <a href="/dashboard">Earthdata Pub Dashboard</a>,  click on the green “New Request” button in the center, about halfway down the page. Choose “Publication Request” in the drop-down menu. 
              You will be prompted to enter a publication code. Enter the code, previously provided, 
              that matches the DAAC to which you want to submit your Request. Complete the form and click on “Submit”. 
              The form will be routed to the appropriate DAAC.
            </p>
            <div className="tip-box d-flex align-items-center p-2 mt-2 icon-div" style={{ backgroundColor: "#f8f9fa", borderRadius: "5px", width: "550px" }}>
               <span className="icon_box_bulb"><img src={Bulb} alt="Tip" width="20" /></span>{" "}
               <span className="icon-text">Tip: You can save your progress and return to the form later.</span>
            </div>
          </div>
        </div>

        <div className="step-container">
          <div className="step-number">2</div>
          <div>
            <h5>Upload sample data files</h5>
            <p>
             Use the file upload feature in the Data Publication Request to upload at least one sample data file, if available.
            </p>
          </div>
        </div>

        <div className="step-container">
          <div className="step-number">3</div>
          <div>
            <h5>Submit your request</h5>
            <p>
               After you have filled in the Data Publication request form, click on “Submit” to submit the request. This will initiate the data publication process.
            </p>
          </div>
        </div>

        <div className="step-container">
          <div className="step-number">4</div>
          <div>
            <h5>Collaborate with the DAAC</h5>
            <p>
               The data publication process is a collaboration between you and the DAAC(s) you are assigned to. The information you provide in the Data Publication form, 
               along with sample data and related documentation, will be reviewed by the DAAC. 
               You may be asked to provide additional information and will receive further instructions for submitting your entire data product.
            </p>
            <p>
               For more information on the typical activities performed during data publication, as well as your role and the role of the DAAC, 
               see the {''}
               <a href="/data_publication_guidelines#publication">
                     Data Publication Process
               </a>{" "}
               section of the{" "}
               <a href="data_publication_guidelines">
                  Data Publication Guidelines
               </a>.
            </p>
            <div className="tip-box d-flex align-items-center p-2 mt-2 icon-div" style={{ backgroundColor: "#f8f9fa", borderRadius: "5px", width: "650px" }}>
              <span className="icon_box"><img src={Note} alt="Note" width="20" /> </span>{" "}
              <span className="icon-text">Note: Some data publication steps and services may vary between DAACs.</span>
            </div>
          </div>
        </div>

        <div className="step-container">
          <div className="step-number">5</div>
          <div>
            <h5>Data product is published</h5>
            <p>
               When your data product has been published, you will receive an email from the DAAC and your request status will be updated in the <a href="/dashboard">Earthdata Pub Dashboard</a>.
            </p>
          </div>
        </div>

         <div className="tip-box d-flex align-items-center p-2 mt-2 icon-div" style={{ backgroundColor: "#f8f9fa", borderRadius: "5px", width: "97%" }}>
            <span className="icon_box_bulb"><img src={Bulb} alt="Tip" width="20" /></span>{" "}
            <span className="icon-text"> Tip: If you are submitting Data Publication Requests for multiple, similar data products, you can clone an existing request and use it as a template for additional requests. On the Requests page, click on the request you want to clone. Click on the <span className='dropdown__options__btn button--green button button--small settings-color'></span> {' '} icon in the upper right corner and select “Clone Request”. Edit the cloned request.</span>
         </div>
      </>
    ),
  },
  {
    id: "Track Your Request Status",
    content: (
      <>
        <h2 className="display-4">Track Your Request Status</h2>
        <hr />
        <p>
          You can track the status of any of your requests on the Requests page of the{" "}
          <a href="/dashboard">Earthdata Pub Dashboard</a>. The Status column provides the current status of your request.
           Clicking on the status will provide additional information.
        </p>
        <p>
            You can also filter your requests by status by using the links on the left side of the Requests page.
        </p>
      </>
    ),
  },
  {
    id: "Communicate with the DAAC",
    content: (
      <>
        <h2 className="display-4">Communicate with the DAAC</h2>
        <hr />
        <p>
          You can use the Conversations page of the{" "}
          <a href="/dashboard">Earthdata Pub Dashboard</a> to communicate with ESDIS or your assigned DAAC(s).
        </p>
      </>
    ),
  },
];

export default GettingStartedData;