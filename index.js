'use strict'

import stringifyQuery from 'qs/lib/stringify.js'
import ky from 'ky-universal'
import {parse as parseContentType} from 'content-type'
import createDebug from 'debug'

const debug = createDebug('hafas-rest-api-client')

const RESPONSE = Symbol('Response')
const HEADERS = Symbol('Response.headers')
const SERVER_TIMING = Symbol('Server-Timing header')
const CACHE = Symbol('X-Cache header')

const createClient = (endpoint, opt = {}) => {
	new URL(endpoint); // throws if endpoint URL is invalid

	const {
		userAgent,
	} = {
		userAgent: 'hafas-rest-api-client',
	}

	const request = async (path, query = {}, opt = {}) => {
		const url = new URL(path, endpoint)

		const cfg = {
			mode: 'cors',
			redirect: 'follow',
			searchParams: stringifyQuery(Object.fromEntries([
				...url.searchParams.entries(),
				...Object.entries(query),
			]), {allowDots: true}),
			...opt,
			headers: {
				'Accept': 'application/json',
				'User-Agent': userAgent,
				...(opt.headers || {}),
			},
		}

		let res
		try {
			res = await ky.get(url.href, cfg)
			debug(res.status, path, query, opt)
		} catch (err) {
			// parse JSON body, attach to error object
			try {
				const headers = err.response && err.response.headers
				const cType = headers && headers.get('content-type')
				if (cType && parseContentType(cType).type === 'application/json') {
					err.body = await err.response.json()
					if (err.body.msg) err.message += ' – ' + err.body.msg
				}
			// eslint-disable-next-line no-empty
			} catch (_) {}
			throw err
		}

		const body = await res.json()
		Object.defineProperty(body, RESPONSE, {value: res})
		Object.defineProperty(body, HEADERS, {value: res.headers})
		Object.defineProperty(body, SERVER_TIMING, {
			value: res.headers.get('Server-Timing') || null,
		})
		Object.defineProperty(body, CACHE, {
			value: res.headers.get('X-Cache') || null,
		})
		return body
	}

	const locations = async (query, opt = {}) => {
		return await request('/locations', {
			query,
			...opt,
		})
	}

	const nearby = async (loc, opt = {}) => {
		return await request('/stops/nearby', {
			...loc,
			...opt,
		})
	}

	const stations = async (query, opt = {}) => {
		return await request('/stations', {
			...opt,
			query,
		})
	}

	const reachableFrom = async (loc, opt = {}) => {
		return await request('/stops/reachable-from', {
			...loc,
			...opt,
		})
	}

	const stop = async (id, opt = {}) => {
		if (!id) throw new TypeError('invalid id')
		return await request('/stops/' + encodeURIComponent(id), opt)
	}

	const _stationBoard = (type) => async (stop, opt = {}) => {
		if (!stop) throw new TypeError('invalid stop')
		if (stop.id) stop = stop.id
		else if ('string' !== typeof stop) throw new TypeError('invalid stop')
		return await request(`/stops/${encodeURIComponent(stop)}/departures`, opt)
	}
	const departures = _stationBoard('departures')
	const arrivals = _stationBoard('arrivals')

	const journeys = async (from, to, opt = {}) => {
		return await request('/journeys', {
			from, to,
			...opt,
		})
	}

	const refreshJourney = async (ref, opt = {}) => {
		if (!ref) throw new TypeError('invalid ref')
		return await request('/journeys/' + encodeURIComponent(ref), opt)
	}

	const trip = async (id, lineName, opt = {}) => {
		if (!id) throw new TypeError('invalid id')
		return await request('/trips/' + encodeURIComponent(id), {
			lineName,
			...opt,
		})
	}

	const radar = async (bbox, opt = {}) => {
		return await request('/radar', {
			...bbox,
			...opt,
		})
	}

	return {
		locations,
		nearby,
		stations,
		reachableFrom,
		stop,
		departures, arrivals,
		journeys,
		refreshJourney,
		trip,
		radar,
	}
}

export default createClient
export {
	RESPONSE,
	HEADERS,
	SERVER_TIMING,
	CACHE,
}
