'use strict'

const qs = require('querystring')
const Promise = require('pinkie-promise')
const {fetch} = require('fetch-ponyfill')({Promise})

const defaults = {
	endpoint: 'https://2.vbb.transport.rest',
	userAgent: 'https://github.com/derhuerst/vbb-client',
}

const request = (config, route, query, outStream) => {
	if ('string' !== typeof route) throw new Error('route must be a string')
	if ('object' !== typeof query) throw new Error('query must be an object')

	query = Object.assign({}, query)
	const headers = {}
	if (!process.browser) headers['User-Agent'] = config.userAgent
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

	const req = fetch(config.endpoint + route + '?' + qs.stringify(query), {
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

	if (outStream) {
		const onError = err => outStream.destroy(err)
		req
			.then((res) => {
				res.body.once('error', onError)
				res.body.pipe(outStream)
			})
			.catch(onError)

		return outStream
	} else {
		return req
			.then(res => res.json())
	}
}

const constructor = (customConfig) => {
	const config = Object.assign({}, defaults, customConfig)

	return request.bind(null, config);
}

module.exports = constructor
