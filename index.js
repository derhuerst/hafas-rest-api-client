'use strict'

const got = require('got')
const ndjson = require('ndjson').parse



const endpoint = 'https://transport.rest'

const request = (route, query, stream) => {
	if ('string' !== typeof route) throw new Error('route must be a string')
	if ('object' !== typeof query) throw new Error('query must be an object')

	const url = endpoint + route
	const headers = {'user-agent': 'vbb-client'}
	if ('identifier' in query) headers['x-identifier'] = query.identifier
	if (stream === true) return got.stream(url, {query, headers})
	const body = (res) => res.body
	return got(url, {query, headers, json: true}).then(body, body)
}



const stations = (q) => {
	q = q || {}
	if (q.completion === true)
		return request('/stations', q, false)
	return request('/stations', q, true).pipe(ndjson())
}

const nearby = (q) =>
	request('/stations/nearby', q || {})



const station = (id, q) => {
	if ('number' !== typeof id) throw new Error('id must be a number')
	return request('/stations/' + id, q || {})
}

const departures = (id, q) => {
	if ('number' !== typeof id) throw new Error('id must be a number')
	q = q || {}
	if ('when' in q) q.when = Math.round(q.when / 1000)
	return request(`/stations/${id}/departures`, q)
	.then((deps) => {
		for (let dep of deps) dep.when = new Date(dep.when * 1000)
		return deps
	}, (err) => err)
}



const lines = (q) =>
	request('/lines', q || {}, true).pipe(ndjson())

const line = (id, q) => {
	if ('number' !== typeof id) throw new Error('id must be a number')
	return request('/lines/' + id, q || {})
}


const location = (l, t, q) => {
	q = q || {}
	if ('number' === typeof l) {
		q[t] = l
		return q
	}
	if (l.type === 'poi' || l.type === 'address') {
		q[t + '.name'] = l.name
		q[t + '.longitude'] = l.longitude
		q[t + '.latitude'] = l.latitude
		if (l.type === 'poi') q[t + '.id'] = l.id
		return q
	}
	throw new Error('valid station, address or poi required.')
}

const routes = (from, to, q) => {
	q = q || {}
	Object.assign(q, location(from, 'from'), location(to, 'to'))
	if ('when' in q) q.when = Math.round(q.when / 1000)
	return request('/routes', q)
	.then((routes) => {
		for (let route of routes) {
			route.start = new Date(route.start * 1000)
			route.end = new Date(route.end * 1000)
			for (let part of route.parts) {
				part.start = new Date(part.start * 1000)
				part.end = new Date(part.end * 1000)
			}
		}
		return routes
	}, (err) => err)
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



module.exports = {
	stations, nearby,
	station, departures,
	lines, line,
	routes,
	locations,
	map
}
