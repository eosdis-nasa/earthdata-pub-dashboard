# Earthdata Pub Dashboard

Code to generate and deploy the dashboard for the Earthdata Pub API.

## Table of Contents

- [Contributing](#contributing)
- [Configuration](#configuration)
- [Installing](#installing)
- [Running](#running)
- [Building](#building)
- [Deploying](#deploying)
- [Testing](#testing)
- [Branching](#branching)
- [Releasing](#releasing)
- [Documentation](#documentation)

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for instruction for contributing to
the EDPub project. Be sure to read that before submitting pull requests.

## Configuration

The dashboard is populated from the Earthdata Pub API. The dashboard has to
point to a working version of the Earthdata Pub API before it is installed and built.

The information needed to configure the dashboard is stored at `app/src/js/config`.

The following environment variables override the default values in `config.js`.
To locate environment variables, see webpack.common.js:

| Env Name | Description | Default |
| -------- | ----------- | -------- |
| APIROOT | the API URL. This must be set by the user. | *<https://pub.earthdata.nasa.gov/api>* |
| OVERVIEW_URL | URL of the instructional overview of Earthdata Pub Dashboard | *<https://pub.earthdata.nasa.gov/>* |
| FORMS_URL | URL of the questions and answer forms that are outside of Earthdata Pub Dashboard | *<https://pub.earthdata.nasa.gov/forms>* |
| NEW_PUBLICATION_REQUEST_URL | URL of the publication request questions and answer forms new record | */interest/daacs/selection* |
| NEW_PRODUCT_INFORMATION_URL | URL of the data product questions and answer forms new record | */questionnaire/questions* |
| PUBLICATION_REQUEST_FORM_ID | Hash of the main publication request form | *6c544723-241c-4896-a38c-adbc0a364293* |
| PRODUCTION_INFORMATION_FORM_ID | Hash of the main publication request form | *19025579-99ca-4344-8610-704dae626343* |
| AWS_REGION | Region in which Earthdata Pub API is running. | *us-west-2*  |
| DAAC_NAME    | e.g. LPDAAC, | *Local* |
| STAGE | e.g. PROD, UAT, | *development* |
| LABELS | gitc or daac localization. | *daac* |
| AUTH_METHOD | The type of authorization method protecting the Earthdata Pub API. [launchpad or earthdata] | *earthdata*  |
| KIBANAROOT | \<optional\> Should point to a Kibana endpoint. Must be set to examine distribution metrics details. | |
| SHOW_DISTRIBUTION_API_METRICS | \<optional\> Display metrics from Earthdata Pub Distribution API.| *false* |
| ESROOT | \<optional\> Should point to an Elasticsearch endpoint. Must be set for distribution metrics to be displayed. | |
| ES_USER | \<optional\> Elasticsearch username, needed when protected by basic authorization | |
| ES_PASSWORD | \<optional\> Elasticsearch password,needed when protected by basic authorization | |

## Installing

The dashboard uses node v12.18.0. To build/run the dashboard on your local
machine, install nvm following the [nvm Install & Update Script](https://github.com/nvm-sh/nvm#install--update-script)
instructions.

We use npm for local package management to install the requirements, but the first
step is to clone the repo!

```bash
git clone https://git.earthdata.nasa.gov/scm/edpub/dashboard.git
cd api
nvm install v12.18.0
nvm use
npm install
```

## Running

### Running locally

```bash
npm install
npm run start
```

### Dashboard and API

The Dashboard application is dependent on the EDPub [API](https://git.earthdata.nasa.gov/projects/EDPUB/repos/api)
and [Forms](https://git.earthdata.nasa.gov/projects/EDPUB/repos/forms).
Follow instructions in each repo or the [EDPub core](https://git.earthdata.nasa.gov/projects/EDPUB/repos/earthdata-pub)
repo.

The API Swagger documentation will available at <http://localhost:8080/docs/>

The Forms will available at <http://localhost:8081/>

#### Troubleshooting local deployement

If you have previously built using docker, you may need to remove docker orphans.

```bash
docker-compose down --remove-orphans
```

#### Troubleshooting docker containers

If something is not running correctly, or you're just interested, you can view
the logs with a helper script, this will print out logs from each of the running
docker containers.

```bash
npm run view-logs
```

This can be helpful in debugging problems with the docker application.

A common error is running the dashboard containers when other containers are
running on your machine. Just stop that stack and restart the dashboard stack
to resolve.

```sh
ERROR: for localapi_shim_1  Cannot start service shim: driver failed programming external connectivity on endpoint localapi_shim_1 (7105603a4ff7fbb6f92211086f617bfab45d78cff47232793d152a244eb16feb): Bind for 0.0.0.0:9200 failed: port is already allocated

ERROR: for shim  Cannot start service shim: driver failed programming external connectivity on endpoint localapi_shim_1 (7105603a4ff7fbb6f92211086f617bfab45d78cff47232793d152a244eb16feb): Bind for 0.0.0.0:9200 failed: port is already allocated
```

#### Troubleshooting npm errors

A permission denied error in an npm run script usually means permissions are
incorrect in `node_modules`. A quick fix is to delete the directory and
reinstall with `npm install`.

## Building

### Building in Docker

The Earthdata Pub Dashboard can be built inside of a Docker container, without
needing to install any local dependencies.

```bash
DAAC_NAME=LPDAAC STAGE=production LABELS=daac APIROOT=https://myapi.com ./bin/build_in_docker.sh
```

**NOTE**: Only the `APIROOT` environment variable is required.

The compiled files will be placed in the `dist` directory.

### Building locally

To build the dashboard:

```bash
nvm use
[SERVED_BY_EDPUB_API=true] [DAAC_NAME=LPDAAC] [STAGE=production] [LABELS=daac] APIROOT=https://myapi.com npm run build
```

**NOTE**: Only the `APIROOT` environment variable is required.

### Building a specific dashboard version

Earthdata Pub Dashboard versions are distributed using tags in Bitbucket. You
can pull a specific version in the following manner:

```bash
git clone https://git.earthdata.nasa.gov/scm/edpub/dashboard.git
cd dashboard
git fetch origin ${tagNumber}:refs/tags/${tagNumber}
git checkout ${tagNumber}
```

Then follow the steps noted above to build the dashboard locally or using Docker.

## Deploying

Deployment is done through Bamboo. The following deprecated instructions are included
in case Bamboo becomes unavailable.

First build the site

```bash
nvm use
npm run build
```

Then deploy the `dist` folder

```bash
aws s3 sync dist s3://my-bucket-to-be-used --acl public-read
```

## Testing

### Unit Tests

```bash
npm run test
```

### Integration & Validation Tests

For the integration tests to work, you have to first run the localstack application,
launch the localAPI and serve the dashboard first. Run the following commands in
separate terminal sessions:

Run background localstack application.

```bash
npm run start-localstack
```

Serve the dashboard web application (another terminal)

```bash
[SHOW_DISTRIBUTION_API_METRICS=true ESROOT=http://example.com APIROOT=http://localhost:8080] npm run serve
```

If you're just testing dashboard code, you can generally run all of the above
commands as a single docker-compose stack.

```bash
npm run start-dashboard
```

This brings up LocalStack, Elasticsearch, the Earthdata Pub localAPI, and the dashboard.

Run the test suite (yet another terminal window)

```bash
npm run validate
npm run cypress
```

When the cypress editor opens, click on `run all specs`.

### Fully contained cypress testing

You can run all of the cypress tests locally that circleCI runs with a single command:

```bash
npm run e2e-tests
```

This will stands up the entire stack as well as begin the e2e service that will
run all cypress commands and report an exit code for their success or failure.
This is primarily used for CircleCI, but can be useful to developers.

Likewise the validation tests can be run with this command:

```bash
npm run validation-tests
```

### Linting

[ESLint](https://github.com/eslint/eslint) is used for linting. It adheres to the
[Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with a few
exceptions. The configuration can be viewed in `eslint.config.json`.

Output from these commands in formatted for [Bamboo](https://www.atlassian.com/software/bamboo)
for use in the CI/CD pipeline.

[Markdownlint](https://github.com/DavidAnson/markdownlint) is used for linting
Markdown. No markdownlint output is used in the CI/CD pipeline.

## Branching

The `master` branch is the branch where the source code of HEAD always reflects
the latest product release. The `test` branch is the branch where the source code
of HEAD always reflects the latest UAT release. The `develop` branch is the branch
where the source code of HEAD always reflects the latest merged development changes
for the next release. The `develop` branch is the branch where we should branch off.

When the source code in the develop branch reaches a stable point and is ready to
be released, all of the changes should be merged back into test and then master and
then tagged with a release number.

## Releasing

See [RELEASE.md](./RELEASE.md).

## Documentation

- [Usage](./USAGE.md)
- [Development Guide](./DEVELOPMENT.md)
- [Technical documentation on tables](./TABLES.md)
