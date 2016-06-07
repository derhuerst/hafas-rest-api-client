'use strict'

const got = require('got')
const ndjson = require('ndjson').parse



const endpoint = 'https://vbb-rest.do.jannisr.de'

const request = (route, query, stream) => {
	if ('string' !== typeof route) throw new Error('route must be a string')
	if ('object' !== typeof query) throw new Error('query must be an object')

	const url = endpoint + route
	if (stream === true) return got.stream(url, {query})
	const body = (res) => res.body
	return got(url, {query, json: true}).then(body, body)
}



const stations = (q) => {
	q = q || {}
	if (q.completion === true)
		return request('/stations', q, false)
	return request('/stations', q, true).pipe(ndjson())
}

const nearby = (q) =>
	request('/stations/nearby', q || {})



const station = (id) => {
	if ('number' !== typeof id) throw new Error('id must be a number')
	return request('/stations/' + id, {})
}

const departures = (id, q) => {
	if ('number' !== typeof id) throw new Error('id must be a number')
	q = q || {}
	if ('when' in q) q.when /= 1000
	return request(`/stations/${id}/departures`, q)
	.then((deps) => {
		for (let dep of deps) dep.when = new Date(dep.when * 1000)
		return deps
	}, (err) => err)
}



const lines = (q) =>
	request('/lines', q || {}, true).pipe(ndjson())

const line = (id) => {
	if ('number' !== typeof id) throw new Error('id must be a number')
	return request('/lines/' + id, {})
}



const routes = (from, to, q) => {
	if ('number' !== typeof from) throw new Error('from must be a number')
	if ('number' !== typeof to) throw new Error('to must be a number')
	q = q || {}
	q.from = from
	q.to = to
	if ('when' in q) q.when /= 1000
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



const map = (type) => {
	if ('string' !== typeof type) throw new Error('type must be a string')
	return request('/maps/' + type, {}, true)
}



module.exports = {
	stations, nearby,
	station, departures,
	lines, line,
	routes,
	map
}
