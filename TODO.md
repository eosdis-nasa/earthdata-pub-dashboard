# TO-DO

This page serves as a place to collect needed actions.

## Remove Cumulus specific code

1. Remove `SERVED_BY_EDPUB_API` option from earthdata-pub/dashboard. We will
not support this option.
1. Remove tests from `tests/` that do not pertain to EDPUB.

## Updates for actual edpub/api

1. Update Cypress for edpub/api
1. Update docker-compose-cypress.yml so `e2e-tests` work
1. Update docker-compose-validate.yml so `validation-tests` work
1. Update DEVELOPMENT.md

## Fix tests

1. Missing ava valiation tests

    ```bash
    $ npx ava cypress/validation-tests/main-page.js

    ✖ Couldn’t find any files to test
    ```

1. ava fails: 6 tests failed, 2 uncaught exceptions
1. cypress still looking for earthdata-pub-api/api

