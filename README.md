# Earthdata Pub Dashboard

## Documentation

The [cumulus dashboard](https://github.com/nasa/cumulus-dashboard) has a lot of documentation that shows a lot of how Earthdata Pub Dashboard works.  
We used the Cumulus Dashboard as a base of which to build from. 

## Wireframes and mocks

## Configuration

## Building and Quickstarts

The dashboard uses node v12.18.0. To build/run the dashboard on your local
machine, install [nvm](https://github.com/creationix/nvm) and run `nvm install v12.18.0`

We use npm for local package management, to install the requirements:

```bash
  nvm use
  npm install
```

If you need any other docs, the [cumulus dashboard](https://github.com/nasa/cumulus-dashboard) has a lot of documentation that shows a lot of how Earthdata Pub Dashboard works.  
We used the Cumulus Dashboard as a base of which to build from. 

## Building the dashboard

### Building in Docker

#### Build the dashboard to be served by the Earthdata Pub API

### Building a specific dashboard version

## Running the dashboard

### Running locally

npm install
in localAPI: docker-compose down --remove-orphans (if previously built)
in main dir: npm run start-earthdata-pub-api,
npm run start-dashboard
npm run seed-database (You have to wait about 30 seconds for everything to build first),
You may have to click 'log out' then 'log in' for data to appear

http://localhost:3000/

#### local API server

##### Troubleshooting docker containers

##### Troubleshooting npm errors

A permission denied error in an npm run script usually means permissions are
incorrect in `node_modules`. A quick fix is to delete the directory and
reinstall with `npm install`.

#### Fully contained cypress testing

#### <a name=dockerdiagram></a> Docker Container Service Diagram

#### NGAP Sandbox Metrics Development

##### Kibana and Elasticsearch access

### Running locally in Docker

## Deployment Using S3

## Tests

### Unit Tests

## Integration & Validation Tests

## develop vs. master branches

## How to release

### 1. Checkout `develop` branch

### 2. Create a new branch for the release

### 3. Update the version number

### 4. Update the minimum version of Earthdatapub API if necessary

### 5. Update CHANGELOG.md

### 6. Update the version of the Earthdatapub API

### 7. Manual testing

### 8. Create a pull request against the develop branch

### 9. Create a pull request against the master branch

### 10. Create a git tag for the release

### 11. Add the release to GitHub