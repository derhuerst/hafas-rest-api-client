'use strict'

const createClient = require('.')
const {inspect} = require('util')

const vbbClient = createClient('https://v5.vbb.transport.rest', {
	userAgent: 'hafas-rest-api-client example',
})

vbbClient.journeys('900000003201', '900000024101', {results: 1})
.then((res) => {
	console.log(inspect(res.journeys, {depth: null, colors: true}))

	console.log('server-timing', res[createClient.SERVER_TIMING])
	console.log('server cache', res[createClient.CACHE])
})
.catch((err) => {
	console.error(err)
	process.exit(1)
})
