#!/usr/bin/env node
'use strict'

const test = require('tape')
const isPromise = require('is-promise')
const isStream = require('is-stream')
const isRoughlyEqual = require('is-roughly-equal')
const client = require('./index')



test('stations() with completion', (t) => {
	t.plan(4)
	const s = client.stations({query: 'mehringd', completion: true})
	t.ok(isPromise(s))
	s.catch((err) => t.fail(err.message))
	.then((data) => {
		t.ok(Array.isArray(data))
		const s = data.find((s) => s.id === 9017101)
		t.ok(s)
		t.equal(s.name, 'U Mehringdamm')
	})
})

test.skip('stations() without completion', (t) => {
	t.plan(3)
	const s = client.stations({query: 'mehringdamm'})
	t.ok(isStream(s))
	s.on('error', (err) => t.fail(err.message))
	.on('data', (s) => {
		if (s.id !== 9017101) return
		t.equal(s.name, 'U Mehringdamm')
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
		distance: 1000
	})
	t.ok(isPromise(s))
	s.catch((err) => t.fail(err.message))
	.then((data) => {
		t.ok(Array.isArray(data))
		t.equal(data.length, 4)
		for (let l of data) {
			t.ok(l)
			t.equal(l.type, 'station')
			t.equal(typeof l.id, 'number')
			t.equal(typeof l.latitude, 'number')
			t.ok(latitudeValid(l.latitude))
			t.equal(typeof l.longitude, 'number')
			t.ok(longitudeValid(l.longitude))
			t.ok(l.distance <= 1000)
		}
	})
})
