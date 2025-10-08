// src/components/home_data.js
import React from "react";

const HomeData = [
  {
    id: "intro",
    content: (
      <>
        <h1 className="display-4">What is Earthdata Pub?</h1>
        <hr />
        <p>
          Earthdata Pub is a resource center providing information and online tools
          for publishing data at NASA Distributed Active Archive Centers (DAACs).
          Using Earthdata Pub you can:
        </p>
        <ul>
          <li>Learn about the data publication process</li>
          <li>Request to publish your data at a DAAC</li>
          <li>Submit information and files required to publish your data</li>
          <li>Track the publication status of your data</li>
        </ul>
      </>
    ),
  },
  {
    id: "acceptance",
    content: (
      <>
        <h2 className="display-4">Is Your Data Right for a NASA DAAC?</h2>
        <hr />
        <p>
          In order to publish data at a DAAC, it must be approved by the NASA Earth
          Science Data Systems (ESDS) program and the Earth Science Data and
          Information System (ESDIS) project. The following types of Earth Science
          data can be considered for publication at a DAAC:
        </p>
        <ul>
          <li>Produced by NASA science missions</li>
          <li>Produced by scientists at NASA facilities</li>
          <li>Resulting from NASA research program funding</li>
          <li>Resulting from NASA Applied Science funding if aligned with Earth observation data</li>
          <li>Created from NASA data</li>
          <li>Strongly supporting NASA Earth observation data</li>
        </ul>
      </>
    ),
  },
  {
    id: "benefits",
    content: (
      <>
        <h2 className="display-4">Benefits of Publishing Data at a DAAC</h2>
        <hr />
        <p>
          DAACs are domain-focused data repositories supporting the specific needs of
          Earth science disciplines, while also enabling cross-disciplinary data usage.
          When you publish your data with a DAAC:
        </p>
        <ul>
          <li>Your data are citable, giving you credit for their use in research.</li>
          <li>
            Your data are discoverable amidst a vast data catalog of complimentary data
            in NASA’s{" "}
            <a
              title="Earthdata Search"
              href="https://search.earthdata.nasa.gov/search"
              target="_blank"
              rel="noopener noreferrer"
              className="ext"
            >
              Earthdata Search
            </a>
            , increasing the reach and relevance of your data.
          </li>
          <li>
            A broader group of scientists and data users can find, understand, and use
            your data to address a wider variety of questions, now and in the long-term.
          </li>
        </ul>
      </>
    ),
  },
];

export default HomeData;
