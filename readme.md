# hafas-rest-api-client

**A client for [`hafas-rest-api`](https://github.com/public-transport/hafas-rest-api) endpoints**, e.g. for [the `*.transport.rest` APIs](https://transport.rest/).

[![npm version](https://img.shields.io/npm/v/hafas-rest-api-client.svg)](https://www.npmjs.com/package/hafas-rest-api-client)
[![build status](https://api.travis-ci.org/derhuerst/hafas-rest-api-client.svg?branch=master)](https://travis-ci.org/derhuerst/hafas-rest-api-client)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/hafas-rest-api-client.svg)
![minimum Node.js version](https://img.shields.io/node/v/hafas-rest-api-client.svg)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)
[![chat with me on Twitter](https://img.shields.io/badge/chat%20with%20me-on%20Twitter-1da1f2.svg)](https://twitter.com/derhuerst)


## Installing

```shell
npm install hafas-rest-api-client
```


## Usage

```js
const createClient = require('hafas-rest-api-client')

const vbbClient = createClient('https://v5.vbb.transport.rest', {
	// Please pass in a User-Agent header to let the providers of the API endpoint understand how you're using their API.
	userAgent: 'my awesome project',
})

const res = await vbbClient.journeys('900000003201', '900000024101', {results: 1})
```

`hafas-rest-api-client` is a client [`hafas-rest-api@3`](https://www.npmjs.com/package/hafas-rest-api/v/3.4.0) APIs. Check their individual API docs for all supported parameters.

The response objects have special [`Symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) fields for meta information:

```js
const {HEADERS, SERVER_TIMING, CACHE} = require('hafas-rest-api-client')

console.log('response headers', res[HEADERS]) // Fetch API Headers object
console.log('server timing', res[SERVER_TIMING]) // value of the Server-Timing response header
console.log('server cache', res[CACHE]) // value of the X-Cache response header
```


## Contributing

If you have a question or have difficulties using `hafas-rest-api-client`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/hafas-rest-api-client/issues).
