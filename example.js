'use strict'

const {inspect} = require('util')

const vbb = require('.')()

vbb.journeys('900000003201', '900000024101', {results: 1})
.then((data) => {
	console.log(inspect(data, {depth: Infinity}))
})
.catch((err) => {
	console.error(err)
	process.exit(1)
})
