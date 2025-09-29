// src/components/data_publication_guidelines_data.js
import React from "react";
import Bulb from "../../../assets/images/light-bulb.svg";
import Note from "../../../assets/images/sticky-note.svg";

const DataPublicationGuidelinesData = [
  {
    id: "guidelines",
    content: (
      <>
         <div className="get-started">   
            <h1 id="guidelines">Data Publication Guidelines</h1>
         </div>
        <hr />
        <p>
          NASA's Earth Science Division (ESD) has a long-standing commitment to
          the full and open sharing of all data with research and applications
          communities, private industry, academia, and the general public, as
          defined in the{" "}
          <a
            title="ESD Data and Information Guidance"
            href="https://www.earthdata.nasa.gov/engage/open-data-services-software-policies/data-information-guidance"
            className="ext"
            target="_blank"
            rel="noreferrer"
          >
            ESD Data and Information Guidance
          </a>
          . For most ESD-funded researchers, the designated repository will be a
          NASA Distributed Active Archive Center (
          <a
            title="DAAC"
            href="https://www.earthdata.nasa.gov/centers"
            className="ext"
            target="_blank"
            rel="noreferrer"
          >
            DAAC
          </a>
          ). NASA DAACs are managed by NASA's Earth Science Data and Information
          System (
          <a
            title="ESDIS"
            href="https://www.earthdata.nasa.gov/about/esdis"
            className="ext"
            target="_blank"
            rel="noreferrer"
          >
            ESDIS
          </a>
          ) Project, part of NASA's Earth Science Data System (
          <a
            title="ESDS"
            href="https://www.earthdata.nasa.gov/about"
            className="ext"
            target="_blank"
            rel="noreferrer"
          >
            ESDS
          </a>
          ) Program.
        </p>
        <p>
          The following documentation provides guidelines to assist with the
          publication of NASA Earth Science at a DAAC. If you have additional
          questions, please{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (window.feedback && typeof window.feedback.showForm === "function") {
                window.feedback.showForm();
              }
            }}
            title="Send feedback using feedback form."
          >
            contact us
          </a>{" "}
          and an Earthdata Pub team member will respond promptly.
        </p>
      </>
    ),
  },
  {
    id: "Data Acceptance Guidelines",
    content: (
      <span className="bullet">
        <h2 className="display-4" id="acceptance">
          Data Acceptance Guidelines
        </h2>
        <hr />
        <p>Data can be considered for publication at a DAAC if any of the following criteria are met:</p>
        <ul>
          <li>Produced by NASA science missions</li>
          <li>Produced by scientists at NASA facilities</li>
          <li>Resulting from NASA research program funding</li>
          <li>Resulting from NASA Applied Science funding if aligned with Earth observation data</li>
          <li>Created from NASA data</li>
          <li>Strongly supporting NASA Earth observation data</li>
        </ul>
        <p>
          All data published at DAACs must be formally approved by NASA and assigned to one or more DAACs.
          For more information on this process, see the{" "}
          <a title="Data Accession Process" href="/data_publication_guidelines#accession">
            Data Accession Process
          </a>{" "}
          section.
        </p>
      </span>
    ),
  },
  {
    id: "The NASA DAACs",
    content: (
      <span className="bullet">
        <h2 className="display-4" id="daacs">The NASA DAACs</h2>
        <hr />
        <p>
          The table below lists the DAACs and their primary scientific disciplines.
          A link to the DAAC website is provided where additional information, including how to contact the DAAC, can be found.
        </p>
        <table className="styled-table  table table-bordered daac-table">
          <thead>
            <tr>
              <th>NASA DAAC</th>
              <th>Scientific Disciplines</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><a href="https://asf.alaska.edu/" className="ext" target="_blank" rel="noreferrer">Alaska Satellite Facility (ASF)</a></td><td>SAR Products, Change Detection, Sea Ice, Polar Processes</td></tr>
            <tr><td><a href="https://asdc.larc.nasa.gov/" className="ext" target="_blank" rel="noreferrer">Atmospheric Science Data Center (ASDC)</a></td><td>Radiation Budget, Clouds, Aerosols, Tropospheric Composition</td></tr>
            <tr><td><a href="https://cddis.nasa.gov/index.htmls" className="ext" target="_blank" rel="noreferrer">Crustal Dynamics Data Information System (CDDIS)</a></td><td>Space Geodesy, Solid Earth</td></tr>
            <tr><td><a href="https://www.earthdata.nasa.gov/centers/ghrc-daac" className="ext" arget="_blank" rel="noreferrer">Global Hydrometeorology Resource Center (GHRC)</a></td><td>Lightning, Severe Weather Interactions, Atmospheric Convection, Hurricanes, Storm-induced Hazards</td></tr>
            <tr><td><a href="https://disc.gsfc.nasa.gov/" className="ext" target="_blank" rel="noreferrer">Goddard Earth Sciences Data and Information Services Center (GES DISC)</a></td><td>Global Precipitation, Solar Irradiance, Atmospheric Composition and Dynamics, Water and Energy</td></tr>
            <tr><td><a href="https://lpdaac.usgs.gov/" className="ext" target="_blank" rel="noreferrer">Land Processes DAAC (LPDAAC)</a></td><td>Land data products</td></tr>
            <tr><td><a href="https://ladsweb.modaps.eosdis.nasa.gov/" className="ext" target="_blank" rel="noreferrer">Level 1 and Atmosphere Archive and Distribution System (LAADS)</a></td><td>MODIS (Moderate Resolution Imaging Spectrometer) Level 1 data (geolocation, L1A, and radiance L1B) and Atmosphere (Level 2 and Level 3)</td></tr>
            <tr><td><a href="https://nsidc.org/data/data-programs/nsidc-daac" className="ext" target="_blank" rel="noreferrer">National Snow and Ice Data Center DAAC (NSIDC DAAC)</a></td><td>Cryospheric Processes, Sea Ice, Snow, Ice Sheets, Frozen Ground, Glaciers, Soil Moisture</td></tr>
            <tr><td><a href="https://daac.ornl.gov/" className="ext" target="_blank" rel="noreferrer">Oak Ridge National Laboratory (ORNL)</a></td><td>Biogeochemical Dynamics, Ecological Data, Environmental Processes</td></tr>
            <tr><td><a href="https://oceancolor.gsfc.nasa.gov/" className="ext" target="_blank" rel="noreferrer">Ocean Biology DAAC (OB.DAAC)</a></td><td>Ocean Biology</td></tr>
            <tr><td><a href="https://podaac.jpl.nasa.gov/" className="ext" target="_blank" rel="noreferrer">Physical Oceanography DAAC (PO.DAAC)</a></td><td>Gravity, Ocean Circulation, Ocean Heat Budget, Ocean Surface Topography, Ocean Temperature, Ocean Waves, Ocean Winds, Ocean Salinity, Surface Water</td></tr>
            <tr><td><a href="https://sedac.ciesin.columbia.edu/" className="ext" target="_blank" rel="noreferrer">Socioeconomic Data and Application Data Center (SEDAC)</a></td><td>Synthesized Earth science and socio-economic data</td></tr>
          </tbody>
            <caption style={{ captionSide: "bottom", textAlign: "left", fontWeight: "500", paddingTop: "8px" }}>
               Table 1. NASA DAACs and Science Disciplines
            </caption>
        </table>
        <p>
          For more information on the DAACs, see the{" "}
          <a
            title="Earthdata EOSDIS DAACs"
            href="https://www.earthdata.nasa.gov/centers"
            className="ext"
            target="_blank"
            rel="noreferrer"
          >
            Earthdata EOSDIS DAACs
          </a>{" "}
          page.
        </p>
      </span>
    ),
  },
  {
    id: "Preparing for Data Publication",
    content: (
      <span className="bullet">
        <h2 className="display-4" id="preparation">Preparing for Data Publication</h2>
        <hr />
        <p>Before submitting a request through Earthdata Pub to publish your data, please:</p>
        <ul>
          <li>
            Review guidance on how to create data and metadata that align with NASA standards
            <ul>
              <li><a href="https://www.earthdata.nasa.gov/about/standards" className="ext" target="_blank" rel="noreferrer">Earth Science Data Standards, Requirements, and References</a></li>
              <li><a href="https://www.earthdata.nasa.gov/esdis/esco/standards-and-practices/data-product-development-guide-for-data-producers" className="ext" target="_blank" rel="noreferrer">Data Product Development Guide for Data Producers</a></li>
            </ul>
          </li>
          <li>Create a sample data file and browse file (if applicable)</li>
          <li>Gather related documentation (e.g., ATBDs, publications)</li>
        </ul>
      </span>
    ),
  },
  {
    id: "Data Accession Process",
    content: (
      <span className="bullet">
        <h2 className="display-4" id="accession">Data Accession Process</h2>
        <hr />
        <p>All data archived and distributed at DAACs must be formally approved by NASA and assigned to one or more DAACs. This process is called “Accession”.</p>
        <p>The NASA Data Accession process is initiated by submitting a Data Accession request in Earthdata Pub. Your request will be routed to NASA’s Earth Science Data and Information Systems project. An assessment of the following will be conducted:</p>
        <ul>
          <li>The alignment of the data with NASA’s <a href="data_publication_guidelines#acceptance" className="ext" target="_blank" rel="noreferrer">Data Acceptance Guidelines</a></li>
          <li>The program(s) and funding source(s) under which the data were, or will be, created.</li>
        </ul>
        <p>
         For most requests, the Data Accession process will result in assignment to one or more DAACs. In some cases, however, you may be asked to submit a Data Evaluation Request. Please see the Data Evaluation Request for more information.
        </p>
      </span>
    ),
  },
  {
    id: "Data Evaluation Process",
    content: (
      <span className="bullet">
        <h2 className="display-4" id="evaluation">Data Evaluation Process</h2>
        <hr />
        <p>In some cases, additional evaluation of your Data Accession Request may be necessary. In such cases, you will be asked to submit a Data Evaluation Request, and a DAAC will be asked to conduct a review of your data. This evaluation will assess:</p>
        <ul>
          <li>The alignment of data file contents and structure with NASA standards</li>
          <li>The appropriate Level of Service and the DAAC resources necessary to achieve the Level of Service</li>
        </ul>
        <p>During the assessment, you may be contacted for additional information or obtain feedback from a User Working Group, an external advisory group representing the DAAC’s scientific discipline. The time required to assign your data product to a DAAC will vary, but it can take several weeks.</p>
        <p>You will be notified of the result of your Data Accession Request. If approved, you can work with the assigned DAAC(s) to publish your data. If not approved, you will be advised of the reasons for the decision.</p>
      </span>
    ),
  },
  {
    id: "Data Publication Process",
    content: (
      <span className="bullet">
        <h2 className="display-4" id="publication">Data Publication Process</h2>
        <hr />
        <p>
          The goal of the data publication process is to make your data Findable, Accessible, Interoperable, and Reusable (
          <a href="https://www.go-fair.org/fair-principles/" className="ext" target="_blank" rel="noreferrer">FAIR</a>). 
          
          The data publication process is a collaboration between you and a DAAC and is initiated by submitting the Data Publication request form in Earthdata Pub. Once your data product has been published, the DAAC will continue to provide support and on-going stewardship of your data product while it remains available to the public.
        </p>
        <p>
The table below summarizes the typical activities performed during and after the publication of your data product, as well as your role and the role of the DAAC in these activities.
        </p>
        <div className="tip-box d-flex align-items-center p-2 mt-2 icon-div" style={{ backgroundColor: "#f8f9fa", borderRadius: "5px", width: "97%" }}>
          <span className="icon_box"><img src={Note} alt="Tip" width="20" /></span>{" "}
          <span className="icon-text">
            Note: The activities you may be asked to perform could differ from what is shown here depending on the mission or project requirements, the data Level of Service, and DAAC-specific processes.
          </span>
        </div>
<table className="table table-bordered styled-table">
  <thead>
    <tr>
      <th rowSpan="2">ROLE</th>
      <th colSpan="3">PUBLICATION</th>
      <th rowSpan="1">POST-PUBLICATION</th>
    </tr>
    <tr>
      <th>Review</th>
      <th>Document &amp; Archive</th>
      <th>Release</th>
      <th>Support &amp; Maintain</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Data Producer</b></td>
      <td>
        <ul>
          <li>Complete Data Accession Request</li>
          <li>Complete Data Evaluation Request, if directed to do so</li>
          <li>Complete Data Publication request for each data product to be published</li>
          <li>Provide sample data</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Produce data and metadata per DAAC specifications</li>
          <li>Provide all data files and other relevant documentation</li>
          <li>Provide code/tools (if available)</li>
          <li>Review DAAC-prepared materials, as needed</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Approve data product release to the public</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>When data creation is ongoing, continue to provide data per agreed delivery frequency</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><b>Data Producer &amp; DAAC</b></td>
      <td>
        <ul>
          <li>Determine appropriate data product <a href="https://www.earthdata.nasa.gov/engage/submit-data/level-service-model" className="ext" target="_blank" rel="noreferrer">Level of Service (LoS)</a></li>
          <li>Determine appropriate data and metadata requirements</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Test data ingest</li>
          <li>Curate content in user guides and related documentation</li>
          <li>Test relevant tools and services</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Conduct pre-release review of data product and related information and services</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Provide assistance to data users as needed</li>
          <li>Address errors and issues with data and metadata, as needed</li>
          <li>Maintain and update metadata, documentation, and web pages, as needed</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><b>DAAC</b></td>
      <td>
        <ul>
          <li>Review Data Evaluation Request, if applicable.</li>
          <li>Review Data Publication request</li>
          <li>Assess and plan for data storage needs</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Establish data product DOI and citation</li>
          <li>Curate metadata to support data ingest and discovery</li>
          <li>Ingest all data files</li>
          <li>Configure existing or create new tools and services, per the <a href="https://www.earthdata.nasa.gov/engage/submit-data/level-service-model" className="ext" target="_blank" rel="noreferrer">Level of Service (LoS)</a></li>
          <li>Verify data accessibility in all supported distribution methods</li>
          <li>Generate data product landing page</li>
          <li>Create outreach materials, per the <a href="https://www.earthdata.nasa.gov/engage/submit-data/level-service-model" className="ext" target="_blank" rel="noreferrer">Level of Service (LoS)</a></li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Release data product to the public and make it discoverable</li>
          <li>Activate data product DOI and landing page</li>
          <li>Activate metrics tracking</li>
          <li>Announce the release of data product</li>
        </ul>
      </td>
      <td>
        <ul>
          <li>Serve as primary point-of-contact with data users</li>
          <li>When data creation is ongoing, continue to ingest data and make accessible in all supported distribution methods</li>
          <li>Conduct data product outreach, per the <a href="https://www.earthdata.nasa.gov/engage/submit-data/level-service-model" className="ext" target="_blank" rel="noreferrer">Level of Service (LoS)</a></li>
          <li>Maintain and update tools and services, as needed</li>
          <li>Track data product usage metrics</li>
        </ul>
      </td>
    </tr>
  </tbody>
  <caption style={{ captionSide: "bottom", textAlign: "left", fontWeight: "500", paddingTop: "8px" }}>
    Table 2. Summary of Data Publication Activities
  </caption>
</table>

        <p>
The length of time required to publish your data product will vary depending on the complexity, the volume of the data, and the designated Level of Service. The DAAC publishing your data product can provide a publication time estimate.
        </p>
      </span>
    ),
  },
];

export default DataPublicationGuidelinesData;
