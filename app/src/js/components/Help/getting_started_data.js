const GettingStartedData = {
    "id":5,
    "heading":"<h1>Getting Started<hr></h1>",
    "paragraphs":[
      {
         "text":"The steps below will guide you through how to use Earthdata Pub to publish your data with a <a title='List of NASA DAACs' href='data_publication_guidelines#daacs'>NASA Distributed Active Archive Center (DAAC)</a>."
      },
       {
          "text":"For more information on the data publication process, see the <a title='data publication process' href='data_publication_guidelines#publication'>Data Publication Process</a> section of the <a href='data_publication_guidelines' name='Data Publication Guidelines' link_title='Data Publication Guidelines' link_text='Data Publication Guidelines'>Data Publication Guidelines</a>."
       },
       {
         "heading":"<h2 class='display-4' id='account'>Create an Earthdata Pub Account<hr></h2>",
         "text":"To create an Earthdata Pub account, please <a href='javascript:feedback.showForm();' title='Send feedback using feedback form.'>contact us</a>. If you know at which <a title='List of NASA DAACs' href='data_publication_guidelines#daacs'>DAAC</a> you would like to publish your data, please include that in your request. "
       },
       {
         "text": `When your account has been created, you will receive an email with your username and temporary password. You then need to log in and change your password, as the temporary passwords will expire. When you first log in, you will receive instructions on setting up Multi-Factor Authentication (MFA) <style>.mfa-tooltip { position: relative; display: inline-block;}.mfa-tooltip .mfa-tooltiptext { visibility: hidden; width: 500px; background-color: #555; color: #fff; text-align: center; border-radius: 6px; padding: 5px 0; position: absolute; z-index: 1; top: 125%; left: 50%; margin-left: -250px; opacity: 0; transition: opacity 0.3s;}.mfa-tooltip .mfa-tooltiptext::after { content: ""; position: absolute; bottom: 100%; left: 50%; margin-left: -5px; border-width: 5px; border-style: solid; border-color: transparent transparent #555 transparent;}.mfa-tooltip:hover .mfa-tooltiptext { visibility: visible; opacity: 1;}</style><div class="mfa-tooltip"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="circle-info" class="svg-inline--fa fa-circle-info " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#2276ac" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"></path></svg><span class="mfa-tooltiptext">Earthdata Pub uses MFA, a security system that requires users to provide two or more verification factors to gain access to an account or system. These factors typically include something you know (like a password) and something you have (like a smartphone or security token). MFA is important because it adds an extra layer of protection, significantly reducing the risk of unauthorized access even if one factor, such as a password, is compromised. Please contact us if you have problems setting up or using MFA.</span></div>`
      },
       {
          "heading":"<h2 class='display-4' id='accession'>Data Accession Request<hr></h2>",
          "text":"If your data have not been assigned to a DAAC, you will need to have your data approved through the Data Accession process. For more information on this process, see the <a title='Data Accession Process' href='/data_publication_guidelines#accession'>Data Accession Process</a> section of the <a href='data_publication_guidelines' name='Data Publication Guidelines' link_title='Data Publication Guidelines' link_text='Data Publication Guidelines'>Data Publication Guidelines</a>. If your data have already been assigned to a DAAC, and you have received a publication code, you can skip to the Data Publication Request section. If your data have already been assigned to a DAAC and you have <b>not</b> received a publication code, please <a href='javascript:feedback.showForm();' title='Send feedback using feedback form.'>contact us</a>."
       },
       {
          "step":[
             {
                "number":1,
                "heading":"<span class='main-width sections'><b>Start a new Data Accession Request</b></span>",
                "text":"Log into the <a title='Earthdata Pub Dashboard' href='/dashboard'>Earthdata Pub Dashboard</a> with your Earthdata Pub account. To create a Data Accession request, click on “New Request”  and select “Data Accession Request”."
             },
             {
                "number":2,
                "heading":"<span class='main-width sections'><b>Fill in the Data Accession Request form</b></span>",
                "text":"In the <a title='Earthdata Pub Dashboard' href='/dashboard'>Earthdata Pub Dashboard</a>, click on the “Data Accession Request Form” button in the Next Action column. The information you provide will be used to review and approve your Data Accession Request. ",
                "icon":"lightbulb.svg",
                "icon_text":"You can save your progress and return to the form later."
             },
             {
                "number":3,
                "heading":"<span class='main-width sections'><b>Submit your request</b></span>",
                "text":"After you have filled in the Data Accession Request form, click on “Submit” to submit the request. This will initiate the Data Accession process. For more information on this process, see the <a title='Data Accession Process' href='/data_publication_guidelines#accession'>Data Accession Process</a> section of the <a href='data_publication_guidelines' name='Data Publication Guidelines' link_title='Data Publication Guidelines' link_text='Data Publication Guidelines'>Data Publication Guidelines</a>."
             },
             {
                "number":4,
                "heading":"<span class='main-width sections'><b>Accession request is completed</b></span>",
                "paragraphs": [
                  {
                     "text":"Your data will be evaluated by NASA Earth Science Data and Information Systems (ESDIS) personnel who will determine whether your data are approved to be published at a DAAC. The decision will be documented in the Earthdata Pub Dashboard, and you will receive an email explaining the decision."
                  },
                  {
                     "text":"If your Data Accession request has been approved, you will be assigned to one or more <a title='List of NASA DAACs' href='data_publication_guidelines#daacs'>ESDIS DAACs</a>, and you can move to the data publication process."
                  },
                  {
                     "text": "In some cases, ESDIS may require an additional DAAC-led evaluation of your request, to determine if the ESDIS archive is the appropriate place for your data. If so, you will be asked to complete a Data Evaluation Request, which you will need to complete and submit to the designated DAAC. For more information on the data evaluation process, please see the <a title='Data Evaluation Process' href='/data_publication_guidelines#evaluation'>Data Evaluation Process</a> section of the <a href='data_publication_guidelines' name='Data Publication Guidelines' link_title='Data Publication Guidelines' link_text='Data Publication Guidelines'>Data Publication Guidelines</a>."
                  }
               ]
            }
          ]
       },
       {
         "heading":"<h2 class='display-4' id='evaluation'>Data Evaluation Request<hr></h2>"
       },
       {
         "step": [
            {
               "number":1,
               "heading":"<span class='main-width sections'><b>Fill in the Data Evaluation Request form if requested to do so by NASA ESDIS staff.  Otherwise, this step will be skipped.</b></span>",
               "text": "In the <a title='Earthdata Pub Dashboard' href='/dashboard'>Earthdata Pub Dashboard</a>, click on the “Data Evaluation Request” button in the Next Action column. This button will only appear if NASA ESDIS staff require additional information to evaluate your Data Accession Request. In most cases, this step is not necessary. The information you provide will be used to review and approve your Data Accession Request."
            },
            {
               "number":2,
               "heading":"Upload sample data files.",
               "text":"Use the file upload feature in the Data Evaluation Form to upload at least one sample data file, if available."
            }
         ]
       },
       {
          "heading":"<h2 class='display-4' id='publication'>Data Publication Request<hr></h2>",
          "text":"Once your data have been assigned to a DAAC, you will receive a publication code that will allow you to complete and submit a Data Publication request form when you are ready to work with the DAAC to prepare and publish your data product(s). If you have been assigned to more than one DAAC, you will be given a separate authorization code for each DAAC you are assigned to. You will need to complete a Data Publication Request for each data product you wish to publish. If you are assigned to more than one DAAC, DAAC staff will contact you with instructions on which data to submit to which DAAC. For more information on the data publication process, see the <a title='data publication process' href='data_publication_guidelines#publication'>Data Publication Process</a> section of the <a href='data_publication_guidelines' name='Data Publication Guidelines' link_title='Data Publication Guidelines' link_text='Data Publication Guidelines'>Data Publication Guidelines</a>."
       },
       {
          "step":[
             {
                "number":1,
                "heading":"<span class='main-width sections'><b>Fill in the Data Publication Request form</b></span>",
                 "text":"In the <a title='Earthdata Pub Dashboard' href='dashboard/'>Earthdata Pub Dashboard</a>, click on the green “New Request” button in the center, about halfway down the page.  Choose “Publication Request” in the drop-down menu. You will be prompted to enter a publication code. Enter the code, previously provided, that matches the DAAC to which you want to submit your Request. Complete the form and click on “Submit”. The form will be routed to the appropriate DAAC.",
                "icon":"lightbulb.svg",
                "icon_text":"You can save your progress and return to the form later."
             },
             {
               "number":2,
               "heading": "Upload sample data files.",
               "text": "Use the file upload feature in the Data Publication Request to upload at least one sample data file, if available."
             },
             {
                "number":3,
                "heading":"<span class='main-width sections'><b>Submit your request</b></span>",
                "text":"After you have filled in the Data Publication request form, click on “Submit” to submit the request. This will initiate the data publication process."
             },
             {
                "number":4,
                "heading":"<span class='main-width sections'><b>Collaborate with the DAAC</b></span>",
                "paragraphs": [
                  {
                     "text":"The data publication process is a collaboration between you and the DAAC(s) you are assigned to. The information you provide in the Data Publication form, along with sample data and related documentation, will be reviewed by the DAAC. You may be asked to provide additional information and will receive further instructions for submitting your entire data product."
                  },
                  {
                      "text":"For more information on the typical activities performed during data publication, as well as your role and the role of the DAAC, see the <a title='data publication process' href='data_publication_guidelines#publication'>Data Publication Process</a> section of the <a href='data_publication_guidelines' name='Data Publication Guidelines' link_title='Data Publication Guidelines' link_text='Data Publication Guidelines'>Data Publication Guidelines</a>."
                  },
                  {
                     "icon":"sticky-note.svg",
                     "icon_text":"Some data publication steps and services may vary between DAACs."
                  }
                ]
             },
             {
               "number":5,
               "heading":"<span class='main-width sections'><b>Data product is published</b></span>",
                "text":"When your data product has been published, you will receive an email from the DAAC and your request status will be updated in the <a title='Earthdata Pub Dashboard' href='dashboard'>Earthdata Pub Dashboard</a>."
            }
          ]
       },
       {
          "heading":"<h2 class='display-4' id='status'>Track Your Request Status<hr></h2>",
           "text":"You can track the status of any of your requests on the Requests page of the <a title='Earthdata Pub Dashboard' href='dashboard'>Earthdata Pub Dashboard</a>. The Status column provides the current status of your request. Clicking on the status will provide additional information. "
       },
       {
          "text":"You can also filter your requests by status by using the links on the left side of the Requests page. "
       },
       {
         "heading":"<h2 class='display-4' id='communicate'>Communicate with the DAAC<hr></h2>",
          "text":"You can use the Conversations page of the <a title='Earthdata Pub Dashboard' href='dashboard'>Earthdata Pub Dashboard</a> to communicate with ESDIS or your assigned DAAC(s)."
      }
    ]
};

export default GettingStartedData;
