'use strict'

import createClient, {SERVER_TIMING, CACHE} from './index.js'
import {inspect} from 'util'

const vbbClient = createClient('https://v6.vbb.transport.rest', {
	userAgent: 'hafas-rest-api-client example',
})

vbbClient.journeys('900100705', '900096197', {results: 1})
.then((res) => {
	console.log(inspect(res.journeys, {depth: null, colors: true}))

	console.log('server-timing', res[SERVER_TIMING])
	console.log('server cache', res[CACHE])
})
.catch((err) => {
	console.error(err)
	process.exit(1)
})
