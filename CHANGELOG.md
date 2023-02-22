
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

<!-- Unreleased changes can be added here. -->
- Improved contributor lookup utilizing 1 request.
- Added copy submission functionality to bulk requests button on request detail page.
- Updated Node version to v18.14.1

## 1.0.11 - 2023-02-10

- Applied question privileges to questions page
- Applied REQUEST_ADDUSER and REQUEST_REMOVEUSER to request page.
- Applied privileges to user/overview.js and user/add.js.
- Added REQUEST_ADDUSER and REQUEST_REMOVEUSER for adding and removing contributors in requestPrivileges.
- Added privileges for creating and deleting user to userPrivileges.
- Added adding and removal of contributor to request details page
- Added changing of workflow step to request detail form.
- Added producer name and filter to request pages
- Added level filtering to conversations detail page.
- Add conversations to header
- Changed Hi user to go to user detail page
- Remove locked column from Requests
- Removed request columns widths.
- Change css of header to have no max width
- Left dark blue pane style changes
- Added helpPageDefault config option linking to the Overview apps, 'How to Use Edpub' page

## 1.0.10 - 2022-11-10

- Added adding and editing of workflows in dashboard
- Updated Justin Rice to Doug Newman in footer.js

## 1.0.9 - 2022-11-02

- Added graphical view of workflows using same library as cumulus.

## 1.0.8 - 2022-08-15

- Changed verbage of buttons Approve and Reject to Approve and Return.
- Tweaked approval page after adding GHRC and ORNL workflows.

## 1.0.7 - 2022-06-24

- Changed '(no name)' on request initialization to 'Request Initialized'.

## 1.0.6 - 2022-06-20

- Added creator and daac to request details page.

## 1.0.5 - 2022-06-16

- Updated buttons to have primary secondary classes with icons.

## 1.0.4 - 2022-05-18

- Added config option for mEditor url. Added custom mEditor component. Added events.js.
- Added confirmation dialog skip checkbox option to defaultModal component.  
- Added undo of that feature under a new 'Settings' group in the user detail form.

## 1.0.3 - 2022-05-12

- Updated old form name fragments to current

## 1.0.2 - 2022-05-11

- Updated privileges for next action button and changed adding a disabled class,
to just returning text using new class added, button--clear

## 1.0.2 - 2022-05-05

- Updated forms report for missing labels

## 1.0.1 - 2022-04-13

- Updated to Node v14.19.1

## 1.0.0 - 2022-03-29

- EDPub MVP release

## 0.3.20 - 2022-03-23

- Added html sanitization to questions editing, so that questions links in forms can be shown as links.

## 0.3.19 - 2022-03-22

- Remove verson typo; the version is repeated later anyway

## 0.3.18 - 2022-03-11

- Accessibility updates.

## 0.3.17 - 2022-03-07

- Fixed privileges that got broken from status page update. Reworked workflow next action buttons from changing to 'action' type for approval promote step.

## 0.3.16 - 2022-03-03

- Corrected workflows breadcrumbs to be dynamic and based on assigning or viewing.
- Fixed malformed users link.

## 0.3.15 - 2022-02-25

- Added in Status page for request status grouping.
- Added in Restore feature for withdrawn requests.  Added page for withdrawn requests. 

## 0.3.14 - 2022-02-22

- Added in Restore feature for withdrawn requests.  Added page for withdrawn requests. 
- Added links to request pages to sidebar. Misc minor fixes.

## 0.3.13 - 2022-02-10

- Added in for assignment / reassignment of workflows

## 0.3.12 - 2022-02-03

- Added and adjusted cumulus delete functionality to request detail page

## 0.3.11 - 2022-02-02

- Updated request detail page; updated form.js for multiple paths; added and applied some privileges

## 0.3.10 - 2021-12-10

- Created add/edit question capability to dashboard.

## 0.3.9 - 2021-12-06

- Updated sort/filter/pagination functionality for dashboard tables.

## 0.3.8 - 2021-12-01

- Cleaned up dependencies by removing libraries unused and upgrading libraries that do not result in breaking the dashboard or the build

## 0.3.7 - 2021-11-12

- Eliminated breaking changes from webpack4 upgrade to webpack5

## 0.3.6 - 2021-11-04

- Decoupled form names and ids and updated request.js to get next workflow action
- Reduced vulnerabilities

## 0.3.5 - 2021-10-29

- Decoupled daac selection form

## 0.3.4 - 2021-08-23

- Add NASA Apache 2.0 license
- Updated CONTRIBUTING.md
- Update form names
- Use simple href link in header to allow overview and feedback urls to work
- Add temporary feedback link. Meant to be remove after testing

## 0.3.3 - 2021-08-16

- Update logo and favicon to nasa meatball logo

## 0.3.2 - 2021-08-11

- Added handling of no answer for table format detail

## 0.3.1 - 2021-07-22

- Updated form.js for custom table type input
- Added cloud metrics actions, types and image to index.js, types.js and metrics/overview.js and some general cleanup.
- Added modules page
- Updated header to include overview link
- Added overviewUrl to config so home page displays intro paragraph

## 0.3.0 - 2021-06-29

- Open source release version 0.3.0 [note: this was retroactively renumbered from 1.0 to 0.3 to allow MVP release version]

## 0.2.2 - 2021-06-24

- Fixed css table on scroll breakage

## 0.2.1 - 2021-04-21

- Add dockerfile for bamboo ci/cd
- Added a session timeout warning

## 0.2.0 - 2021-04-01

- Release version 0.2 for testing in SIT

## 0.1.8 - 2021-04-01

- Hide sorting on table headers for testing

## 0.1.7 - 2021-03-31

- Use submission/active endpoint for user submissions
- Added logging for help detecting errors in urls
- Imported logo as image asset
- Fixed slow load of form detail data

## 0.1.6 - 2021-03-30

- Hid unworking forms list for testing

## 0.1.5 - 2021-03-26

- Moved logo to assets to see if on sit it sees the logo
- Hid unworking DatePickerHeader for Testing

## 0.1.4 - 2021-03-23

- Corrected links spelling and variables to forms
- Corrected status so it displays in the requests table

## 0.1.3 - 2021-03-05

- Added daac_id to edit button in form report so it can flow to forms
- Replaced latin on home page to paragraph from google doc - see commit comment
- Updated home page to updated request display
- Changed more submission types to request types;
- Added new buttons and parameters to utils/table-config/requests.js methods;
- Renamed old folder so will error now;
- Added request form_data to form.js to display answers
- Changed submissionId to requestId for path params;
- Corrected some bad api call paths for groups;
- Removed some left over cumulus vars
- Adding forms to requests and altering data flow
- Add pull request template to CONTRIBUTING.md

## 0.1.3 - 2021-03-03

- Fix linting errors except Submissions.
- Add conversations to dashboard.
- Update roles view description column to Description to match other views.

## 0.1.2 - 2021-02-05

- Reapplied submission where it was mass replaced by request
- Replaced submission with request but for the API calls
- Updated submissions on home page
- Updated nav to not have questions and forms
- Fixed form data to display
- Added no name to table config for submissions list
- Updated submission; still need form report or submission report
- Altered list forms for consistent look and feel; users list and groups list displays real data
- Submissions w real data; forms w real data; some side pane links; made look consistant; fixed counts
- Finished schemas
- Removed results from data in REQUESTS
- Altered path files routes to match the others
- Altered component paths to /<component>/id/:<component_id>

## 0.1.1 - 2020-11-25

- Update humans.txt with EDPUB dev team members
- Remove cumulus logos
- Update APIROOT, FORMS_URL and OVERVIEW_URL in examples, defaults, and tests
- Change Earthdatapub string to Earthdata Pub
- Removed env file and removed add user button
- Updated favicon and logo
- Removed the term 'overview' from pages and sidebars
- Added short date formats; updated config for overview_url; updated homepage
- Fixed bad changes to overviews
- Changed to real dates instead of 'fromnow' dates

## 0.0.3 - 2020-10-31

- Remove unused dependencies and remove mock-api
- Make npm run commands to start/stop api and dashboard specific to EDPUB
- Address all 508 compliance issues
- Connect metadata editor status to edpub api services as test for future hooks
- Mitigate vulnerablities
- Connect Questions page to api

## 0.0.2 - 2020-10-16

- Update NPM to 12.19.0, npm audit fix, update multiple packages
- Clean up markdown formatting in documentation

## 0.0.1 - 2020-08-20

- Connect repositories programmatically
