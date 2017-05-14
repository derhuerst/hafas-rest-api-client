#!/usr/bin/env node
'use strict'

const test = require('tape')
const isPromise = require('is-promise')
const isStream = require('is-stream')
const isRoughlyEqual = require('is-roughly-equal')
const floor = require('floordate')
const client = require('./index')



const hour = 60 * 60 * 1000
const when = new Date(+floor(new Date(), 'day') + 10 * hour)
const validWhen = isRoughlyEqual(2 * hour, +when)

const isHalleschesTor = (s) => s
	&& s.id === '900000012103'
	&& s.name === 'U Hallesches Tor'
	&& isRoughlyEqual(.0001, s.latitude, 52.497776)
	&& isRoughlyEqual(.0001, s.longitude, 13.391766)

const isKottbusserTor = (s) => s
	&& s.id === '900000013102'
	&& s.name === 'U Kottbusser Tor'
	&& isRoughlyEqual(.0001, s.latitude, 52.499044)
	&& isRoughlyEqual(.0001, s.longitude, 13.417748)

const isM13 = (l) => l
	&& l.id === '17442_900'
	&& l.name === 'M13'
	&& l.type === 'tram'
	&& l.agencyId === '796'



test('stations() with completion', (t) => {
	t.plan(4)
	const s = client.stations({
		query: 'hallesc', completion: true,
		identifier: 'vbb-client-test'
	})
	t.ok(isPromise(s))
	s
	.then((data) => {
		t.ok(Array.isArray(data))
		const s = data.find((s) => s.id === '900000012103')
		t.equal(s.id, '900000012103')
		t.equal(s.name, 'U Hallesches Tor')
	})
	.catch((err) => t.fail(err.message))
})

test('stations() without completion', (t) => {
	t.plan(4)
	const s = client.stations({
		query: 'hallesches tor',
		identifier: 'vbb-client-test'
	})
	t.ok(isStream(s))
	s.on('error', (err) => t.fail(err.message))
	.on('data', (s) => {
		if (s.id !== '900000012103') return
		t.equal(s.id, '900000012103')
		t.equal(s.name, 'U Hallesches Tor')
	})
	.on('end', () => t.pass('end event'))
})

test('nearby()', (t) => {
	const latitudeValid = isRoughlyEqual(.3, 52.5137344)
	const longitudeValid = isRoughlyEqual(.3, 13.4744798)
	t.plan(3 + 4 * 8)

	const s = client.nearby({
		latitude: 52.5137344,
		longitude: 13.4744798,
		results: 4,
		distance: 1000,
		identifier: 'vbb-client-test'
	})
	t.ok(isPromise(s))
	s
	.then((data) => {
		t.ok(Array.isArray(data))
		t.equal(data.length, 4)
		for (let l of data) {
			t.ok(l)
			t.equal(l.type, 'station')
			t.equal(typeof l.id, 'string')
			t.equal(typeof l.latitude, 'number')
			t.ok(latitudeValid(l.latitude))
			t.equal(typeof l.longitude, 'number')
			t.ok(longitudeValid(l.longitude))
			t.ok(l.distance <= 1000)
		}
	})
	.catch((err) => t.fail(err.message))
})

test('station()', (t) => {
	t.plan(4 + 1 * 4)

	t.throws(() => client.station())
	t.throws(() => client.station(null))
	t.throws(() => client.station({}))

	const s = client.station('900000012103', {identifier: 'vbb-client-test'})
	t.ok(isPromise(s))
	s
	.then((s) => {
		t.ok(isHalleschesTor(s))
		t.equal(typeof s.weight, 'number')
		t.ok(s.weight > 0)
		t.ok(Array.isArray(s.lines))
	})
	.catch((err) => t.fail(err.message))
})

test('departures()', (t) => {
	t.plan(6 + 3)

	t.throws(() => client.departures())
	t.throws(() => client.departures(null))
	t.throws(() => client.departures({}))

	const s = client.departures('900000012103', {
		when, duration: 5,
		identifier: 'vbb-client-test'
	})
	t.ok(isPromise(s))
	s
	.then((deps) => {
		t.ok(Array.isArray(deps))
		t.ok(deps.length >= 1)
		const dep = deps[0]
		t.ok(isHalleschesTor(dep.station))
		t.ok(validWhen(dep.when))
		t.ok(dep.product)
	})
	.catch((err) => t.fail(err.message))
})

test('lines()', (t) => {
	t.plan(2 + 1 * 2)
	const s = client.lines({
		variants: true, name: 'M13',
		identifier: 'vbb-client-test'
	})
	t.ok(isStream(s))
	s.on('error', (err) => t.fail(err.message))
	.on('data', (l) => {
		t.ok(isM13(l))
		t.ok(Array.isArray(l.variants))
	})
	.on('end', () => t.pass('end event'))
})

test('line()', (t) => {
	t.plan(4 + 1 * 2)

	t.throws(() => client.line())
	t.throws(() => client.line(null))
	t.throws(() => client.line({}))

	const s = client.line('17442_900', {identifier: 'vbb-client-test'})
	t.ok(isPromise(s))
	s
	.then((l) => {
		t.ok(isM13(l))
		t.ok(Array.isArray(l.variants))
	})
	.catch((err) => t.fail(err.message))
})

test('routes() with station IDs', (t) => {
	t.plan(6 + 1 * 6)

	t.throws(() => client.routes())
	t.throws(() => client.routes(null))
	t.throws(() => client.routes({}))
	t.throws(() => client.routes(123))
	t.throws(() => client.routes(123, null))
	t.throws(() => client.routes(123, {}))

	const s = client.routes('900000012103', '900000013102', {
		when, results: 1,
		identifier: 'vbb-client-test'
	})
	s
	.then((r) => {
		t.ok(Array.isArray(r))
		t.equal(r.length, 1)
		r = r[0]
		t.ok(validWhen(r.start))
		t.ok(isHalleschesTor(r.from))
		t.ok(validWhen(r.end))
		t.ok(isKottbusserTor(r.to))
	})
	.catch((err) => t.fail(err.message))
})

test('routes() with an address', (t) => {
	t.plan(7)

	const s = client.routes('900000042101', {
		type: 'address', name: 'Torfstraße 17',
		latitude: 52.5416823, longitude: 13.3491223
	}, {
		when, results: 1,
		identifier: 'vbb-client-test'
	})
	s
	.then((r) => {
		t.ok(Array.isArray(r))
		t.equal(r.length, 1)
		const last = r[0].parts[r[0].parts.length - 1]
		t.ok(validWhen(last.end))
		t.equal(last.to.type, 'address')
		t.equal(last.to.name, 'Torfstr. 17')
		t.ok(isRoughlyEqual(.0001, last.to.latitude, 52.541679))
		t.ok(isRoughlyEqual(.0001, last.to.longitude, 13.349116))
	})
	.catch((err) => t.fail(err.message))
})

test('routes() with a poi', (t) => {
	t.plan(8)

	const s = client.routes('900000042101', {
		type: 'poi', name: 'ATZE Musiktheater', id: 9980720,
		latitude: 52.543333, longitude: 13.351686
	}, {
		when, results: 1,
		identifier: 'vbb-client-test'
	})
	s
	.then((r) => {
		t.ok(Array.isArray(r))
		t.equal(r.length, 1)
		const last = r[0].parts[r[0].parts.length - 1]
		t.ok(validWhen(last.end))
		t.equal(last.to.type, 'poi')
		t.equal(last.to.name, 'ATZE Musiktheater')
		t.equal(last.to.id, 9980720)
		t.ok(isRoughlyEqual(.0001, last.to.latitude, 52.543333))
		t.ok(isRoughlyEqual(.0001, last.to.longitude, 13.351686))
	})
	.catch((err) => t.fail(err.message))
})

test('locations()', (t) => {
	t.plan(6 + 10 * 3 + 6)

	t.throws(() => client.locations())
	t.throws(() => client.locations({}))
	t.throws(() => client.locations(123))

	const s = client.locations('Alexanderplatz', {
		results: 10,
		identifier: 'vbb-client-test'
	})
	t.ok(isPromise(s))
	s
	.then((locations) => {
		t.ok(Array.isArray(locations))
		t.equal(locations.length, 10)

		for (let l of locations) {
			t.equal(typeof l.name, 'string')
			t.equal(typeof l.latitude, 'number')
			t.equal(typeof l.longitude, 'number')
		}

		const s = locations.find((l) => l.type === 'station')
		t.ok(s)
		t.equal(typeof s.id, 'string')
		t.equal(typeof s.products, 'object')

		const p = locations.find((l) => l.type === 'poi')
		t.ok(p)
		t.equal(typeof p.id, 'number')

		const a = locations.find((l) => l.type === 'address')
		t.ok(a)
	})
	.catch((err) => t.fail(err.message))
})

test('map()', (t) => {
	t.plan(5)

	t.throws(() => client.map())
	t.throws(() => client.map(123))
	t.throws(() => client.map({}))

	const s = client.map('bvg-night', {identifier: 'vbb-client-test'})
	t.ok(isStream(s))
	s.on('error', (err) => t.fail(err.message))
	.on('data', () => {})
	.on('end', () => t.pass('end event'))
})



test.skip('radar()', (t) => {
	t.plan(2)

	const s = client.radar(52.52411, 13.41002, 52.51942, 13.41709)
	t.ok(isPromise(s))
	s
	.then((movements) => t.ok(Array.isArray(movements)))
	.catch((err) => t.fail(err.message))
})
