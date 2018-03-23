'use strict'

const test = require('tape')
const isPromise = require('is-promise')
const isStream = require('is-stream')
const {DateTime} = require('luxon')

const client = require('.')

const isObj = o => o !== null && 'object' === typeof o && !Array.isArray(o)

// Monday of next week, 10 am
const when = DateTime.fromMillis(Date.now(), {
	zone: 'Europe/Berlin',
	locale: 'de-DE',
})
.startOf('week')
.plus({weeks: 1, hours: 10})
.toJSDate()

test('stations()', (t) => {
	t.plan(3 + 3)

	const p1 = client.stations({
		query: 'hallesc', completion: true,
		identifier: 'vbb-client-test'
	})
	t.ok(isPromise(p1))
	p1
	.then((stations) => {
		t.ok(Array.isArray(stations))
		t.ok(stations.find(s => s.id === '900000012103'))
	})
	.catch(t.ifError)

	const p2 = client.stations({
		query: 'hallesches tor',
		identifier: 'vbb-client-test'
	})
	t.ok(isPromise(p2))
	p2
	.then((stations) => {
		t.ok(Array.isArray(stations))
		t.ok(stations.find(s => s.id === '900000012103'))
	})
	.catch(t.ifError)
})

test('nearby()', (t) => {
	t.plan(3)

	const p = client.nearby({
		latitude: 52.5137344,
		longitude: 13.4744798,
		results: 4,
		distance: 1000,
		identifier: 'vbb-client-test'
	})
	t.ok(isPromise(p))
	p
	.then((stations) => {
		t.ok(Array.isArray(stations))
		t.ok(stations.length > 0)
	})
	.catch(t.ifError)
})

test('allStations()', (t) => {
	t.plan(3)

	const p1 = client.allStations({
		identifier: 'vbb-client-test'
	})
	t.ok(isPromise(p1))
	p1
	.then((stations) => {
		t.ok(isObj(stations))
		t.ok(Object.keys(stations).length > 0)
	})
	.catch(t.ifError)
})

test('station()', (t) => {
	t.plan(2 + 3)

	t.throws(() => client.station(''))
	t.throws(() => client.station(123))

	const p = client.station('900000012103', {
		identifier: 'vbb-client-test'
	})
	t.ok(isPromise(p))
	p
	.then((s) => {
		t.ok(s)
		t.equal(s.id, '900000012103')
	})
	.catch(t.ifError)
})

test('departures() without nextStation', (t) => {
	t.plan(2 + 3)

	t.throws(() => client.departures(''))
	t.throws(() => client.departures(123))

	const p = client.departures('900000012103', {
		when, duration: 5,
		identifier: 'vbb-client-test'
	})
	t.ok(isPromise(p))
	p
	.then((deps) => {
		t.ok(Array.isArray(deps))
		t.ok(deps.length >= 1)
	})
	.catch(t.ifError)
})

test('lines()', (t) => {
	const s = client.lines({
		variants: true, name: 'M13',
		identifier: 'vbb-client-test'
	})
	t.ok(isStream(s))

	s.on('error', t.ifError)
	.on('data', (l) => {
		t.ok(l)
	})
	.once('end', () => t.end())
})

test('line()', (t) => {
	t.plan(2 + 2)

	t.throws(() => client.line(''))
	t.throws(() => client.line(123))

	const p = client.line('17442_900', {
		identifier: 'vbb-client-test'
	})
	t.ok(isPromise(p))
	p
	.then((l) => t.ok(l))
	.catch((err) => {
		t.fail(err.message)
	})
})

test('journeys() with station IDs', (t) => {
	t.plan(4 + 2)

	const validId = '123456789'
	t.throws(() => client.journeys('', validId))
	t.throws(() => client.journeys(123456789, validId))
	t.throws(() => client.journeys(validId, ''))
	t.throws(() => client.journeys(validId, 123456789))

	const p = client.journeys('900000012103', '900000013102', {
		when, results: 1,
		identifier: 'vbb-client-test'
	})
	p
	.then((r) => {
		t.ok(Array.isArray(r))
		t.equal(r.length, 1)
	})
	.catch(t.ifError)
})

test('journeys() with an address', (t) => {
	t.plan(3)

	const p = client.journeys('900000042101', {
		type: 'location',
		address: 'Torfstraße 17',
		latitude: 52.5416823, longitude: 13.3491223
	}, {
		when, results: 1,
		identifier: 'vbb-client-test'
	})
	t.ok(isPromise(p))
	p
	.then((r) => {
		t.ok(Array.isArray(r))
		t.equal(r.length, 1)
	})
	.catch(t.ifError)
})

test('journeys() with a POI', (t) => {
	t.plan(3)

	const p = client.journeys('900000042101', {
		type: 'location',
		id: '900000980720',
		name: 'Berlin, Atze Musiktheater für Kinder',
		latitude: 52.543333, longitude: 13.351686
	}, {
		when, results: 1,
		identifier: 'vbb-client-test'
	})
	t.ok(isPromise(p))
	p
	.then((r) => {
		t.ok(Array.isArray(r))
		t.equal(r.length, 1)
	})
	.catch(t.ifError)
})

test('locations()', (t) => {
	t.plan(3 + 3)

	t.throws(() => client.locations())
	t.throws(() => client.locations({}))
	t.throws(() => client.locations(123))

	const p = client.locations('Alexanderplatz', {
		results: 10,
		identifier: 'vbb-client-test'
	})
	t.ok(isPromise(p))
	p
	.then((locations) => {
		t.ok(Array.isArray(locations))
		t.equal(locations.length, 10)
	})
	.catch(t.ifError)
})

test('map()', (t) => {
	t.plan(5)

	t.throws(() => client.map())
	t.throws(() => client.map(123))
	t.throws(() => client.map({}))

	const s = client.map('bvg-night', {
		identifier: 'vbb-client-test'
	})
	t.ok(isStream(s))
	s.on('error', t.ifError)
	.on('data', () => {})
	.on('end', () => t.pass('end event occured'))
})

test('radar()', (t) => {
	t.plan(3)

	const p = client.radar(52.52411, 13.41002, 52.51942, 13.41709)
	t.ok(isPromise(p))
	p
	.then((movements) => {
		t.ok(Array.isArray(movements))
		t.ok(movements.length > 0)
	})
	.catch(t.ifError)
})
