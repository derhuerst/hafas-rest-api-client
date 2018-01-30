'use strict'

const {PassThrough} = require('stream')
const qs = require('querystring')
const Promise = require('pinkie-promise')
const {fetch} = require('fetch-ponyfill')({Promise})
const ndjson = require('ndjson').parse

const endpoint = 'https://vbb.transport.rest'
const userAgent = 'https://github.com/derhuerst/vbb-client'

const request = (route, query, stream) => {
	if ('string' !== typeof route) throw new Error('route must be a string')
	if ('object' !== typeof query) throw new Error('query must be an object')

	const headers = {'User-Agent': userAgent}
	query = Object.assign({}, query)
	if ('identifier' in query) {
		headers['X-Identifier'] = query.identifier
		delete query.identifier
	}
	if (query.products) {
		Object.assign(query, query.products)
		delete query.products
	}

	// Async stack traces are not supported everywhere yet, so we create our own.
	const err = new Error()
	err.isHafasError = true
	err.request = body

	const req = fetch(endpoint + route + '?' + qs.stringify(query), {
		mode: 'cors',
		redirect: 'follow',
		headers
	})
	.then((res) => {
		if (!res.ok) {
			err.message = res.statusText
			err.statusCode = res.status
			throw err
		}
		return res
	})

	if (stream === true) {
		const out = new PassThrough()
		const onError = err => out.destroy(err)

		req
		.then((res) => {
			res.body.once('error', onError)
			res.body.pipe(out)
		})
		.catch(onError)

		return out
	}

	return req
	.then(res => res.json())
}

const stations = (q) => {
	q = q || {}
	return request('/stations', q, false)
}

const nearby = (q) =>
	request('/stations/nearby', q || {})



const station = (id, q) => {
	if ('number' !== typeof id && 'string' !== typeof id)
		throw new Error('id must be a number or a string')
	return request('/stations/' + id, q || {})
}

const departures = (id, q) => {
	if ('number' !== typeof id && 'string' !== typeof id) {
		throw new Error('id must be a number or a string')
	}
	q = q || {}
	if ('when' in q && ('number' === typeof q.when || q.when instanceof Date)) {
		q.when = Math.round(q.when / 1000)
	}
	if (('nextStation' in q) && 'string' !== typeof q.nextStation) {
		throw new Error('nextStation parameter must be a string')
	}

	return request(`/stations/${id}/departures`, q)
	.then((deps) => {
		for (let dep of deps) dep.when = new Date(dep.when)
		return deps
	})
}



const lines = (q) =>
	request('/lines', q || {}, true).pipe(ndjson())

const line = (id, q) => {
	if ('number' !== typeof id && 'string' !== typeof id)
		throw new Error('id must be a number or a string')
	return request('/lines/' + id, q || {})
}


const location = (l, t, q) => {
	q = q || {}
	if ('number' === typeof l || 'string' === typeof l) {q[t] = l; return q}
	if (l.type === 'station') {q[t] = l.id; return q}
	if (l.type === 'poi' || l.type === 'address') {
		q[t + '.name'] = l.name
		q[t + '.longitude'] = l.coordinates.longitude
		q[t + '.latitude'] = l.coordinates.latitude
		if (l.type === 'poi') q[t + '.id'] = l.id
		return q
	}
	throw new Error('valid station, address or poi required.')
}

const journeys = (from, to, q) => {
	q = q || {}
	Object.assign(q, location(from, 'from'), location(to, 'to'))
	if ('when' in q && ('number' === typeof q.when || q.when instanceof Date))
		q.when = Math.round(q.when / 1000)
	return request('/journeys', q)
	.then((journeys) => {
		for (let j of journeys) {
			if (j.departure) j.departure = new Date(j.departure)
			if (j.arrival) j.arrival = new Date(j.arrival)
			for (let part of j.parts) {
				if (part.departure) part.departure = new Date(part.departure)
				if (part.arrival) part.arrival = new Date(part.arrival)
			}
		}
		return journeys
	})
}



const locations = (query, q) => {
	if ('string' !== typeof query) throw new Error('query must be a string')
	q = q || {}
	q.query = query
	return request('/locations', q)
}



const map = (type, q) => {
	if ('string' !== typeof type) throw new Error('type must be a string')
	return request('/maps/' + type, q || {}, true)
}



const radar = (north, west, south, east, q) => {
	if ('number' !== typeof north) throw new Error('north must be a number')
	if ('number' !== typeof west) throw new Error('west must be a number')
	if ('number' !== typeof south) throw new Error('south must be a number')
	if ('number' !== typeof east) throw new Error('east must be a number')
	q = Object.assign(q || {}, {north, west, south, east})
	return request('/radar', q || {})
}



module.exports = {
	stations, nearby,
	station, departures,
	lines, line,
	journeys,
	locations,
	map,
	radar
}
