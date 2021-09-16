
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## 1.0.4 - 2021-08-23

- [Update form names](e32953e6bb7096f64842e71ff45da5f0a8d79443)
- [Use simple href link in header to allow overview and feedback urls to work](e01623db4d3b27a37ca5f54d85b3875b5f2f8e5c)
- [Add temporary feedback link. Meant to be remove after testing](583a563ed7f4ed7819a7793581d508cba1c58741)

## 1.0.3 - 2021-08-16

- [Update logo and favicon to nasa meatball logo](121f956b61e25fcf95b1d04d0bf46ab43f13fd33)

## 1.0.2 - 2021-08-11

- [Added handling of no answer for table format detail](f45cba40db2799a7d00e6038117125c61bdd6e48)

## 1.0.1 - 2021-07-22

- [Updated form.js for custom table type input](4042a66138f1b79cb69a2d968751a077aaa6bcce)
- [Added cloud metrics actions, types and image to index.js, types.js and metrics/overview.js and some general cleanup.](d4d04938eeb95baf28c1b2d8dd9ef5004aa15095)
- [Added modules page](b14c1391838)
- [Updated header to include overview link](137d68957dd774d9cc2ddc5bfebe003d00eda6d4)
- [Added overviewUrl to config so home page displays intro paragraph](4da69c8c79bf695c8d68a97417a5e0e99dd2ba8f)

## 1.0.0 - 2021-06-29

- [Open source release version 1.0.0](3c72ab0f8f8)

## 0.2.2 - 2021-06-24

- [Fixed css table on scroll breakage](9cd1b0ce1b4ea20e00301fe40d21897595215158)

## 0.2.1 - 2021-04-21

- [Add dockerfile for bamboo ci/cd](7a386b490f5cff3a79147e8afddb3d071b55605a)
- [Added a session timeout warning](61ffffdcb051ac2c8718c8110ededdcc161e3f3b)

## 0.2.0 - 2021-04-01

- [Release version 0.2 for testing in SIT](af788831be352e445d21df8e438fc8a677e1d49d)

## 0.1.8 - 2021-04-01

- [hide sorting on table headers for testing](c84547a55c6bf0880079ae114c67561eef5ebc29)

## 0.1.7 - 2021-03-31

- [Use submission/active endpoint for user submissions](e82f83d6cc136e52b56545186212237c2ec0ca41)
- [Added logging for help detecting errors in urls](63dba13260d66d1855d5f63a8c179b974f7990bd)
- [Imported logo as image asset](2dae94bd88bae5d2fc2fee892481ac157d8d9ea7)
- [Fixed slow load of form detail data](be6daa2fb0fa96bce694040fc0939b11ed29c228)

## 0.1.6 - 2021-03-30

- [Hid unworking forms list for testing](29f961935c1126e8a42ee8d7fe865dadfc1b2706)

## 0.1.5 - 2021-03-26

- [Moved logo to assets to see if on sit it sees the logo](4fba9c52d00111cb6db548d77624fe7f9df36388)
- [hid unworking DatePickerHeader for Testing](a9dfdc43d4846f4f59995fe88c6f26c1daedb634)

## 0.1.4 - 2021-03-23

- [Corrected links spelling and variables to forms](495b0e1d8ffdea1832b7f04e6b6d836af9b4cead)
- [Corrected status so it displays in the requests table](ffa0f9c6be1f89a6726541c7385a2b8bd770c822)

## 0.1.3 - 2021-03-05

- [Added daac_id to edit button in form report so it can flow to forms](1cadbe86ce51c1b2180fd4eb5f12117812c4a1fc)
- [replaced latin on home page to paragraph from google doc - see commit comment](48067fccac196b8c8beaea1dfe6232cc4ee3dc77)
- [updated home page to updated request display](1db428f4e41b2f3e34f95d0af26fc6247b428e62)
- [changed more submission types to request types;](6983bf9321f7e894d25776170f67a7792f3e7855)
- [added new buttons and parameters to utils/table-config/requests.js methods;](dc8deccfa3ab86a2343cccdb45b9e94c9471d5be)
- [renamed old folder so will error now;](6983bf9321f7e894d25776170f67a7792f3e7855)
- [added request form_data to form.js to display answers](6983bf9321f7e894d25776170f67a7792f3e7855)
- [changed submissionId to requestId for path params;](dc8deccfa3ab86a2343cccdb45b9e94c9471d5be)
- [corrected some bad api call paths for groups;](dc8deccfa3ab86a2343cccdb45b9e94c9471d5be)
- [removed some left over cumulus vars](dc8deccfa3ab86a2343cccdb45b9e94c9471d5be)
- [adding forms to requests and altering data flow](9494d9d889b868db1755d75db72f27f7b264903a)
- [add pull request template to CONTRIBUTING.md](416a1b2b4fda50e6faa1ef6503723ea8c18bc726)

## 0.1.3 - 2021-03-03

- [Fix linting errors except Submissions.](566d9a69f05)
- [Add conversations to dashboard.](7b65c199843)
- [Update roles view description column to Description to match other views.](624fd363485)

## 0.1.2 - 2021-02-05

- [reapplied submission where it was mass replaced by request](c2cd2ac2df2597de531f70e4d3df48b6e3b66b3c)
- [replaced submission with request but for the API calls](fc7f8d84d2b)
- [updated submissions on home page](2193559829e)
- [updated nav to not have questions and forms](a036814d40f)
- [fixed form data to display](c534fc5a387)
- [added no name to table config for submissions list](df2937bb0aa)
- [updated submission; still need form report or submission report](6caf4329140)
- [altered list forms for consistent look and feel; users list and groups list displays real data](271256f2ad0)
- [submissions w real data; forms w real data; some side pane links; made look consistant; fixed counts](48af8f77567)
- [finished schemas](a3628680889)
- [removed results from data in REQUESTS](0f576e32f95)
- [altered path files routes to match the others](728d7aea7aa)
- [altered component paths to /<component>/id/:<component_id>](18aa2759b3e)

## 0.1.1 - 2020-11-25

- [Update humans.txt with EDPUB dev team members](764f316d78b6dd556551184d1a57c04eef53e053)
- [remove cumulus logos](fceb4ae2ea54453877178827ab5a998aaddc324d)
- [update APIROOT, FORMS_URL and OVERVIEW_URL in examples, defaults, and tests](a6b9f4955bc2006a06f0eec3c5732fe4a158679b)
- [change Earthdatapub string to Earthdata Pub](a8816f724b3939f2a922f95fcaacd30ae644d011)
- [removed env file and removed add user button](b39bdbff8c9d6ce2e7f2d5e62e26b8d89fdde546)
- [updated favicon and logo](452c4bccb10c834c618c7634d0b2447709b47866)
- [removed the term 'overview' from pages and sidebars](280b119fe6842e7263095ace8ba27d2201d7f27b)
- [Added short date formats; updated config for overview_url; updated homepage](f7387a1779a805532b043115ecbf81285401dc8d)
- [fixed bad changes to overviews](d67ed627e936e02162a65dc5073e9f039196b0ee)
- [changed to real dates instead of 'fromnow' dates](fdd1f3a3db380e4fa8046f277da3dbe4aa56f9da)

## 0.1.0 - 2020-10-31

- [Remove unused dependencies and remove mock-api](52e33e8093cf64226fcde60909e01e024231a3db)
- [Make npm run commands to start/stop api and dashboard specific to EDPUB](c9646c72dcf7bd659f4383dbc5624d524c5c9a5d)
- [Address all 508 compliance issues](db15aa638e2e8c944fcb04d04a2ea70d499ac2a9)
- [Connect metadata editor status to edpub api services as test for future hooks](776d473ef039dfef6caf42ee4efd1a22922808b3)
- [Mitigate vulnerablities](3e39ad3e3c90a860e83e8c648204150fa0f04e24)
- [Connect Questions page to api](841113cc1b7d56211f2bed00be7cb654a224fb15)

## 0.0.2 - 2020-10-16

- [Update NPM to 12.19.0, npm audit fix, update multiple packages](7cc81860677cdec934b78b5da679c34532cdb253)
- [Clean up markdown formatting in documentation](13c9f4a65d307b63b8fcfb9d291fc194eb03a191)

## 0.0.1 - 2020-08-20

- [Connect repositories programmatically](d760d5b3ef88a7576a546429f3b85ae6d18a9f61)
