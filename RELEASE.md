# Releasing Earthdata Pub

## 1. Checkout `develop` branch

We will make changes in the `develop` branch.

## 2. Create a new branch for the release

Create a new branch off of the `develop` branch for the release named
`release/X.X.X` (e.g. `release/1.3.0`) or `feature/name-of-feature`(e.g. `feature/add-calendar-validation`).
A new branch can also be made from a Jira issue.

## 3. Update the version number

When changes are ready to be released, the version number must be updated in `package.json`.

## 4. Update the minimum version of Earthdata Pub API if necessary

See the `minCompatibleApiVersion` value in `app/src/js/config/index.js`.

## 5. Update CHANGELOG.md

Update the CHANGELOG.md. Put a header under the 'Unreleased' section with the
new version number and the date.

## 6. Update the version of the Earthdata Pub API

If this release corresponds to a Earthdata Pub API package release, update the
version of `@earthdata-pub-api/api` to the latest package version so that the
integration tests will run against that version.

## 7. Manual testing

Run the full cypress test suite in [Integration & Validation Tests](integration-validation-tests).

## 8. Create a pull request against the develop branch

Create a PR for the `release/X.X.X` branch against the `develop` branch. Verify
that the Bamboo build for the PR succeeds and then merge to `develop`.

## 9. Create a pull request against the test branch

Create a PR for the `develop` branch against the `test` branch. Verify that
the Bamboo build for the PR succeeds and then merge to `test`. The `test` branch
is pulled to the SIT environment (<https://pub.sit.earthdata.nasa.gov>) by Bamboo.

## 10. Create a pull request against the main branch

Create a PR for the `test` branch against the `main` branch. Verify that
the Bamboo build for the PR succeeds and then merge to `main`. The `main` branch
is pulled to the UAT environment (<https://pub.uat.earthdata.nasa.gov>) by Bamboo.

## 11. Create a git tag for the release

Push a new release tag to github. The tag should be in the format `1.2.3`,
where `1.2.3` is the new version.

Create and push a new git tag:

```bash
git checkout main
git tag -a 1.x.x -m "Release 1.x.x"
git push origin 1.x.x
```

## 12. Add the release to github

Follow the github doc Support for [Managing releases in a repository](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
for the Dashboard using the tag that you just pushed. Make sure to use the content
from the CHANGELOG for this release as the description of the release on github.
