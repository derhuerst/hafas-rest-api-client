'use strict'

const test = require('tape')
const isPromise = require('is-promise')
const isStream = require('is-stream')
const isRoughlyEqual = require('is-roughly-equal')
const floor = require('floordate')

const client = require('.')

const hour = 60 * 60 * 1000
const week = 7 * 24 * hour
// next Monday
const when = new Date(+floor(new Date(), 'week') + week + 10 * hour)

const assertValidWhen = (t, w) => {
	const ts = +new Date(w)
	t.ok(!Number.isNaN(ts), 'invalid date')
	return isRoughlyEqual(2 * hour, +when, ts)
}

const isHalleschesTor = (s) => s
	&& s.id === '900000012103'
	&& s.name === 'U Hallesches Tor'
	&& s.coordinates
	&& isRoughlyEqual(.0001, s.coordinates.latitude, 52.497776)
	&& isRoughlyEqual(.0001, s.coordinates.longitude, 13.391766)

const isKottbusserTor = (s) => s
	&& s.id === '900000013102'
	&& s.name === 'U Kottbusser Tor'
	&& s.coordinates
	&& isRoughlyEqual(.0001, s.coordinates.latitude, 52.499044)
	&& isRoughlyEqual(.0001, s.coordinates.longitude, 13.417748)

const BVG = '796'

const isM13 = (t, l) => {
	t.ok(l)
	t.equal(l.type, 'line')
	t.equal(l.name, 'M13')
	t.equal(l.operator, BVG)

	t.equal(typeof l.id, 'string')
	t.ok(l.id)

	t.equal(typeof l.mode, 'string') // todo: validate strictly
	t.ok(l.mode) // todo: validate strictly
	t.equal(typeof l.product, 'string') // todo: validate strictly
	t.ok(l.product) // todo: validate strictly
}



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
	t.plan(3)
	const s = client.stations({
		query: 'hallesches tor',
		identifier: 'vbb-client-test'
	})
	t.ok(isPromise(s))
	s
	.then((stations) => {
		for (let s of stations) {
			if (s.id !== '900000012103') continue
			t.equal(s.id, '900000012103')
			t.equal(s.name, 'U Hallesches Tor')
		}
	})
	.catch((err) => t.fail(err.message))
})

test('nearby()', (t) => {
	const latitudeValid = isRoughlyEqual(.3, 52.5137)
	const longitudeValid = isRoughlyEqual(.3, 13.4744)

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
		t.ok(data.length > 0)

		for (let l of data) {
			t.ok(l)
			t.equal(l.type, 'station')
			t.equal(typeof l.id, 'string')
			t.ok(l.coordinates)
			t.equal(typeof l.coordinates.latitude, 'number')
			t.ok(latitudeValid(l.coordinates.latitude))
			t.equal(typeof l.coordinates.longitude, 'number')
			t.ok(longitudeValid(l.coordinates.longitude))
			t.ok(l.distance <= 2000)
		}

		t.end()
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

test('departures() without nextStation', (t) => {
	t.plan(3 + 8)

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
		assertValidWhen(t, dep.when)
		t.ok(dep.line)
		t.ok(dep.line.name)
		t.ok(dep.line.mode)
	})
	.catch((err) => t.fail(err.message))
})

test('departures() with nextStation', (t) => {
	t.plan(2 + 5 * 5)

	client.departures('900000012103', {
		nextStation: '900000017104',
		when, results: 5,
		identifier: 'vbb-client-test'
	})
	.then((deps) => {
		t.ok(Array.isArray(deps))
		t.equal(deps.length, 5)

		for (let dep of deps) {
			t.ok(dep.station)
			t.equal(dep.station.id, '900000012103')

			t.ok(dep.line)
			t.equal(dep.line.name, 'U1')

			assertValidWhen(t, dep.when)
		}
	})
	.catch(t.ifError)
})

test('lines()', (t) => {
	const s = client.lines({
		variants: true, name: 'M13',
		identifier: 'vbb-client-test'
	})

	t.ok(isStream(s))
	s.on('error', (err) => {
		t.fail(err.message)
	})
	.on('data', (l) => {
		isM13(t, l)
		t.ok(Array.isArray(l.variants))
	})
	.once('end', () => {
		t.end()
	})
})

test('line()', (t) => {
	t.throws(() => client.line())
	t.throws(() => client.line(null))
	t.throws(() => client.line({}))

	const s = client.line('17442_900', {identifier: 'vbb-client-test'})
	t.ok(isPromise(s))
	s
	.then((l) => {
		isM13(t, l)
		t.ok(Array.isArray(l.variants))
		t.end()
	})
	.catch((err) => {
		t.fail(err.message)
	})
})

test('journeys() with station IDs', (t) => {
	t.plan(6 + 1 * 6)

	t.throws(() => client.journeys())
	t.throws(() => client.journeys(null))
	t.throws(() => client.journeys({}))
	t.throws(() => client.journeys(123))
	t.throws(() => client.journeys(123, null))
	t.throws(() => client.journeys(123, {}))

	const s = client.journeys('900000012103', '900000013102', {
		when, results: 1,
		identifier: 'vbb-client-test'
	})
	s
	.then((r) => {
		t.ok(Array.isArray(r))
		t.equal(r.length, 1)
		r = r[0]
		assertValidWhen(t, r.departure)
		t.ok(isHalleschesTor(r.origin))
		assertValidWhen(t, r.arrival)
		t.ok(isKottbusserTor(r.destination))
	})
	.catch((err) => t.fail(err.message))
})

test('journeys() with an address', (t) => {
	t.plan(8)

	const s = client.journeys('900000042101', {
		type: 'address', name: 'Torfstraße 17',
		coordinates: {latitude: 52.5416823, longitude: 13.3491223}
	}, {
		when, results: 1,
		identifier: 'vbb-client-test'
	})
	s
	.then((r) => {
		t.ok(Array.isArray(r))
		t.equal(r.length, 1)
		const last = r[0].parts[r[0].parts.length - 1]

		assertValidWhen(t, last.arrival)

		const d = last.destination
		t.equal(d.type, 'address')
		t.equal(d.name, 'Torfstr. 17')

		t.ok(d.coordinates)
		t.ok(isRoughlyEqual(.0001, d.coordinates.latitude, 52.541679))
		t.ok(isRoughlyEqual(.0001, d.coordinates.longitude, 13.349116))
	})
	.catch((err) => t.fail(err.message))
})

test('journeys() with a poi', (t) => {
	t.plan(9)

	const s = client.journeys('900000042101', {
		type: 'poi',
		id: '900000980720',
		name: 'Berlin, Atze Musiktheater für Kinder',
		coordinates: {latitude: 52.543333, longitude: 13.351686}
	}, {
		when, results: 1,
		identifier: 'vbb-client-test'
	})
	s
	.then((r) => {
		t.ok(Array.isArray(r))
		t.equal(r.length, 1)
		const last = r[0].parts[r[0].parts.length - 1]

		assertValidWhen(t, last.arrival)

		const d = last.destination
		t.equal(d.type, 'poi')
		t.equal(d.id, '900000980720')
		t.equal(d.name, 'Berlin, Atze Musiktheater für Kinder')

		t.ok(d.coordinates)
		t.ok(isRoughlyEqual(.0001, d.coordinates.latitude, 52.543333))
		t.ok(isRoughlyEqual(.0001, d.coordinates.longitude, 13.351686))
	})
	.catch((err) => t.fail(err.message))
})

test('locations()', (t) => {
	t.plan(6 + 10 * 4 + 6)

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
			t.ok(l.coordinates)
			t.equal(typeof l.coordinates.latitude, 'number')
			t.equal(typeof l.coordinates.longitude, 'number')
		}

		const s = locations.find((l) => l.type === 'station')
		t.ok(s)
		t.equal(typeof s.id, 'string')
		t.equal(typeof s.products, 'object')

		const p = locations.find((l) => l.type === 'poi')
		t.ok(p)
		t.equal(typeof p.id, 'string')

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



test('radar()', (t) => {
	t.plan(2)

	const s = client.radar(52.52411, 13.41002, 52.51942, 13.41709)
	t.ok(isPromise(s))
	s
	.then((movements) => t.ok(Array.isArray(movements))) // todo
	.catch((err) => t.fail(err.message))
})
