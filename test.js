'use strict'

import {DateTime} from 'luxon'
import test from 'tape'
import createClient from './index.js'

// Monday of next week, 10 am
const when = DateTime.fromMillis(Date.now(), {
	zone: 'Europe/Berlin',
	locale: 'de-DE',
})
.startOf('week')
.plus({weeks: 1, hours: 10})
.toISO()

const client = createClient('https://v5.vbb.transport.rest', {
	userAgent: 'hafas-rest-api-client test',
})

test('locations()', async (t) => {
	const locs = await client.locations('Alexanderplatz')
	t.ok(Array.isArray(locs))
	t.ok(locs.length > 0)
})

test('nearby()', async (t) => {
	const stops = await client.nearby({
		type: 'location',
		latitude: 52.5137,
		longitude: 13.4745,
	})
	t.ok(Array.isArray(stops))
	t.ok(stops.length > 0)
})

test('stations()', async (t) => {
	const locs = await client.stations('Alexande', {
		completion: true,
	})
	t.ok(Object.keys(locs).length > 0)
})

test('reachableFrom()', async (t) => {
	const stops = await client.reachableFrom({
		type: 'location',
		address: '13353 Berlin-Wedding, Torfstr. 17',
		latitude: 52.5418,
		longitude: 13.35,
	})
	t.ok(Array.isArray(stops))
	t.ok(stops.length > 0)
})

test('stop()', async (t) => {
	const s = await client.stop('900000012103')
	t.ok(s)
	t.equal(s.id, '900000012103')
})

test('departures()', async (t) => {
	const deps = await client.departures('900000012103', {
		when,
	})
	t.ok(Array.isArray(deps))
	t.ok(deps.length >= 1)
})
test('arrivals()', async (t) => {
	const deps = await client.arrivals('900000012103', {
		when,
	})
	t.ok(Array.isArray(deps))
	t.ok(deps.length >= 1)
})

test('journeys() with station IDs', async (t) => {
	const r = await client.journeys('900000012103', '900000013102', {
		when, results: 1,
	})
	t.ok(r)
	t.ok(Array.isArray(r.journeys))
	t.ok(r.journeys.length > 0)
})

test('journeys() with an address', async (t) => {
	const locs = await client.locations('torfstr 17', {results: 1})
	const torfstr17 = {
		type: 'location',
		latitude: locs[0].latitude,
		longitude: locs[0].longitude,
		address: locs[0].address,
	}

	const r = await client.journeys('900000042101', torfstr17, {
		when, results: 1,
	})
	t.ok(r)
	t.ok(Array.isArray(r.journeys))
	t.ok(r.journeys.length > 0)
})

test('refreshJourney()', async (t) => {
	const r = await client.journeys('900000012103', '900000013102', {
		when, results: 1,
	})
	const ref = r.journeys[0].refreshToken
	t.ok(ref)

	const j = await client.refreshJourney(ref, {
		when,
	})
	t.ok(j)
})

test('trip()', async (t) => {
	const r = await client.journeys('900000012103', '900000013102', {
		when, results: 1,
	})
	const leg = r.journeys[0].legs.find(l => !!l.tripId)
	t.ok(leg)

	const j = await client.trip(leg.tripId, leg.line.name, {
		when,
	})
	t.ok(j)
})

test('radar()', async (t) => {
	const movements = await client.radar({
		north: 52.52411,
		west: 13.41002,
		south: 52.51942,
		east: 13.41709,
	})
	t.ok(Array.isArray(movements))
	t.ok(movements.length > 0)
})
