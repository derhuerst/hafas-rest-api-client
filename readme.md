# *vbb-client*

**A client for the [Berlin & Brandenburg public transport API](https://github.com/derhuerst/vbb-rest/blob/2/docs/index.md)** deployed at `2.vbb.transport.rest`. Works both in browsers (using a [bundler](https://medium.com/@gimenete/how-javascript-bundlers-work-1fc0d0caf2da)) and in [Node](https://nodejs.org/en/).

![architecture](https://cdn.rawgit.com/derhuerst/vbb-rest/2/architecture.svg)

[![npm version](https://img.shields.io/npm/v/vbb-client.svg)](https://www.npmjs.com/package/vbb-client)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/vbb-client.svg)
[![gitter channel](https://badges.gitter.im/derhuerst/vbb-rest.svg)](https://gitter.im/derhuerst/vbb-rest)


## Installing

```shell
npm install vbb-client
```


## Usage

```js
const vbb = require('vbb-client')

vbb.journeys('900000003201', '900000024101', {results: 1})
.then(console.log)
.catch(console.error)
```


## API

`vbb-client` is a client for the [vbb-rest](https://github.com/derhuerst/vbb-rest/tree/2) API deployed at `2.vbb.transport.rest`. **Refer to its [API docs](https://github.com/derhuerst/vbb-rest/blob/2/docs/index.md) for all supported parameters.**

It wraps the following routes:

- [`/stations?query=…`](https://github.com/derhuerst/vbb-rest/blob/2/docs/index.md#get-stationsquery) as `stations([query])` → [`Promise`][promise]/[`stream.Readable`][stream]
- [`/stations/all`](https://github.com/derhuerst/vbb-rest/blob/2/docs/index.md#get-stationsall) as `allStations([query])` → [`Promise`][promise]
- [`/stations/nearby`](https://github.com/derhuerst/vbb-rest/blob/2/docs/index.md#get-stationsnearby) as `nearby([query])` → [`Promise`][promise]
- [`/stations/:id`](https://github.com/derhuerst/vbb-rest/blob/2/docs/index.md#get-stationsid) as `station(id, [query])` → [`Promise`][promise]
- [`/stations/:id/departures`](https://github.com/derhuerst/vbb-rest/blob/2/docs/index.md#get-stationsiddepartures) as `departures(id, [query])` → [`Promise`][promise]
- [`/lines?query=…`](https://github.com/derhuerst/vbb-rest/blob/2/docs/index.md#get-lines) as `lines([query])` → [`stream.Readable`][stream]
- [`/lines/:id`](https://github.com/derhuerst/vbb-rest/blob/2/docs/index.md#get-linesid) as `line(id, [query])` → [`Promise`][promise]
- [`/journeys`](https://github.com/derhuerst/vbb-rest/blob/2/docs/index.md#get-journeys) as `journeys(from, to, [query])` → [`Promise`][promise]
- [`/journeys/legs/:ref`](https://github.com/derhuerst/vbb-rest/blob/2/docs/index.md#get-journeyslegsref) as `journeyLeg(ref, [query])` → [`Promise`][promise]
- [`/maps/:type`](https://github.com/derhuerst/vbb-rest/blob/2/docs/index.md#get-mapstype) as `map(type, [query])` → [`stream.Readable`][stream]

[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[stream]: https://nodejs.org/api/stream.html#stream_class_stream_readable


## Contributing

If you have a question or have difficulties using `vbb-client`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/vbb-client/issues).
