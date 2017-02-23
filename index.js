const debug = require('debug')('currency');
const request = require('request-promise');
const Promise = require('bluebird');
const moment = require('moment');
const URL = 'https://sdw-wsrest.ecb.europa.eu/service/data/EXR/D..EUR.SP00.A?lastNObservations=1&detail=dataonly&';

function transform(data) {
	const series = data.dataSets[0].series;
	const countries = data.structure.dimensions.series[1].values;
	let result = { EUR: 1	};
	let step = 0;
	for (const country of countries ) {
		result[country.id] = series[`0:${step++}:0:0:0`].observations[0][0];
	}

	return result;
}

function fetch(
		base='TWD',
		startPeriod=moment().subtract(14, 'days').format('YYYY-MM-DD'),
		endPeriod=moment().format('YYYY-MM-DD')) {
	debug(`startPeriod=${startPeriod}&endPeriod=${endPeriod}`);
	return request.get({
			url: URL + `startPeriod=${startPeriod}&endPeriod=${endPeriod}`,
			json:true
		})
		.then(transform)
		.then(data => Object.assign(
				...Object.keys(data).map(k => ({[k]: data[k] / data[base] }))
			)
		);
}

module.exports = fetch;
