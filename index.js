'use strict'

const ndjson = require('ndjson').parse
const {PassThrough} = require('stream')

const request = require('./lib/request')

const isProd = process.env.NODE_ENV === 'production'
const isObj = o => 'object' === typeof o && !Array.isArray(o)

const stations = (query = {}) => {
	if (!isProd && !isObj(query)) throw new Error('query must be an object.')

	return request('/stations', query, false)
}

const nearby = (query = {}) => {
	if (!isProd && !isObj(query)) throw new Error('query must be an object.')

	return request('/stations/nearby', query)
}

const station = (id, query = {}) => {
	if (!isProd && 'string' !== typeof id || !id) {
		throw new Error('id must be a non-empty string.')
	}
	if (!isProd && !isObj(query)) throw new Error('query must be an object.')

	return request('/stations/' + id, q || {})
}

const departures = (id, query = {}) => {
	if (!isProd && 'string' !== typeof id || !id) {
		throw new Error('id must be a non-empty string.')
	}

	if (!isProd && !isObj(query)) throw new Error('query must be an object.')
	if ('when' in query) {
		query.when = Math.round(query.when / 1000)
		if (!isProd && Number.isNaN(query.when)) {
			throw new Error('query.when must be a number of a Date.')
		}
	}
	if (
		!isProd && ('nextStation' in query) &&
		'string' !== typeof query.nextStation || !query.nextStation
	) {
		throw new Error('query.nextStation must be a non-empty string.')
	}

	return request(`/stations/${id}/departures`, query)
	.then((deps) => {
		for (let dep of deps) {
			if (dep.when) dep.when = new Date(dep.when)
		}
		return deps
	})
}

const lines = (query = {}) => {
	if (!isProd && !isObj(query)) throw new Error('query must be an object.')

	return request('/lines', query, ndjson())
}

const line = (id, query = {}) => {
	if (!isProd && 'string' !== typeof id || !id) {
		throw new Error('id must be a non-empty string.')
	}
	if (!isProd && !isObj(query)) throw new Error('query must be an object.')

	return request('/lines/' + id, query)
}

const location = (loc, key, query) => {
	if ('string' === typeof loc) {
		if (!isProd && !loc) throw new Error(key + ' must not be empty.')
		query[key] = loc
		return query
	}
	if (isObj(loc)) {
		if (
			!isProd && (loc.type === 'station' || loc.type === 'poi') &&
			'string' !== typeof loc.id || !loc.id
		) throw new Error(key + '.id must be a non-empty string.')

		if (loc.type === 'station') {
			query[key] = loc.id
			return query
		}
		if (loc.type === 'poi' || loc.type === 'address') {
			query[key + '.name'] = loc.name
			query[key + '.longitude'] = loc.location.longitude
			query[key + '.latitude'] = loc.location.latitude
			if (loc.type === 'poi') query[key + '.id'] = loc.id
			return query
		}
	}
	throw new Error('valid station, address or poi required.')
}

const journeys = (from, to, query = {}) => {
	if (!isProd && !isObj(query)) throw new Error('query must be an object.')
	query = Object.assign({}, query)
	Object.assign(query, location(from, 'from', query), location(to, 'to', query))
	if ('when' in query) {
		query.when = Math.round(query.when / 1000)
		if (!isProd && Number.isNaN(query.when)) {
			throw new Error('query.when must be a number of a Date.')
		}
	}

	return request('/journeys', query)
	.then((journeys) => {
		for (let j of journeys) {
			if (j.departure) j.departure = new Date(j.departure)
			if (j.arrival) j.arrival = new Date(j.arrival)
			for (let leg of j.legs) {
				if (leg.departure) leg.departure = new Date(leg.departure)
				if (leg.arrival) leg.arrival = new Date(leg.arrival)
			}
		}
		return journeys
	})
}

const journeyLeg = (ref, query = {}) => {
	if (!isProd && 'string' !== typeof ref || !ref) {
		throw new Error('ref must be a non-empty string.')
	}
	if (!isProd && !isObj(query)) throw new Error('query must be an object.')

	return request('/journeys/legs/' + ref, query)
}

const locations = (query, params = {}) => {
	if (!isProd && 'string' !== typeof query || !query) {
		throw new Error('query must be a non-empty string.')
	}
	if (!isProd && !isObj(params)) throw new Error('params must be an object.')

	params = Object.assign({}, params)
	params.query = query
	return request('/locations', params)
}

const map = (type, query = {}) => {
	if (!isProd && 'string' !== typeof type || !type) {
		throw new Error('type must be a non-empty string.')
	}
	if (!isProd && !isObj(params)) throw new Error('params must be an object.')

	return request('/maps/' + type, query, new PassThrough())
}

const radar = (north, west, south, east, query = {}) => {
	if ('number' !== typeof north) throw new Error('north must be a number')
	if ('number' !== typeof west) throw new Error('west must be a number')
	if ('number' !== typeof south) throw new Error('south must be a number')
	if ('number' !== typeof east) throw new Error('east must be a number')
	if (!isProd && !isObj(params)) throw new Error('params must be an object.')

	query = Object.assign({}, query, {north, west, south, east})
	return request('/radar', query)
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
