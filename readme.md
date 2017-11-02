# *vbb-client*

**A client for the [Berlin & Brandenburg public transport API](https://github.com/derhuerst/vbb-rest)** that talks to [the `vbb-rest` endpoint deployed at `vbb.transport.rest`](https://github.com/derhuerst/vbb-rest/blob/master/docs/index.md).

*vbb-client* works both in the Browser (using [Browserify](http://browserify.org/)) and in Node.js.

[![npm version](https://img.shields.io/npm/v/vbb-client.svg)](https://www.npmjs.com/package/vbb-client)
[![build status](https://img.shields.io/travis/derhuerst/vbb-client.svg)](https://travis-ci.org/derhuerst/vbb-client)
[![dependency status](https://img.shields.io/david/derhuerst/vbb-client.svg)](https://david-dm.org/derhuerst/vbb-client)
[![dev dependency status](https://img.shields.io/david/dev/derhuerst/vbb-client.svg)](https://david-dm.org/derhuerst/vbb-client#info=devDependencies)
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

`vbb-client` is a client for the [vbb-rest](https://github.com/derhuerst/vbb-rest/blob/master/docs/index.md) API deployed at `vbb.transport.rest`. **Refer to the [API docs](https://github.com/derhuerst/vbb-rest/blob/master/docs/index.md) for available parameters.**

It wraps the following routes:

- [`/stations?query=…`](https://github.com/derhuerst/vbb-rest/blob/master/docs/index.md#get-stationsquery) as `stations([query])` → [`Promise`][promise]/[`stream.Readable`][stream]
- [`/stations/nearby`](https://github.com/derhuerst/vbb-rest/blob/master/docs/index.md#get-stationsnearby) as `nearby([query])` → [`Promise`][promise]
- [`/stations/:id`](https://github.com/derhuerst/vbb-rest/blob/master/docs/index.md#get-stationsid) as `station(id)` → [`Promise`][promise]
- [`/stations/:id/departures`](https://github.com/derhuerst/vbb-rest/blob/master/docs/index.md#get-stationsiddepartures) as `departures(id, [query])` → [`Promise`][promise]
- [`/lines?query=…`](https://github.com/derhuerst/vbb-rest/blob/master/docs/index.md#get-lines) as `lines([query])` → [`stream.Readable`][stream]
- [`/lines/:id`](https://github.com/derhuerst/vbb-rest/blob/master/docs/index.md#get-linesid) as `line(id)` → [`Promise`][promise]
- [`/journeys`](https://github.com/derhuerst/vbb-rest/blob/master/docs/index.md#get-journeys) as `journeys(from, to, [query])` → [`Promise`][promise]
- [`/maps/:type`](https://github.com/derhuerst/vbb-rest/blob/master/docs/index.md#get-mapstype) as `map(type)` → [`stream.Readable`][stream]

[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[stream]: https://nodejs.org/api/stream.html#stream_class_stream_readable


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/vbb-client/issues).
