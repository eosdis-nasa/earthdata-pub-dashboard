# earthdata-pub-api/aws-client

## About Cumulus

Cumulus is a cloud-based data ingest, archive, distribution and management prototype for NASA's
future Earth science data streams.

[Cumulus Documentation](https://nasa.github.io/cumulus)

## Checksum

The `earthdata-pub-api/aws-client` library provides checksum functionality used by Cumulus packages and tasks.
Currently the supported input includes file streams, and supported checksum algorithms include
`cksum` and the algorithms available to the `crypto` package, as documented [here](https://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm_options).

## Usage

```js
const fs = require('fs');
const { generateChecksumFromStream } = require('earthdata-pub-api/aws-client');

const stream = fs.createReadStream('myDataFile.hdf');
const myCksum = generateChecksumFromStream('cksum', stream);
```
