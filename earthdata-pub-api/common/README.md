# earthdata-pub-api/common

Common libraries used in Cumulus.

## Usage

```bash
  npm install earthdata-pub-api/common
```

## About Cumulus

Cumulus is a cloud-based data ingest, archive, distribution and management prototype for NASA's future Earth science data streams.

[Cumulus Documentation](https://nasa.github.io/cumulus)

## General Utilities

* [earthdata-pub-api/common/aws](./aws.js) - Utilities for working with AWS. For ease of
  setup, testing, and credential management, code should obtain AWS client
  objects from helpers in this module.
* [earthdata-pub-api/common/concurrency](./concurrency.js) - Implementations of
  distributed concurrency primitives (mutex, semaphore) using DynamoDB
* [earthdata-pub-api/common/errors](./errors.js) - Classes for thrown errors
* [earthdata-pub-api/common/local-helpers](./local-helpers.js) - Provides methods for
  setting up message payloads for use in development / local testing
* [earthdata-pub-api/common/log](./log.js) - muting or potentially shipping logs to
  alternative locations
* [earthdata-pub-api/common/string](./docs/API.md#module_string) - Utilities for
  manipulating strings
* [earthdata-pub-api/common/test-utils](./test-utils.js) - Utilities for writing tests
* [earthdata-pub-api/common/URLUtils](./docs/API.md#module_URLUtils) - a collection of
  utilities for working with URLs
* [earthdata-pub-api/common/util](./docs/API.md#module_util) - Other misc general
  utilities

## Contributing

To make a contribution, please [see our contributing guidelines](https://github.com/nasa/cumulus/blob/master/CONTRIBUTING.md).
